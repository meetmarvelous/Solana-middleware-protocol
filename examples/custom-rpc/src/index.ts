import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { SendraOptions, SendraParams, Signer } from "sendra-tx";

config();

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

export function configuredDevnetRpcs(): string[] {
  return Object.entries(process.env)
    .filter(([key, value]) => key.startsWith("SENDRA_DEVNET_URL_") && Boolean(value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value as string);
}

export function createOptions(maxRetries = Number(process.env.MAX_RETRIES ?? "3")): SendraOptions {
  return {
    maxRetries,
    logger(event) {
      if (event.step === "RPC_SELECTED") {
        const latency = (event as typeof event & { latency?: number }).latency;
        console.log(`[router] selected=${event.rpc} latency=${latency ?? "unknown"}ms attempt=${event.attempt ?? 0}`);
        return;
      }

      console.log(`[sendra] ${event.step}`, event.message ?? "");
    },
  };
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

export function createTransferParams(recipient: PublicKey): SendraParams {
  if (recipient.equals(PublicKey.default)) {
    throw new Error("Set RECIPIENT_PUBLIC_KEY to a real recipient before running this example");
  }

  return {
    type: "params",
    to: recipient,
    amount: Math.round(Number(process.env.TRANSFER_SOL ?? "0.001") * LAMPORTS_PER_SOL),
  };
}

export async function main() {
  const rpcPool = configuredDevnetRpcs();
  if (rpcPool.length < 2) {
    throw new Error("Configure at least two SENDRA_DEVNET_URL_* values to demonstrate routing");
  }

  const { SendWithReliability } = await import("sendra-tx");
  const sender = loadKeypair();
  const recipient = new PublicKey(process.env.RECIPIENT_PUBLIC_KEY ?? "11111111111111111111111111111111");
  const params = createTransferParams(recipient);

  console.log("Configured RPC pool:");
  rpcPool.forEach((url, index) => console.log(`${index + 1}. ${url}`));

  const result = await SendWithReliability(params, createSigner(sender), createOptions(), "devnet");
  console.log("Result:", result);
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
