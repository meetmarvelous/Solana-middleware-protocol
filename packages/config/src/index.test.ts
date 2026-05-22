import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

describe("@repo/config RPC environment parsing", () => {
    afterEach(() => {
        process.env = { ...originalEnv };
        vi.resetModules();
    });

    it("uses default Solana RPC endpoints when no Sendra env vars are configured", async () => {
        delete process.env.SENDRA_DEVNET_URL_1;
        delete process.env.SENDRA_MAINNET_URL_1;

        const config = await import("./index");

        expect(config.DEVNET_RPC_URLS).toEqual(["https://api.devnet.solana.com"]);
        expect(config.MAINNET_RPC_URLS).toEqual(["https://api.mainnet-beta.solana.com"]);
    });

    it("builds dynamic devnet and mainnet pools from environment variables", async () => {
        process.env.SENDRA_DEVNET_URL_1 = "https://devnet-a";
        process.env.SENDRA_DEVNET_URL_2 = "https://devnet-b";
        process.env.SENDRA_MAINNET_URL_1 = "https://mainnet-a";

        const config = await import("./index");

        expect(config.DEVNET_RPC_URLS).toEqual(["https://devnet-a", "https://devnet-b"]);
        expect(config.MAINNET_RPC_URLS).toEqual(["https://mainnet-a"]);
    });
});
