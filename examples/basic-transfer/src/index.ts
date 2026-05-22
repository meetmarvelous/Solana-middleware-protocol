import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { SendraOptions, SendraParams, Signer } from "sendra-tx";

config();

export function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadKeypair(): Keypair {
  const rawSecret = process.env.SENDER_SECRET_KEY;
  const keypairPath = process.env.SENDER_KEYPAIR_PATH;
  const secretJson = rawSecret ?? (keypairPath ? readFileSync(keypairPath, "utf8") : undefined);

  if (!secretJson) {
    throw new Error("Set SENDER_SECRET_KEY or SENDER_KEYPAIR_PATH in .env");
  }

  const secret = JSON.parse(secretJson) as number[];
  if (!Array.isArray(secret) || secret.length !== 64) {
    throw new Error("Sender secret key must be a Solana keypair JSON array with 64 numbers");
  }

  return Keypair.fromSecretKey(Uint8Array.from(secret));
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

export function createOptions(maxRetries = Number(process.env.MAX_RETRIES ?? "3")): SendraOptions {
  return {
    maxRetries,
    logger(event) {
      const attempt = event.attempt !== undefined ? ` attempt=${event.attempt}` : "";
      const detail = event.message ?? event.rpc ?? "";
      console.log(`[sendra] ${event.step}${attempt} ${detail}`.trim());
    },
  };
}

export async function main() {
  const { SendWithReliability } = await import("sendra-tx");
  const sender = loadKeypair();
  const recipient = new PublicKey(readRequiredEnv("RECIPIENT_PUBLIC_KEY"));
  const transferSol = Number(process.env.TRANSFER_SOL ?? "0.001");
  const params = createTransferParams(recipient, transferSol);
  const options = createOptions();

  console.log(`Sender: ${sender.publicKey.toBase58()}`);
  console.log(`Recipient: ${recipient.toBase58()}`);
  console.log(`Amount: ${transferSol} SOL`);

  const result = await SendWithReliability(params, createSigner(sender), options, "devnet");

  console.log("Result:", result);
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
