import { RpcEndpoint, Signature, TxStatus } from "@repo/types";
import {
    Connection,
} from "@solana/web3.js";
import { SOLANA_DEVNET_RPC_URL } from "@repo/config";

export async function getTxStatus(signature: Signature, RPC_URL: RpcEndpoint): Promise<TxStatus> {
    try {
        const connection = new Connection(`${RPC_URL.url}`, "confirmed");
        const response = await connection.getSignatureStatus(signature);
        const err = response.value?.err;
        if (err) {
            return "failed";
        }
        const status = response.value?.confirmationStatus;
        if (status === "processed") {
            return "pending";
        }
        else if (status === "confirmed" || status === "finalized") {
            return "confirmed";
        }
        else if (!status) {
            return "pending";
        }
        else {
            return "failed";
        }
    } catch (e) {
        return "failed";
    }
}