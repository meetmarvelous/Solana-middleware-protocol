import { describe, expect, it, vi } from "vitest";
import { executeWithRetry } from "./retry";

describe("executeWithRetry", () => {
    it("runs the retry loop until an RPC failure recovers", async () => {
        const operation = vi
            .fn()
            .mockRejectedValueOnce(new Error("rpc timeout"))
            .mockResolvedValueOnce("confirmed-signature");

        const result = await executeWithRetry(operation, { maxRetries: 2 });

        expect(result.result).toBe("confirmed-signature");
        expect(result.attempts).toBe(2);
        expect(result.states.map((state) => state.status)).toEqual([
            "started",
            "failed",
            "retrying",
            "started",
            "succeeded",
        ]);
    });

    it("recovers from expired blockhashes and emits state transitions", async () => {
        const onStateChange = vi.fn();
        const operation = vi
            .fn()
            .mockRejectedValueOnce(new Error("Blockhash not found"))
            .mockResolvedValueOnce("fresh-blockhash-signature");

        await executeWithRetry(operation, { maxRetries: 1, onStateChange });

        expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({
            status: "failed",
            reason: "BLOCKHASH_EXPIRED",
        }));
    });

    it("stops at the retry count limit", async () => {
        const operation = vi.fn().mockRejectedValue(new Error("confirmation timeout"));

        await expect(executeWithRetry(operation, { maxRetries: 2 })).rejects.toThrow("confirmation timeout");
        expect(operation).toHaveBeenCalledTimes(3);
    });

    it("does not retry rejected transactions by default", async () => {
        const operation = vi.fn().mockRejectedValue(new Error("transaction rejected by runtime"));

        await expect(executeWithRetry(operation, { maxRetries: 3 })).rejects.toThrow("transaction rejected");
        expect(operation).toHaveBeenCalledTimes(1);
    });
});
