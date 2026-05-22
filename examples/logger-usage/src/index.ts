import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { SendraOptions, SendraParams, Signer } from "sendra-tx";

config();

type LogEvent = Parameters<NonNullable<SendraOptions["logger"]>>[0];

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

export function formatEvent(event: LogEvent): string {
  const parts = [`step=${event.step}`];
  if (event.rpc) parts.push(`rpc=${event.rpc}`);
  if (event.attempt !== undefined) parts.push(`attempt=${event.attempt}`);
  if (event.fee !== undefined) parts.push(`fee=${event.fee}`);
  if (event.message) parts.push(`message=${event.message}`);
  return parts.join(" ");
}

export function createLogger(events: LogEvent[]): SendraOptions["logger"] {
  return (event) => {
    events.push(event);
    console.log(`[trace] ${formatEvent(event)}`);
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
  const { SendWithReliability } = await import("sendra-tx");
  const events: LogEvent[] = [];
  const sender = loadKeypair();
  const recipient = new PublicKey(process.env.RECIPIENT_PUBLIC_KEY ?? "11111111111111111111111111111111");
  const options: SendraOptions = {
    maxRetries: Number(process.env.MAX_RETRIES ?? "3"),
    logger: createLogger(events),
  };

  const result = await SendWithReliability(createTransferParams(recipient), createSigner(sender), options, "devnet");
  const explorerLink = "explorerLink" in result ? result.explorerLink : undefined;

  console.log("Final result:", result);
  if (explorerLink) {
    console.log(`Explorer: ${explorerLink}`);
  }
  console.log(`Captured ${events.length} structured Sendra events.`);
  console.log("File logs are written to ./sendra-logs/");
  return { result, events };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
