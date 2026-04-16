import type { DeserializedTx, OptimizedTx, RpcEndpoint } from "@repo/types";
import { Connection } from "@solana/web3.js";
import { applyPriorityFee } from "@repo/tx-builder";

export async function optimizeFee(tx: DeserializedTx, RPC_URL: RpcEndpoint, prevFee?: number): Promise<OptimizedTx> {
    try {
        console.log("Starting fee optimization...");
        let newFee: number;
        
        if (prevFee !== undefined) {
            console.log("Previous fee provided:", prevFee);
            newFee = Math.floor(prevFee * 1.2);
            console.log("Calculated 20% increased fee:", newFee);
            
            const newTxWithFee = await applyPriorityFee(tx, newFee);
            return {
                transaction: newTxWithFee,
                fee: newFee
            }
        } else {
            console.log("No previous fee. Fetching recent prioritization fees from cluster...");
            const connection = new Connection(`${RPC_URL.url}`, "confirmed");
            const getFee = await connection.getRecentPrioritizationFees();
            
            let validFees: number[] = [];
            
            for (let i = 0; i < getFee.length; i++) {
                const feeObject = getFee[i];
                if (feeObject !== undefined) {
                    const extractedFee = feeObject.prioritizationFee;
                    if (extractedFee > 0) {
                        validFees.push(extractedFee);
                    }
                }
            }

            console.log("Found valid priority fees:", validFees.length);

            let baseFee: number = 0;
            
            if (validFees.length !== 0) {
                // simple bubble sorting for beginner friendly logic manually sorting max top fee
                for (let i = 0; i < validFees.length; i++) {
                    for (let j = 0; j < validFees.length - 1 - i; j++) {
                        if (validFees[j]! > validFees[j + 1]!) {
                            let temp = validFees[j]!;
                            validFees[j] = validFees[j + 1]!;
                            validFees[j + 1] = temp;
                        }
                    }
                }

                const length = validFees.length;
                const half = Math.floor(length / 2);
                
                if (length % 2 !== 0) {
                    baseFee = validFees[half]!;
                } else {
                    const firstMiddle = validFees[half - 1]!;
                    const secondMiddle = validFees[half]!;
                    baseFee = Math.floor((firstMiddle + secondMiddle) / 2);
                }
            }
            
            console.log("Final base fee calculated:", baseFee);

            const newTxWithFee = await applyPriorityFee(tx, baseFee);
            return {
                transaction: newTxWithFee,
                fee: baseFee
            }
        }
    } catch (error: any) {
        console.log("Error during fee optimization:", error.message);
        throw new Error(`Error from OptimizeFee: ${error.message}`)
    }
}