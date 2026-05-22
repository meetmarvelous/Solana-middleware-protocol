import { Network } from "@repo/types";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";

export type SerializedTx = Uint8Array;

export type DeserializedTx = VersionedTransaction;

export type LogEvent = {
  step:
  | "RPC_SELECTED"
  | "TX_BUILT"
  | "FEE_OPTIMIZED"
  | "SIMULATION_SUCCESS"
  | "SIMULATION_FAILED"
  | "TX_SIGNED"
  | "TX_SENT"
  | "STATUS_CHECK"
  | "RETRY_TRIGGERED"
  | "TX_CONFIRMED"
  | "TX_FAILED"
  | "ATTEMPT_FAILED"
  | "RETRY_ATTEMPT"
  | "FEE_REOPTIMIZED"
  | "RETRY_SIMULATION_FAILED"
  | "RETRY_SIMULATION_SUCCESS"
  | "TX_CONFIRMED_AFTER_RETRY"
  | "MAX_RETRIES_EXCEEDED"
  | "RETRY_TX_SENT"
  | "RETRY_STATUS"
  | "BLOCKHASH_EXPIRED"
  | "SEND_FAILED"
  | "RETRY_BLOCKHASH_EXPIRED"
  | "RETRY_SEND_FAILED"
  | "TX_LOADED"
  | "TX_NOT_CONFIRMED"
  | "FAILURE_CLASSIFIED"
  | "RETRY_FAILED_REASON"
  | "ACTION";
  rpc?: string;
  attempt?: number;
  fee?: number;
  message?: string;
};

export type Signer = {
  publicKey: PublicKey;
  signTransaction(tx: DeserializedTx): Promise<DeserializedTx>;
};

export type ParamsInput = {
  type: "params";
  to: PublicKey;
  amount: number;
};

type BuiltTxInput =
  | {
    type: "built";
    serializedTx: true;
    transaction: SerializedTx;
  }
  | {
    type: "built";
    serializedTx: false;
    transaction: VersionedTransaction;
  };

export type SendraParams = BuiltTxInput | ParamsInput;

export type SendraOptions = {
  maxRetries: number;
  logger?: (log: LogEvent) => void;
};

export type SendraResult = {
  signature: string;
  status: "confirmed" | "failed";
  attempts: number;
  error?: string;
};

export declare function SendWithReliability(
  params: SendraParams,
  signer: Signer,
  options: SendraOptions,
  network: Network
): Promise<SendraResult>;
