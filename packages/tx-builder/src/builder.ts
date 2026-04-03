import type { DeserializedTx, SerializedTx } from "@repo/types/index";
import {
    ComputeBudgetProgram,
    Connection,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";
import { optimizeFee } from "@repo/fee-optimizer/optimize";

export async function rebuildTx(tx: DeserializedTx): Promise<DeserializedTx> {
    console.log("Called rebuildTx");
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const { blockhash } = await connection.getLatestBlockhash()
    tx.message.recentBlockhash = blockhash;
    const optimizeTxWithFee = await optimizeFee(tx);
    return optimizeTxWithFee;
}

export async function applyPriorityFee(tx: DeserializedTx, fee: number): Promise<DeserializedTx> {
    const feeIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: fee });
    const message = TransactionMessage.decompile(tx.message);
    message.instructions.unshift(feeIx);
    const newTxWithFee = new VersionedTransaction(message.compileToV0Message());
    return newTxWithFee;
}