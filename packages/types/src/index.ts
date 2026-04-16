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

export type SendraParams = {
    receiver: PublicKey;
    amount: number;
};

export type SendraOptions = {
    maxRetries: number;
};

export type SendraResult = {
    signature: string;
    status: "confirmed" | "failed";
    attempts: number;
    error?: string;
};

export type LogEvent = {
    step: "RPC_SELECTED" | "TX_BUILT" | "FEE_OPTIMIZED" | "SIMULATION_SUCCESS" | "SIMULATION_FAILED" | "TX_SIGNED" | "TX_SENT" | "STATUS_CHECK" | "RETRY_TRIGGERED" | "TX_CONFIRMED" | "TX_FAILED" | "INITIAL_ATTEMPT_FAILED" | "RETRY_ATTEMPT" | "FEE_REOPTIMIZED" | "RETRY_SIMULATION_FAILED" | "RETRY_SIMULATION_SUCCESS" | "SUCCESS" | "MAX_RETRIES_EXCEEDED" | "RETRY_TX_SENT" | "RETRY_STATUS";
    rpc?: string;
    attempt?: number;
    fee?: number;
    message?: string;
};

export type logs = LogEvent[];