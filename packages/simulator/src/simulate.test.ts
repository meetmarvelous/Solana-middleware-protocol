import { beforeEach, describe, expect, it, vi } from "vitest";
import { SimulateTx } from "./simulate";

const state = vi.hoisted(() => ({
    simulateTransaction: vi.fn(),
    deserialized: { serialize: vi.fn(() => new Uint8Array([1, 2, 3])) },
}));

vi.mock("@solana/web3.js", () => ({
    Connection: class MockConnection {
        simulateTransaction = state.simulateTransaction;
    },
    VersionedTransaction: {
        deserialize: vi.fn(() => state.deserialized),
    },
}));

describe("SimulateTx", () => {
    beforeEach(() => {
        state.simulateTransaction.mockReset();
        vi.spyOn(console, "log").mockImplementation(() => undefined);
    });

    it("returns a successful simulation result with logs", async () => {
        state.simulateTransaction.mockResolvedValue({ value: { err: null, logs: ["ok"] } });

        const result = await SimulateTx(state.deserialized as any, { url: "https://rpc" }, {} as any);

        expect(result).toEqual({
            success: true,
            error: "none",
            logs: ["ok"],
            transaction: state.deserialized,
        });
    });

    it("surfaces transaction rejection details from simulation", async () => {
        state.simulateTransaction.mockResolvedValue({ value: { err: { InstructionError: [0, "Custom"] }, logs: ["failed"] } });

        const result = await SimulateTx(state.deserialized as any, { url: "https://rpc" }, {} as any);

        expect(result.success).toBe(false);
        expect(result.error).toContain("InstructionError");
        expect(result.logs).toEqual(["failed"]);
    });
});
