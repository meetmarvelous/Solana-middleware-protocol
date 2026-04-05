import type { DeserializedTx, RpcEndpoint } from "@repo/types/index";
import {
    Connection,
} from "@solana/web3.js";
import { SOLANA_DEVNET_RPC_URL } from "@repo/config/index"

export async function SendTx(tx: DeserializedTx, RPC_URL: RpcEndpoint): Promise<string> {
    console.log("Called sendTx");
    const connection = new Connection(`${RPC_URL.url}`, "confirmed");
    let sig = await connection.sendTransaction(tx);
    return sig;
}
