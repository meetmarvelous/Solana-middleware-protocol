import type { DeserializedTx } from "@repo/types/index";
import { Connection } from "@solana/web3.js";
import { applyPriorityFee } from "@repo/tx-builder/builder";

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
    const newTxWithFee = applyPriorityFee(tx, baseFee);
    return newTxWithFee;
}