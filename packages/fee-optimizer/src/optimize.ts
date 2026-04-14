import type { DeserializedTx, OptimizedTx, RpcEndpoint } from "@repo/types/index";
import { Connection } from "@solana/web3.js";
import { applyPriorityFee } from "@repo/tx-builder/applyFee";

export async function optimizeFee(tx: DeserializedTx, RPC_URL: RpcEndpoint, prevFee?: number): Promise<OptimizedTx> {
    try {
        let newFee: number;
        if (prevFee !== undefined) {
            newFee = Math.floor(prevFee * 1.2);
            const newTxWithFee = await applyPriorityFee(tx, newFee);
            return {
                transaction: newTxWithFee,
                fee: newFee
            }
        } else {
            const connection = new Connection(`${RPC_URL.url}`, "confirmed");
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
            const newTxWithFee = await applyPriorityFee(tx, baseFee);
            return {
                transaction: newTxWithFee,
                fee: baseFee
            }
        }
    } catch (error) {
        throw new Error(`Error from OptimizeFee: ${error}`)
    }
}