import { SendraError, SendraLog, SendraLogEvent, SendraOptions, SendraParams, SendraResult, Signer } from "@repo/types";
import { selectRpc } from "@repo/router";
import { SimulateTx } from "@repo/simulator";
import { SendTx } from "@repo/rpc-client";
import { BuildTx } from "@repo/tx-builder";
import { optimizeFee } from "@repo/fee-optimizer";
import { ConfirmTx } from "@repo/logger";
import { log } from "@repo/logger";

export async function sendWithReliability(params: SendraParams, signer: Signer, options: SendraOptions): Promise<SendraResult> {
    const requestId = Math.random().toString(36).substring(2, 10);
    const logs: SendraLog[] = [];

    let attempt = 1;
    let currentRpc = "";
    let currentFee = 0;
    let currentSignature = "";

    const track = (event: SendraLogEvent, data: any = {}) => {
        let step = event as string;
        let message = `Executed ${event}`;
        
        switch (event) {
            case "RPC_SELECTED": step = "SELECT_RPC"; message = "Selected optimal RPC node"; break;
            case "TX_BUILT": step = "BUILD_TX"; message = "Constructed transaction payload"; break;
            case "FEE_OPTIMIZED": step = "OPTIMIZE_FEE"; message = `Dynamically set priority fee: ${currentFee || data.fee}`; break;
            case "SIMULATION_SUCCESS": step = "SIMULATE"; message = "Pre-flight simulation successful"; break;
            case "SIMULATION_FAILED": step = "SIMULATE"; message = `Pre-flight simulation failed: ${data.reason}`; break;
            case "TX_SIGNED": step = "SIGN_TX"; message = "Requested wallet signature"; break;
            case "TX_SENT": step = "SEND_TX"; message = "Broadcasted to network"; break;
            case "TX_CONFIRMED": step = "CONFIRM_TX"; message = "Transaction confirmed on-chain"; break;
            case "RETRY_TRIGGERED": step = "RETRY"; message = `Retry triggered. Reason: ${data.reason}`; break;
            case "TX_FAILED": step = "CONFIRM_TX"; message = "Transaction failed permanently"; break;
            case "STATUS_CHECK": step = "CONFIRM_TX"; message = "Monitoring block finality"; break;
            case "INIT": step = "INIT"; message = "Initialized Sendra"; break;
        }

        const entry = log(event, {
            requestId,
            attempt,
            rpc: currentRpc,
            fee: currentFee,
            signature: currentSignature,
            step,
            message,
            ...data
        });
        logs.push(entry);
    };

    track("INIT", { params });

    let rpc = await selectRpc();
    currentRpc = rpc.url;
    track("RPC_SELECTED");

    let tx = await BuildTx(rpc, signer, params);
    track("TX_BUILT");

    let optimisedTx = await optimizeFee(tx, rpc);
    currentFee = optimisedTx.fee;
    track("FEE_OPTIMIZED", { fee: currentFee });

    let simResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
    if (!simResult.success) {
        track("SIMULATION_FAILED", { reason: simResult.error });
        return { status: "failed", attempts: attempt, error: simResult.error, logs };
    }
    track("SIMULATION_SUCCESS");

    let signedTx;
    try {
        signedTx = await signer.signTransaction(simResult.transaction);
        track("TX_SIGNED");
    } catch (e: any) {
        const error: SendraError = { type: "UNKNOWN", message: e.message || String(e) };
        return { status: "failed", attempts: attempt, error, logs };
    }

    let sendResult = await SendTx(signedTx, rpc);
    if (sendResult.success) {
        currentSignature = sendResult.signature!;
    }
    track("TX_SENT");

    let confirmResult;
    let retryReason = "";

    if (!sendResult.success) {
        retryReason = sendResult.error?.type === "RPC_ERROR" ? "rpc_error" : "failed";
    } else {
        track("STATUS_CHECK");
        confirmResult = await ConfirmTx(rpc, currentSignature);

        if (confirmResult.success) {
            track("TX_CONFIRMED", { attempts: attempt });
            return { status: "confirmed", signature: currentSignature, attempts: attempt, logs };
        }

        if (confirmResult.error?.type === "TIMEOUT") retryReason = "timeout";
        else if (confirmResult.error?.type === "RPC_ERROR") retryReason = "rpc_error";
        else retryReason = "failed";
    }

    while (attempt < options.maxRetries) {
        attempt++;

        track("RETRY_TRIGGERED", { reason: retryReason });

        rpc = await selectRpc();
        currentRpc = rpc.url;
        track("RPC_SELECTED");

        const newTx = await BuildTx(rpc, signer, params);
        track("TX_BUILT");

        optimisedTx = await optimizeFee(newTx, rpc, currentFee);
        currentFee = optimisedTx.fee;
        track("FEE_OPTIMIZED", { fee: currentFee });

        simResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
        if (!simResult.success) {
            track("SIMULATION_FAILED", { reason: simResult.error });
            track("TX_FAILED", { attempts: attempt });
            return { status: "failed", attempts: attempt, error: simResult.error, logs };
        }
        track("SIMULATION_SUCCESS");

        try {
            signedTx = await signer.signTransaction(simResult.transaction);
            track("TX_SIGNED");
        } catch (e: any) {
            const error: SendraError = { type: "UNKNOWN", message: e.message || String(e) };
            track("TX_FAILED", { attempts: attempt });
            return { status: "failed", attempts: attempt, error, logs };
        }

        sendResult = await SendTx(signedTx, rpc);
        if (sendResult.success) {
            currentSignature = sendResult.signature!;
        }
        track("TX_SENT");

        if (!sendResult.success) {
            retryReason = sendResult.error?.type === "RPC_ERROR" ? "rpc_error" : "failed";
            continue;
        }

        track("STATUS_CHECK");
        confirmResult = await ConfirmTx(rpc, currentSignature);

        if (confirmResult.success) {
            track("TX_CONFIRMED", { attempts: attempt });
            return { status: "confirmed", signature: currentSignature, attempts: attempt, logs };
        }

        if (confirmResult.error?.type === "TIMEOUT") retryReason = "timeout";
        else if (confirmResult.error?.type === "RPC_ERROR") retryReason = "rpc_error";
        else retryReason = "failed";
    }

    const maxRetriesError: SendraError = {
        type: "TIMEOUT",
        message: "Max retries exceeded"
    };

    track("TX_FAILED", { attempts: attempt });

    return {
        status: "failed",
        attempts: attempt,
        error: maxRetriesError,
        logs
    };
}