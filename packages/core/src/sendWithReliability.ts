import { LogEvent, logs, SendraOptions, SendraParams, Signer } from "@repo/types";
import { selectRpc } from "@repo/router"
import { SimulateTx } from "@repo/simulator";
import { SendTx } from "@repo/rpc-client"
import { BuildTx } from "@repo/tx-builder";
import { optimizeFee } from "@repo/fee-optimizer";
import { ConfirmTx } from "@repo/logger";
import { logEvent } from "@repo/logger";

export async function SendWithReliability(params: SendraParams, signer: Signer, options: SendraOptions) {
    let attempt = 0;
    const logs: logs = [];

    const rpc = await selectRpc();
    logEvent({
        step: "RPC_SELECTED",
        rpc: rpc.url,
    }, logs);

    const { tx, lastValidBlockHeight } = await BuildTx(rpc, signer, params);
    logEvent({
        step: "TX_BUILT",
        rpc: rpc.url
    }, logs);

    const optimisedTx = await optimizeFee(tx, rpc);
    logEvent({
        step: "FEE_OPTIMIZED",
        fee: optimisedTx.fee
    }, logs);

    const simulateResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
    if (!simulateResult.success) {
        logEvent({
            step: "SIMULATION_FAILED",
            message: "failed"
        }, logs);
        return { success: false, error: simulateResult.error, logs };
    }
    logEvent({
        step: "SIMULATION_SUCCESS",
        message: "success"
    }, logs);

    const signedTx = await signer.signTransaction(simulateResult.transaction);
    logEvent({
        step: "TX_SIGNED",
        attempt: attempt,
        rpc: rpc.url
    }, logs);

    let sendFailed = false;
    let signature;

    try {
        signature = await SendTx(signedTx, rpc);
        logEvent({
            step: "TX_SENT",
            attempt: attempt,
            rpc: rpc.url
        }, logs);
    } catch (error: any) {
        if (error.message?.includes("Blockhash not found")) {
            logEvent({
                step: "BLOCKHASH_EXPIRED",
                attempt,
                rpc: rpc.url
            }, logs);

            sendFailed = true;
        } else {
            logEvent({
                step: "SEND_FAILED",
                attempt: attempt,
                rpc: rpc.url,
                message: error.message
            }, logs);
            throw error;
        }
    }

    if (!sendFailed) {
        const result = await ConfirmTx(rpc, signature!, lastValidBlockHeight);
        if (result.success) {
            logEvent({
                step: "TX_CONFIRMED",
                rpc: rpc.url,
            }, logs);
            return { ...result, logs };
        }
    }

    let lastFee = optimisedTx.fee;
    logEvent({
        step: "INITIAL_ATTEMPT_FAILED",
        attempt: attempt,
        message: "starting retries"
    }, logs);

    while (attempt < options.maxRetries) {
        attempt++;
        logEvent({
            step: "RETRY_ATTEMPT",
            attempt: attempt
        }, logs);

        const currentRpc = await selectRpc();
        logEvent({
            step: "RPC_SELECTED",
            attempt: attempt,
            rpc: currentRpc.url
        }, logs);

        const { tx: newTx, lastValidBlockHeight } = await BuildTx(currentRpc, signer, params);
        logEvent({
            step: "TX_BUILT",
            rpc: currentRpc.url,
        }, logs);

        const reOptimized = await optimizeFee(newTx, currentRpc, lastFee);
        logEvent({
            step: "FEE_REOPTIMIZED",
            attempt: attempt,
            fee: reOptimized.fee
        }, logs);
        lastFee = reOptimized.fee;

        const sim = await SimulateTx(reOptimized.transaction, currentRpc, signer);
        if (!sim.success) {
            logEvent({
                step: "RETRY_SIMULATION_FAILED",
                attempt: attempt,
                message: "failed"
            }, logs);
            return { success: false, error: sim.error, logs };
        }
        logEvent({
            step: "RETRY_SIMULATION_SUCCESS",
            attempt: attempt,
            message: "success"
        }, logs);

        const signedTx = await signer.signTransaction(sim.transaction);
        logEvent({
            step: "TX_SIGNED",
            rpc: currentRpc.url,
        }, logs);

        let signature;

        try {
            signature = await SendTx(signedTx, currentRpc);
            logEvent({
                step: "TX_SENT",
                attempt: attempt,
                rpc: currentRpc.url
            }, logs);
        } catch (error: any) {
            if (error.message?.includes("Blockhash not found")) {
                logEvent({
                    step: "RETRY_BLOCKHASH_EXPIRED",
                    attempt,
                    rpc: currentRpc.url
                }, logs);

                continue;
            } else {
                logEvent({
                    step: "RETRY_SEND_FAILED",
                    attempt,
                    rpc: currentRpc.url,
                    message: error.message
                }, logs);
                throw error;
            }
        }

        const result = await ConfirmTx(currentRpc, signature!, lastValidBlockHeight);
        logEvent({
            step: "RETRY_STATUS",
            attempt: attempt,
            message: result.success ? "confirmed" : "failed"
        }, logs);

        if (result.success) {
            logEvent({
                step: "SUCCESS",
                attempt: attempt
            }, logs);
            return { ...result, logs };
        }
    }
    logEvent({
        step: "MAX_RETRIES_EXCEEDED",
        attempt: attempt
    }, logs);
    return {
        success: false,
        error: "Max retries reached",
        logs
    };
}