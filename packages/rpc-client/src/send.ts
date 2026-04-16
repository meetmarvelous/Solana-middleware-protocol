import type { DeserializedTx, RpcEndpoint } from "@repo/types";
import {
    Connection,
} from "@solana/web3.js";

export async function SendTx(tx: DeserializedTx, RPC_URL: RpcEndpoint): Promise<string> {
    console.log("Called sendTx");
    const connection = new Connection(`${RPC_URL.url}`, "confirmed");
    let sig = await connection.sendTransaction(tx, { skipPreflight: true, maxRetries: 0 });
    return sig;
}