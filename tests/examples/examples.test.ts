import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Keypair, PublicKey } from "@solana/web3.js";

const sendraMock = vi.hoisted(() => ({
  SendWithReliability: vi.fn(),
}));

vi.mock("sendra-tx", () => ({
  SendWithReliability: sendraMock.SendWithReliability,
}));

vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

describe("examples", () => {
  const exampleProjects = [
    "basic-transfer",
    "mainnet-config",
    "custom-rpc",
    "logger-usage",
    "failure-recovery",
  ];

  it.each(exampleProjects)("documents and packages %s", async (project) => {
    const root = join(process.cwd(), "examples", project);
    const readme = await readFile(join(root, "README.md"), "utf8");
    const env = await readFile(join(root, ".env.example"), "utf8");
    const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
    };
    const source = await readFile(join(root, "src", "index.ts"), "utf8");

    expect(readme).toContain("Install");
    expect(readme).toContain("Run");
    expect(env).toMatch(/SENDRA_(DEVNET|MAINNET)_URL_1/);
    expect(packageJson.scripts.dev).toBe("tsx src/index.ts");
    expect(packageJson.dependencies["sendra-tx"]).toBeDefined();
    expect(source).toContain("SendWithReliability");
    expect(source).toContain("export async function main");
    expect(source).toContain('await import("sendra-tx")');
  });
});

