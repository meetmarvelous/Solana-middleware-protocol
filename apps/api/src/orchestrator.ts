import type { TxRequest, TxResponse } from "@repo/types/index"
import { simulateTx } from "@repo/simulator/simulate"
import { sendTx } from "@repo/rpc-client/send"
import { getTxStatus } from "@repo/rpc-client/status"
import { retryTx } from "@repo/retry-engine/retry"
import { optimizeFee } from "@repo/fee-optimizer/optimize"
export const HandleTx = async (req: TxRequest): Promise<TxResponse> => {
    console.log("Called HandleTx");
    const serialisedTransaction = req.transaction;
    const txBytes =
        typeof serialisedTransaction === "string"
            ? Buffer.from(serialisedTransaction, "base64")
            : serialisedTransaction;
    const simulate_result = await simulateTx(txBytes);
    console.log(`Simulate Result: ${simulate_result.success}`);
    if (!simulate_result.success) {
        return {
            status: "failed",
            attempts: 0,
            logs: simulate_result.logs,
            error: simulate_result.error
        } as TxResponse;
    }

    let currentTx = simulate_result.transaction;
    const optimizedTxWithFee = await optimizeFee(currentTx);
    let signature = await sendTx(optimizedTxWithFee);
    let attempts = 1;
    const maxRetries = req.options?.maxRetries ?? 3;

    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            console.log(`currentTx: ${currentTx}`);
            console.log(`signature: ${signature}`);
            console.log(`attempts: ${attempts}`);
            console.log(`maxRetries: ${maxRetries}`);
            const status = await getTxStatus(signature);
            if (status === "confirmed") {
                clearInterval(interval);
                resolve({
                    status: "success",
                    signature: signature,
                    attempts: attempts,
                    logs: simulate_result.logs
                } as TxResponse);
            } else if (status === "failed") {
                if (attempts >= maxRetries) {
                    clearInterval(interval);
                    resolve({
                        status: "failed",
                        signature: signature,
                        attempts: attempts,
                        logs: ["Transaction failed after all retries"],
                        error: "Transaction failed after all retries"
                    } as TxResponse);
                } else {
                    const retryResult = await retryTx(currentTx);
                    currentTx = retryResult.tx;
                    signature = retryResult.signature;
                    attempts++;
                }
            }
        }, 1000);
    });
}