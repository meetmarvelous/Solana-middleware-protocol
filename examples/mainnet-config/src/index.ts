import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { SendraOptions, SendraParams, Signer } from "sendra-tx";

config();

type Network = "mainnet" | "devnet";

export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function collectMainnetRpcUrls(): string[] {
  return Object.entries(process.env)
    .filter(([key, value]) => key.startsWith("SENDRA_MAINNET_URL_") && Boolean(value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value as string);
}

export function loadKeypair(): Keypair {
  const secretJson = process.env.SENDER_SECRET_KEY
    ?? (process.env.SENDER_KEYPAIR_PATH ? readFileSync(process.env.SENDER_KEYPAIR_PATH, "utf8") : undefined);

  if (!secretJson) throw new Error("Set SENDER_SECRET_KEY or SENDER_KEYPAIR_PATH");

  const secret = JSON.parse(secretJson) as number[];
  if (!Array.isArray(secret) || secret.length !== 64) {
    throw new Error("Sender secret key must be a 64-byte Solana keypair JSON array");
  }
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

export function readNetwork(): Network {
  const network = (process.env.NETWORK ?? "mainnet") as Network;
  if (network !== "mainnet") {
    throw new Error("This example is for mainnet. Set NETWORK=mainnet.");
  }
  return network;
}

export function createSigner(sender: Keypair): Signer {
  return {
    publicKey: sender.publicKey,
    async signTransaction(tx) {
      tx.sign([sender]);
      return tx;
    },
  };
}

export function createTransferParams(recipient: PublicKey, transferSol: number): SendraParams {
  if (recipient.equals(PublicKey.default)) {
    throw new Error("Set RECIPIENT_PUBLIC_KEY to a real recipient before running this example");
  }

  return {
    type: "params",
    to: recipient,
    amount: Math.round(transferSol * LAMPORTS_PER_SOL),
  };
}

export function createOptions(maxRetries = Number(process.env.MAX_RETRIES ?? "5")): SendraOptions {
  return {
    maxRetries,
    logger(event) {
      console.log(JSON.stringify({
        step: event.step,
        rpc: event.rpc,
        attempt: event.attempt,
        fee: event.fee,
        message: event.message,
      }));
    },
  };
}

export async function main() {
  const network = readNetwork();
  const rpcUrls = collectMainnetRpcUrls();
  if (rpcUrls.length < 2) {
    throw new Error("Configure at least two SENDRA_MAINNET_URL_* values for production routing");
  }

  const maxRetries = Number(process.env.MAX_RETRIES ?? "5");
  const transferSol = Number(process.env.TRANSFER_SOL ?? "0.000001");
  const recipient = new PublicKey(required("RECIPIENT_PUBLIC_KEY"));
  const sender = loadKeypair();

  console.log("Production Sendra configuration");
  console.log(`Network: ${network}`);
  console.log(`RPC providers: ${rpcUrls.length}`);
  console.log(`Max retries: ${maxRetries}`);
  console.log(`Sender: ${sender.publicKey.toBase58()}`);
  console.log(`Recipient: ${recipient.toBase58()}`);
  console.log(`Transfer: ${transferSol} SOL`);

  if (process.env.CONFIRM_MAINNET_SEND !== "true") {
    console.log("Dry run only. Set CONFIRM_MAINNET_SEND=true to broadcast on mainnet.");
    return { dryRun: true, network, rpcCount: rpcUrls.length, maxRetries };
  }

  const { SendWithReliability } = await import("sendra-tx");
  const params = createTransferParams(recipient, transferSol);
  const result = await SendWithReliability(params, createSigner(sender), createOptions(maxRetries), network);

  console.log("Mainnet result:", result);
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
