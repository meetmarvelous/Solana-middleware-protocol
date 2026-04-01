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
}
export type SimulationResult = {
    success: boolean
    error?: string
    logs: string[]
}
export type RpcEndpoint = {
    url: string
    latency?: number
    successRate?: number
}
export type Signature = string
export type TxStatus = "pending" | "confirmed" | "failed"
export type context = {
    attempts: number
    maxRetries: number
}
export type message = string
export type meta = Record<string, any>