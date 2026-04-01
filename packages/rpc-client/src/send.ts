import type { RpcEndpoint, SerializedTx, Signature } from "@repo/types/index";

export function sendTx(tx: SerializedTx, rpc: RpcEndpoint): Signature {
    return "hello"
}
