import { beforeEach, describe, expect, it, vi } from "vitest";
import { SendTx } from "./send";
import { getTxStatus } from "./status";

const state = vi.hoisted(() => ({
    sendTransaction: vi.fn(),
    getSignatureStatus: vi.fn(),
}));

vi.mock("@solana/web3.js", () => ({
    Connection: class MockConnection {
        sendTransaction = state.sendTransaction;
        getSignatureStatus = state.getSignatureStatus;
    },
}));

describe("@repo/rpc-client", () => {
    beforeEach(() => {
        state.sendTransaction.mockReset();
        state.getSignatureStatus.mockReset();
        vi.spyOn(console, "log").mockImplementation(() => undefined);
    });

    it("broadcasts transactions with preflight disabled for orchestrated sends", async () => {
        state.sendTransaction.mockResolvedValue("5signature");

        await expect(SendTx({} as any, { url: "https://rpc" })).resolves.toBe("5signature");
        expect(state.sendTransaction).toHaveBeenCalledWith({}, { skipPreflight: true, maxRetries: 0 });
    });

    it("maps malformed and partial confirmation responses to safe statuses", async () => {
        state.getSignatureStatus
            .mockResolvedValueOnce({ value: { confirmationStatus: "processed" } })
            .mockResolvedValueOnce({ value: { confirmationStatus: "finalized" } })
            .mockResolvedValueOnce({ value: { err: { InstructionError: [0, "Custom"] } } })
            .mockResolvedValueOnce({});

        await expect(getTxStatus("sig", { url: "https://rpc" })).resolves.toBe("pending");
        await expect(getTxStatus("sig", { url: "https://rpc" })).resolves.toBe("confirmed");
        await expect(getTxStatus("sig", { url: "https://rpc" })).resolves.toBe("failed");
        await expect(getTxStatus("sig", { url: "https://rpc" })).resolves.toBe("pending");
    });

    it("treats RPC status lookup downtime as failed", async () => {
        state.getSignatureStatus.mockRejectedValue(new Error("network timeout"));

        await expect(getTxStatus("sig", { url: "https://rpc" })).resolves.toBe("failed");
    });
});
