import type { context, SerializedTx, TxResponse } from "@repo/types/index"

export function retryTx(tx: SerializedTx, context: context): TxResponse {
    return {
        status: "success",
        signature: "Hello",
        attempts: 1,
        logs: ["heelo"]
    }
}