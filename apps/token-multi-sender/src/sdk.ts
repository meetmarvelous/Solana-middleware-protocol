import { SendWithReliability as sendraSend } from "@repo/core";
import { PublicKey, Keypair } from "@solana/web3.js";
import { LogEvent } from "@repo/types";

export interface JobParams {
  id: string;
  address: string;
  amount: number; // in SOL
}

export type StepLabel = 'PENDING' | 'RPC' | 'FEE' | 'SIM' | 'SENDING' | 'CONFIRMED' | 'FAILED';

export const STEPS: StepLabel[] = ['RPC', 'FEE', 'SIM', 'SENDING', 'CONFIRMED'];

export async function SendWithReliability(
  params: JobParams,
  signer: any, // Solana Signer object or KeypairSigner
  options: { maxRetries: number },
  network: "mainnet" | "devnet",
  logger: (log: string, status?: StepLabel) => void
) {
  // Map step names to UI steps
  const mapStep = (step: LogEvent['step']): StepLabel | undefined => {
    switch (step) {
      case 'RPC_SELECTED':
        return 'RPC';
      case 'TX_BUILT':
      case 'TX_LOADED':
        return 'RPC';
      case 'FEE_OPTIMIZED':
      case 'FEE_REOPTIMIZED':
        return 'FEE';
      case 'SIMULATION_SUCCESS':
      case 'RETRY_SIMULATION_SUCCESS':
        return 'SIM';
      case 'SIMULATION_FAILED':
      case 'RETRY_SIMULATION_FAILED':
        return 'FAILED';
      case 'TX_SIGNED':
      case 'TX_SENT':
      case 'RETRY_ATTEMPT':
      case 'ACTION':
      case 'RETRY_FAILED_REASON':
        return 'SENDING';
      case 'TX_CONFIRMED':
      case 'TX_CONFIRMED_AFTER_RETRY':
        return 'CONFIRMED';
      case 'MAX_RETRIES_EXCEEDED':
        return 'FAILED';
      default:
        return undefined;
    }
  };

  // Convert recipient public key
  const toPublicKey = new PublicKey(params.address);
  // Convert SOL to lamports (1 SOL = 10^9 lamports)
  const lamports = Math.round(params.amount * 1_000_000_000);

  const sdkParams = {
    type: "params" as const,
    to: toPublicKey,
    amount: lamports
  };

  const sdkOptions = {
    maxRetries: options.maxRetries,
    logger: (event: LogEvent) => {
      const stepLabel = mapStep(event.step);
      let message = `${event.step}`;
      if (event.rpc) message += ` | RPC: ${event.rpc}`;
      if (event.latency !== undefined) message += ` | Latency: ${event.latency.toFixed(0)}ms`;
      if (event.fee !== undefined) message += ` | Fee: ${event.fee} lamports`;
      if (event.attempt !== undefined) message += ` | Attempt: ${event.attempt}`;
      if (event.message) message += ` | ${event.message}`;

      logger(message, stepLabel);
    }
  };

  logger(`CORE_INITIALIZED: Preparing transaction for ${params.address} (${params.amount} SOL).`, 'RPC');

  const result = await sendraSend(
    sdkParams,
    signer,
    sdkOptions,
    network
  );

  if (!result.success) {
    throw new Error(result.error || "Transaction failed");
  }

  return { success: true, txId: result.signature };
}
