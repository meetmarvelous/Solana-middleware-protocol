import { SendraLog, SendraOptions, SendraParams, Signer } from "@repo/types/index";
import { selectRpc } from "@repo/router/router"
import { SimulateTx } from "@repo/simulator/simulate";
import { SendTx } from "@repo/rpc-client/send"
import { BuildTx } from "@repo/tx-builder/builder";
import { optimizeFee } from "@repo/fee-optimizer/optimize";
import { ConfirmTx } from "@repo/logger/confirmTx";

export async function SendWithReliability(params: SendraParams, signer: Signer, options: SendraOptions) {
    const logs: SendraLog[] = [];
    const rpc = await selectRpc();
    logs.push({
        step: "SELECTED_RPC",
        message: "Selected RPC",
        rpc: `${rpc.url}`
    })
    const tx = await BuildTx(rpc, signer, params);
    logs.push({
        step: "BUILD_TX",
        message: "Built Transaction",
    })
    const optimisedTx = await optimizeFee(tx, rpc);
    logs.push({
        step: "OPTIMIZE_FEE",
        message: `Optimized Fee: ${optimisedTx.fee} lamports`,
    })
    const simulateResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
    logs.push({
        step: "SIMULATE_TX",
        message: `Simulated Transaction: ${simulateResult.success ? "Success" : "Failed"}`,
    })
    if (!simulateResult.success) {
        return { success: false, error: simulateResult.error, attempts: 1 };
    }
    const signedTx = await signer.signTransaction(simulateResult.transaction);
    logs.push({
        step: "SIGN_TX",
        message: "Signed Transaction",
    })
    const signature = await SendTx(signedTx, rpc);
    logs.push({
        step: "SEND_TX",
        message: "Sent Transaction",
        rpc: rpc.url,
        attempt: 0
    })
    const result = await ConfirmTx(rpc, signature);
    logs.push({
        step: "CONFIRM_TX",
        message: `Confirmed Transaction: ${result.success ? "Success" : "Failed"}`,
    })
    if (result.success) {
        return { ...result, logs };
    }
    let attempt = 1;
    let lastFee = optimisedTx.fee;

    while (attempt < options.maxRetries) {
        logs.push({
            step: "RETRY",
            message: `Retrying Transaction: ${attempt}`,
            attempt: attempt
        })
        const currentRpc = await selectRpc();
        logs.push({
            step: "SELECTED_RPC",
            message: "Selected RPC",
            rpc: `${currentRpc.url}`
        })
        const newTx = await BuildTx(currentRpc, signer, params);
        logs.push({
            step: "BUILD_TX",
            message: "Built Transaction",
        })
        const reOptimized = await optimizeFee(newTx, currentRpc, lastFee);
        logs.push({
            step: "OPTIMIZE_FEE",
            message: `Optimized Fee: ${reOptimized.fee} lamports`,
        })
        lastFee = reOptimized.fee;

        const sim = await SimulateTx(reOptimized.transaction, rpc, signer);
        logs.push({
            step: "SIMULATE_TX",
            message: `Simulated Transaction: ${sim.success ? "Success" : "Failed"}`,
        })
        if (!sim.success) {
            return { success: false, error: sim.error, attempts: attempt + 1 };
        }

        const signedTx = await signer.signTransaction(sim.transaction);
        logs.push({
            step: "SIGN_TX",
            message: "Signed Transaction",
        })
        const signature = await SendTx(signedTx, rpc);
        logs.push({
            step: "SEND_TX",
            message: "Sent Transaction",
            rpc: rpc.url,
            attempt: attempt
        })
        const res = await ConfirmTx(rpc, signature);
        logs.push({
            step: "CONFIRM_TX",
            message: `Confirmed Transaction: ${res.success ? "Success" : "Failed"}`,
        })
        if (res.success) {
            return { ...res, logs };
        }

        attempt++;
    }
    return {
        success: false,
        error: "Max retries reached",
        logs
    };
}