import { Signature, TxStatus } from "@repo/types/index";

export function getTxStatus(signature: Signature): TxStatus {
    return "pending"
}