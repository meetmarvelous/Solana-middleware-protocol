import type { SimulationResult, SerializedTx, RpcEndpoint, DeserializedTx, Signer } from "@repo/types/index"
import {
    Connection,
    VersionedTransaction,
} from "@solana/web3.js";

export async function SimulateTx(tx: DeserializedTx, RPC_URL: RpcEndpoint, signer: Signer): Promise<SimulationResult> {
    console.log(`Called simulateTx`);
    const connection = new Connection(`${RPC_URL.url}`, "confirmed");
    const serializedTx = tx.serialize();
    const deserializedTx = VersionedTransaction.deserialize(serializedTx);
    const res = await connection.simulateTransaction(deserializedTx);
    return {
        success: !res.value?.err,
        error: res.value?.err ? JSON.stringify(res.value.err) : "none",
        logs: res.value?.logs || [],
        transaction: deserializedTx
    }
}