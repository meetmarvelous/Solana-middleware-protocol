import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js"

export type SerializedTx = Uint8Array
export type TxRequest = {
    transaction: SerializedTx
    user: string
    options?: {
        maxRetries: number
    }
}
export type TxResponseStatus = "success" | "failed"
export type TxResponse = {
    status: TxResponseStatus
    signature?: string
    attempts: number
    logs: string[]
    error?: string
}
export type SimulationResult = {
    success: boolean
    error?: string
    logs: string[]
    transaction: DeserializedTx
}
export type RpcEndpoint = {
    url: string
    latency?: number
    successRate?: boolean
}
export type Signature = string
export type TxStatus = "pending" | "confirmed" | "failed"
export type context = {
    attempts: number
    maxRetries: number
}
export type message = string
export type meta = Record<string, any>
export type DeserializedTx = VersionedTransaction
export type OptimizedTx = {
    transaction: DeserializedTx
    fee: number
}
export type Signer = {
    publicKey: PublicKey;
    signTransaction(tx: DeserializedTx): Promise<DeserializedTx>;
};

type BuiltTxInput =
    {
        type: "built";
        serializedTx: true;
        transaction: SerializedTx;
    }
    | {
        type: "built";
        serializedTx: false;
        transaction: VersionedTransaction;
    };

export type ParamsInput = {
    type: "params";
    to: PublicKey;
    amount: number;
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

export type LogEvent = {
    step: "RPC_SELECTED" | "TX_BUILT" | "FEE_OPTIMIZED" | "SIMULATION_SUCCESS" | "SIMULATION_FAILED" | "TX_SIGNED" | "TX_SENT" | "STATUS_CHECK" | "RETRY_TRIGGERED" | "TX_CONFIRMED" | "TX_FAILED" | "ATTEMPT_FAILED" | "RETRY_ATTEMPT" | "FEE_REOPTIMIZED" | "RETRY_SIMULATION_FAILED" | "RETRY_SIMULATION_SUCCESS" | "TX_CONFIRMED_AFTER_RETRY" | "MAX_RETRIES_EXCEEDED" | "RETRY_TX_SENT" | "RETRY_STATUS" | "BLOCKHASH_EXPIRED" | "SEND_FAILED" | "RETRY_BLOCKHASH_EXPIRED" | "RETRY_SEND_FAILED" | "TX_LOADED" | "TX_NOT_CONFIRMED" | "FAILURE_CLASSIFIED" | "RETRY_FAILED_REASON" | "ACTION";
    rpc?: string;
    attempt?: number;
    fee?: number;
    message?: string;
    latency?: number;
};

export type logs = LogEvent[];