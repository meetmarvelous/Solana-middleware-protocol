import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
    selectRpc: vi.fn(),
    simulateTx: vi.fn(),
    sendTx: vi.fn(),
    buildTx: vi.fn(),
    newTxMessageFromOld: vi.fn(),
    optimizeFee: vi.fn(),
    confirmTx: vi.fn(),
    logEvent: vi.fn((event: unknown, logs?: unknown[], logger?: (event: unknown) => void) => {
        logs?.push(event);
        logger?.(event);
    }),
    fileLoggerLog: vi.fn(),
    fileLoggerClose: vi.fn(),
    blockhashes: vi.fn(),
}));

vi.mock("@repo/router", () => ({ selectRpc: state.selectRpc }));
vi.mock("@repo/simulator", () => ({ SimulateTx: state.simulateTx }));
vi.mock("@repo/rpc-client", () => ({ SendTx: state.sendTx }));
vi.mock("@repo/tx-builder", () => ({
    BuildTx: state.buildTx,
    newTxMessageFromOld: state.newTxMessageFromOld,
}));
vi.mock("@repo/fee-optimizer", () => ({ optimizeFee: state.optimizeFee }));
vi.mock("@repo/logger", () => ({
    ConfirmTx: state.confirmTx,
    classifyFailure: (error: Error | null, confirmResult: { success: boolean } | null) => {
        if (error?.message.toLowerCase().includes("blockhash")) return "BLOCKHASH_EXPIRED";
        if (error?.message.toLowerCase().includes("rpc")) return "RPC_ERROR";
        if (confirmResult && !confirmResult.success) return "CONGESTION";
        return "UNKNOWN";
    },
    FileLogger: class MockFileLogger {
        log = state.fileLoggerLog;
        close = state.fileLoggerClose;
    },
    logEvent: state.logEvent,
}));
vi.mock("@solana/web3.js", () => ({
    Connection: class MockConnection {
        async getLatestBlockhash() {
            return state.blockhashes();
        }
    },
    VersionedTransaction: class MockVersionedTransaction {
        message: any;
        constructor(message: any = { recentBlockhash: "old" }) {
            this.message = message;
        }
        static deserialize() {
            return new MockVersionedTransaction({ recentBlockhash: "deserialized" });
        }
    },
}));

describe("SendWithReliability", () => {
    const signer = {
        publicKey: "sender",
        signTransaction: vi.fn(async (tx) => tx),
    } as any;
    const params = { type: "params", to: "receiver", amount: 1 } as any;

    beforeEach(() => {
        vi.useFakeTimers();
        for (const mock of Object.values(state)) {
            if (typeof mock === "function" && "mockReset" in mock) {
                mock.mockReset();
            }
        }
        signer.signTransaction.mockClear();
        state.selectRpc.mockResolvedValue({ url: "https://rpc-a.devnet", latency: 5, successRate: true });
        state.buildTx.mockResolvedValue({ tx: { message: { recentBlockhash: "built" } }, lastValidBlockHeight: 50 });
        state.optimizeFee.mockImplementation(async (tx: unknown, _rpc: unknown, prevFee?: number) => ({
            transaction: tx,
            fee: prevFee ? Math.floor(prevFee * 1.3) : 100,
        }));
        state.simulateTx.mockImplementation(async (tx: unknown) => ({
            success: true,
            transaction: tx,
            logs: [],
            error: "none",
        }));
        state.sendTx.mockResolvedValue("5signature");
        state.confirmTx.mockResolvedValue({ success: true, signature: "5signature" });
        state.blockhashes.mockResolvedValue({ blockhash: "fresh", lastValidBlockHeight: 75 });
    });

    it("executes the successful transaction lifecycle in order", async () => {
        const { SendWithReliability } = await import("./sendWithReliability");
        const events: any[] = [];

        const result = await SendWithReliability(params, signer, { maxRetries: 2, logger: (event) => events.push(event) }, "devnet");

        expect(result).toEqual(expect.objectContaining({
            success: true,
            signature: "5signature",
            explorerLink: "https://explorer.solana.com/tx/5signature?cluster=devnet",
        }));
        expect(events.map((event) => event.step)).toEqual([
            "RPC_SELECTED",
            "TX_BUILT",
            "FEE_OPTIMIZED",
            "SIMULATION_SUCCESS",
            "TX_SIGNED",
            "TX_SENT",
            "TX_CONFIRMED",
        ]);
        expect(state.confirmTx).toHaveBeenCalledWith(expect.objectContaining({ url: "https://rpc-a.devnet" }), "5signature", 50);
    });

    it("returns a simulation failure before signing or broadcasting", async () => {
        state.simulateTx.mockResolvedValueOnce({ success: false, error: "InstructionError", logs: [], transaction: {} });
        const { SendWithReliability } = await import("./sendWithReliability");

        await expect(SendWithReliability(params, signer, { maxRetries: 2 }, "devnet")).resolves.toEqual({
            success: false,
            error: "InstructionError",
        });

        expect(signer.signTransaction).not.toHaveBeenCalled();
        expect(state.sendTx).not.toHaveBeenCalled();
    });

    it("recovers from confirmation failure by switching RPC and re-optimizing fees", async () => {
        state.selectRpc
            .mockResolvedValueOnce({ url: "https://rpc-a.devnet", latency: 20, successRate: true })
            .mockResolvedValueOnce({ url: "https://rpc-b.devnet", latency: 3, successRate: true });
        state.confirmTx
            .mockResolvedValueOnce({ success: false, signature: "5signature", error: "timeout" })
            .mockResolvedValueOnce({ success: true, signature: "6signature" });
        state.sendTx
            .mockResolvedValueOnce("5signature")
            .mockResolvedValueOnce("6signature");
        const { SendWithReliability } = await import("./sendWithReliability");

        const pending = SendWithReliability(params, signer, { maxRetries: 1 }, "devnet");
        await vi.runAllTimersAsync();
        const result = await pending;

        expect(result).toEqual(expect.objectContaining({ success: true, signature: "6signature" }));
        expect(state.selectRpc).toHaveBeenCalledTimes(2);
        expect(state.optimizeFee).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ url: "https://rpc-b.devnet" }), 100);
    });

    it("rebuilds and retries after an expired blockhash send failure", async () => {
        state.sendTx
            .mockRejectedValueOnce(new Error("Blockhash not found"))
            .mockResolvedValueOnce("retry-signature");
        state.confirmTx.mockResolvedValueOnce({ success: true, signature: "retry-signature" });
        const { SendWithReliability } = await import("./sendWithReliability");

        const pending = SendWithReliability(params, signer, { maxRetries: 1 }, "devnet");
        await vi.runAllTimersAsync();
        const result = await pending;

        expect(result).toEqual(expect.objectContaining({ success: true, signature: "retry-signature" }));
        expect(state.buildTx).toHaveBeenCalledTimes(2);
        expect(state.logEvent).toHaveBeenCalledWith(expect.objectContaining({ step: "BLOCKHASH_EXPIRED" }), expect.any(Array), expect.any(Function));
    });

    it("honors retry count limits", async () => {
        state.confirmTx.mockResolvedValue({ success: false, signature: "5signature", error: "timeout" });
        const { SendWithReliability } = await import("./sendWithReliability");

        const pending = SendWithReliability(params, signer, { maxRetries: 1 }, "devnet");
        await vi.runAllTimersAsync();

        await expect(pending).resolves.toEqual({
            success: false,
            error: "Max retries reached",
            attempts: 1,
        });
    });
});
