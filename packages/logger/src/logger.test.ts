import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileLogger } from "./fileLogger";
import { classifyFailure } from "./confirmTx";
import { logEvent } from "./logger";

describe("logger", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it("generates structured console logs for transaction signatures and explorer links", () => {
        const logs: any[] = [];

        logEvent({
            step: "TX_CONFIRMED",
            rpc: "https://api.devnet.solana.com",
            message: "5signature",
        }, logs);

        expect(logs).toEqual([expect.objectContaining({ step: "TX_CONFIRMED", message: "5signature" })]);
        expect(consoleSpy.mock.calls[0]?.[0]).toContain("https://explorer.solana.com/tx/5signature?cluster=devnet");
    });

    it("logs retries, failure classification, and action decisions", () => {
        logEvent({ step: "RETRY_ATTEMPT", attempt: 2 });
        logEvent({ step: "RETRY_FAILED_REASON", attempt: 2, message: "RPC_ERROR" });
        logEvent({ step: "ACTION", message: "SWITCH_RPC" });

        expect(consoleSpy.mock.calls.map((call) => call[0]).join("\n")).toContain("Retry attempt #2");
        expect(consoleSpy.mock.calls.map((call) => call[0]).join("\n")).toContain("Failure classified");
        expect(consoleSpy.mock.calls.map((call) => call[0]).join("\n")).toContain("Switching to different RPC endpoint");
    });

    it("classifies blockhash, RPC, confirmation, and unknown failures", () => {
        expect(classifyFailure(new Error("Blockhash not found"), null)).toBe("BLOCKHASH_EXPIRED");
        expect(classifyFailure(new Error("fetch timeout from rpc"), null)).toBe("RPC_ERROR");
        expect(classifyFailure(null, { success: false })).toBe("CONGESTION");
        expect(classifyFailure(new Error("custom"), null)).toBe("UNKNOWN");
    });
});

describe("FileLogger", () => {
    const originalCwd = process.cwd();
    let workspace: string;

    beforeEach(async () => {
        workspace = await mkdtemp(join(tmpdir(), "sendra-file-logger-"));
        process.chdir(workspace);
    });

    afterEach(async () => {
        process.chdir(originalCwd);
        await rm(workspace, { recursive: true, force: true });
    });

    it("persists transaction lifecycle logs and execution time to disk", async () => {
        const logger = new FileLogger();

        logger.log({ step: "RPC_SELECTED", rpc: "https://api.devnet.solana.com", latency: 12 });
        logger.log({ step: "TX_SENT", rpc: "https://api.devnet.solana.com", attempt: 0 });
        logger.log({ step: "TX_CONFIRMED", rpc: "https://api.devnet.solana.com", message: "5signature" });

        const files = await vi.waitFor(async () => {
            const entries = await readdir(join(workspace, "sendra-logs"));
            expect(entries.length).toBe(1);
            return entries;
        });
        const content = await vi.waitFor(async () => {
            const text = await readFile(join(workspace, "sendra-logs", files[0]!), "utf8");
            expect(text).toContain("Signature: 5signature");
            return text;
        });

        expect(content).toContain("Explorer Link: https://explorer.solana.com/tx/5signature?cluster=devnet");
        expect(content).toContain("Total Execution Time:");
    });
});
