import type { DeserializedTx } from "@repo/types/index";
import { ComputeBudgetProgram, Connection, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export async function optimizeFee(tx: DeserializedTx): Promise<DeserializedTx> {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const getFee = await connection.getRecentPrioritizationFees();
    const fees = getFee
        .map((e) => e.prioritizationFee)
        .sort((a, b) => a - b)
        .filter((e) => e > 0);
    let baseFee: number = 0;
    if (fees.length !== 0) {
        const half = Math.floor(fees.length / 2);
        fees.length % 2 ? baseFee = fees[half]! : baseFee = (fees[half - 1]! + fees[half]!) / 2;
    }
    const feeIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: baseFee });
    const message = TransactionMessage.decompile(tx.message);
    message.instructions.unshift(feeIx);
    const newTxWithFee = new VersionedTransaction(message.compileToV0Message());
    return newTxWithFee;
}