describe("example smoke tests", () => {
  const originalEnv = { ...process.env };
  let consoleLog: ReturnType<typeof vi.spyOn>;
  let sender: Keypair;
  let recipient: PublicKey;

  beforeEach(() => {
    vi.resetModules();
    sender = Keypair.generate();
    recipient = Keypair.generate().publicKey;
    process.env = { ...originalEnv };
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("SENDRA_DEVNET_URL_") || key.startsWith("SENDRA_MAINNET_URL_")) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, {
      SENDER_SECRET_KEY: JSON.stringify(Array.from(sender.secretKey)),
      RECIPIENT_PUBLIC_KEY: recipient.toBase58(),
      TRANSFER_SOL: "0.001",
      MAX_RETRIES: "7",
      SENDRA_DEVNET_URL_1: "http://127.0.0.1:8899",
      SENDRA_DEVNET_URL_2: "https://api.devnet.solana.com",
      SENDRA_MAINNET_URL_1: "https://mainnet.helius-rpc.com/?api-key=test",
      SENDRA_MAINNET_URL_2: "https://quicknode.example",
    });
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
    sendraMock.SendWithReliability.mockReset();
    sendraMock.SendWithReliability.mockImplementation(async (_params, _signer, options, network) => {
      options.logger?.({
        step: "RPC_SELECTED",
        rpc: network === "mainnet" ? "https://quicknode.example" : "https://api.devnet.solana.com",
        latency: 5,
        attempt: 0,
      });
      options.logger?.({ step: "TX_CONFIRMED", message: "mock-signature" });
      return {
        success: true,
        signature: "mock-signature",
        explorerLink: `https://explorer.solana.com/tx/mock-signature${network === "devnet" ? "?cluster=devnet" : ""}`,
      };
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleLog.mockRestore();
  });

  it("imports and exports the expected example entrypoints", async () => {
    const basic = await import("../../examples/basic-transfer/src/index");
    const mainnet = await import("../../examples/mainnet-config/src/index");
    const customRpc = await import("../../examples/custom-rpc/src/index");
    const logger = await import("../../examples/logger-usage/src/index");
    const recovery = await import("../../examples/failure-recovery/src/index");

    expect(basic.main).toEqual(expect.any(Function));
    expect(basic.createTransferParams).toEqual(expect.any(Function));
    expect(mainnet.collectMainnetRpcUrls).toEqual(expect.any(Function));
    expect(customRpc.configuredDevnetRpcs).toEqual(expect.any(Function));
    expect(logger.createLogger).toEqual(expect.any(Function));
    expect(recovery.printRecoveryEvent).toEqual(expect.any(Function));
  });

  it("smoke-runs basic-transfer with mocked Sendra execution", async () => {
    const example = await import("../../examples/basic-transfer/src/index");

    await expect(example.main()).resolves.toEqual(expect.objectContaining({
      success: true,
      explorerLink: "https://explorer.solana.com/tx/mock-signature?cluster=devnet",
    }));

    expect(example.createOptions().maxRetries).toBe(7);
    expect(sendraMock.SendWithReliability).toHaveBeenCalledWith(
      expect.objectContaining({ type: "params", amount: 1_000_000 }),
      expect.objectContaining({ publicKey: sender.publicKey }),
      expect.objectContaining({ maxRetries: 7, logger: expect.any(Function) }),
      "devnet",
    );
  });

  it("smoke-runs mainnet-config in dry mode without importing network execution", async () => {
    process.env.CONFIRM_MAINNET_SEND = "false";
    const example = await import("../../examples/mainnet-config/src/index");

    await expect(example.main()).resolves.toEqual({
      dryRun: true,
      network: "mainnet",
      rpcCount: 2,
      maxRetries: 7,
    });

    expect(example.collectMainnetRpcUrls()).toEqual([
      "https://mainnet.helius-rpc.com/?api-key=test",
      "https://quicknode.example",
    ]);
    expect(example.createOptions(undefined).maxRetries).toBe(7);
    expect(sendraMock.SendWithReliability).not.toHaveBeenCalled();
  });

  it("smoke-runs custom-rpc and validates dynamic devnet RPC parsing", async () => {
    const example = await import("../../examples/custom-rpc/src/index");

    expect(example.configuredDevnetRpcs()).toEqual([
      "http://127.0.0.1:8899",
      "https://api.devnet.solana.com",
    ]);
    await expect(example.main()).resolves.toEqual(expect.objectContaining({ success: true }));

    const options = example.createOptions(4);
    expect(options.maxRetries).toBe(4);
    options.logger?.({ step: "RPC_SELECTED", rpc: "https://api.devnet.solana.com", latency: 12 } as any);
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining("latency=12ms"));
  });

  it("smoke-runs logger-usage and captures traces plus explorer links", async () => {
    const example = await import("../../examples/logger-usage/src/index");
    const captured: any[] = [];
    const logger = example.createLogger(captured);

    logger?.({ step: "TX_SENT", rpc: "https://api.devnet.solana.com", attempt: 1 });
    expect(captured).toEqual([expect.objectContaining({ step: "TX_SENT" })]);

    const output = await example.main();

    expect(output.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ step: "RPC_SELECTED" }),
      expect.objectContaining({ step: "TX_CONFIRMED", message: "mock-signature" }),
    ]));
    expect(output.result.explorerLink).toBe("https://explorer.solana.com/tx/mock-signature?cluster=devnet");
  });

  it("smoke-runs failure-recovery with mocked failover events and retry defaults", async () => {
    delete process.env.MAX_RETRIES;
    const example = await import("../../examples/failure-recovery/src/index");

    expect(example.devnetRpcPool()).toEqual([
      "http://127.0.0.1:8899",
      "https://api.devnet.solana.com",
    ]);
    expect(example.createOptions().maxRetries).toBe(4);
    await expect(example.main()).resolves.toEqual(expect.objectContaining({ success: true }));

    expect(consoleLog).toHaveBeenCalledWith("[recovery]", expect.objectContaining({
      step: "RPC_SELECTED",
      rpc: "https://api.devnet.solana.com",
      latency: 5,
    }));
  });

  it("fails safely when required env or RPC config is missing", async () => {
    const basic = await import("../../examples/basic-transfer/src/index");
    const customRpc = await import("../../examples/custom-rpc/src/index");
    const mainnet = await import("../../examples/mainnet-config/src/index");

    delete process.env.RECIPIENT_PUBLIC_KEY;
    expect(() => basic.readRequiredEnv("RECIPIENT_PUBLIC_KEY")).toThrow("Missing required environment variable");

    process.env.RECIPIENT_PUBLIC_KEY = PublicKey.default.toBase58();
    expect(() => basic.createTransferParams(PublicKey.default, 0.001)).toThrow("real recipient");

    process.env.RECIPIENT_PUBLIC_KEY = recipient.toBase58();
    delete process.env.SENDRA_DEVNET_URL_2;
    await expect(customRpc.main()).rejects.toThrow("at least two SENDRA_DEVNET_URL");

    delete process.env.SENDRA_MAINNET_URL_2;
    await expect(mainnet.main()).rejects.toThrow("at least two SENDRA_MAINNET_URL");
  });
});
