import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmTx } from "./confirmTx";

const state = vi.hoisted(() => ({
    blockHeights: [] as number[],
    statuses: [] as string[],
}));

vi.mock("@repo/rpc-client", () => ({
    getTxStatus: vi.fn(async () => state.statuses.shift() ?? "pending"),
}));

vi.mock("@solana/web3.js", () => ({
    Connection: class MockConnection {
        async getBlockHeight() {
            return state.blockHeights.shift() ?? 1;
        }
    },
}));

describe("ConfirmTx", () => {
    beforeEach(() => {
        state.blockHeights = [1];
        state.statuses = ["confirmed"];
    });

    it("tracks a transaction through partial confirmations to confirmed", async () => {
        vi.useFakeTimers();
        state.blockHeights = [1, 2];
        state.statuses = ["pending", "confirmed"];

        const pending = ConfirmTx({ url: "https://rpc" }, "5signature", 10, 100, 1_000);
        await vi.advanceTimersByTimeAsync(100);

        await expect(pending).resolves.toEqual({ success: true, signature: "5signature" });
    });

    it("detects expired blockhashes before confirmation", async () => {
        state.blockHeights = [101];

        await expect(ConfirmTx({ url: "https://rpc" }, "5signature", 100, 1, 10)).resolves.toEqual({
            success: false,
            signature: "5signature",
            error: "expired",
        });
    });
});
