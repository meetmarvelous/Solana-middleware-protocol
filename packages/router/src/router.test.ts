import { beforeEach, describe, expect, it, vi } from "vitest";
import { selectRpc } from "./router";

const rpcState = vi.hoisted(() => ({
    calls: [] as string[],
    latency: new Map<string, number>(),
    failures: new Set<string>(),
}));

vi.mock("@repo/config", () => ({
    DEVNET_RPC_URLS: ["https://devnet-slow", "https://devnet-fast", "https://devnet-down"],
    MAINNET_RPC_URLS: ["https://mainnet-a", "https://mainnet-b"],
}));

vi.mock("@solana/web3.js", () => ({
    Connection: class MockConnection {
        constructor(private readonly url: string) {}

        async getLatestBlockhash() {
            rpcState.calls.push(this.url);
            const latency = rpcState.latency.get(this.url) ?? 0;
            if (latency > 0) {
                await new Promise((resolve) => setTimeout(resolve, latency));
            }
            if (rpcState.failures.has(this.url)) {
                throw new Error(`RPC unavailable: ${this.url}`);
            }
            return { blockhash: `${this.url}-blockhash`, lastValidBlockHeight: 100 };
        }
    },
}));

describe("selectRpc", () => {
    beforeEach(() => {
        rpcState.calls = [];
        rpcState.latency = new Map([
            ["https://devnet-slow", 20],
            ["https://devnet-fast", 1],
            ["https://devnet-down", 2],
            ["https://mainnet-a", 12],
            ["https://mainnet-b", 3],
        ]);
        rpcState.failures = new Set();
    });

    it("selects the fastest healthy RPC by measured latency", async () => {
        const selected = await selectRpc("devnet");

        expect(selected.url).toBe("https://devnet-fast");
        expect(selected.successRate).toBe(true);
        expect(selected.latency).toBeLessThan(20);
    });

    it("filters unhealthy RPCs and fails over to the next fastest endpoint", async () => {
        rpcState.failures.add("https://devnet-fast");

        const selected = await selectRpc("devnet");

        expect(selected.url).toBe("https://devnet-down");
        expect(rpcState.calls).toEqual(expect.arrayContaining([
            "https://devnet-slow",
            "https://devnet-fast",
            "https://devnet-down",
        ]));
    });

    it("returns an unavailable sentinel when the dynamic RPC pool is fully unhealthy", async () => {
        rpcState.failures = new Set(["https://devnet-slow", "https://devnet-fast", "https://devnet-down"]);

        await expect(selectRpc("devnet")).resolves.toEqual({
            url: "No RPC Available",
            latency: 0,
            successRate: false,
        });
    });

    it("switches RPC pools by network", async () => {
        const mainnet = await selectRpc("mainnet");

        expect(mainnet.url).toBe("https://mainnet-b");
        expect(rpcState.calls).toEqual(["https://mainnet-a", "https://mainnet-b"]);
    });
});
