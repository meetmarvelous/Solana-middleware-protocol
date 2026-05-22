import { beforeEach, describe, expect, it, vi } from "vitest";
import { optimizeFee } from "./optimize";

const state = vi.hoisted(() => ({
    recentFees: vi.fn(),
    applyPriorityFee: vi.fn(async (tx: unknown, fee: number) => ({ tx, appliedFee: fee })),
}));

vi.mock("@solana/web3.js", () => ({
    Connection: class MockConnection {
        getRecentPrioritizationFees = state.recentFees;
    },
}));

vi.mock("@repo/tx-builder", () => ({
    applyPriorityFee: state.applyPriorityFee,
}));

describe("optimizeFee", () => {
    beforeEach(() => {
        state.recentFees.mockReset();
        state.applyPriorityFee.mockClear();
        vi.spyOn(console, "log").mockImplementation(() => undefined);
    });

    it("uses the median recent priority fee for the first send", async () => {
        state.recentFees.mockResolvedValue([
            { prioritizationFee: 0 },
            { prioritizationFee: 500 },
            { prioritizationFee: 100 },
            { prioritizationFee: 300 },
        ]);

        const result = await optimizeFee({} as any, { url: "https://rpc" });

        expect(result.fee).toBe(300);
        expect(state.applyPriorityFee).toHaveBeenCalledWith({}, 300);
    });

    it("increases retry fees using the larger of 1.3x previous fee and p75 network fees", async () => {
        state.recentFees.mockResolvedValue([
            { prioritizationFee: 100 },
            { prioritizationFee: 300 },
            { prioritizationFee: 700 },
            { prioritizationFee: 900 },
        ]);

        const result = await optimizeFee({} as any, { url: "https://rpc" }, 400);

        expect(result.fee).toBe(900);
        expect(state.applyPriorityFee).toHaveBeenCalledWith({}, 900);
    });

    it("wraps malformed RPC fee responses with optimizer context", async () => {
        state.recentFees.mockRejectedValue(new Error("malformed RPC response"));

        await expect(optimizeFee({} as any, { url: "https://rpc" })).rejects.toThrow("Error from OptimizeFee");
    });
});
