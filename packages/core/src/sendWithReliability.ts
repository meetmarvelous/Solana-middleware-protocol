import { SendraOptions, SendraParams, Signer } from "@repo/types/index";
import { selectRpc } from "@repo/router/router"
import { SimulateTx } from "@repo/simulator/simulate";
import { SendTx } from "@repo/rpc-client/send"
import { BuildTx } from "@repo/tx-builder/builder";
import { optimizeFee } from "@repo/fee-optimizer/optimize";
import { ConfirmTx } from "@repo/logger/confirmTx";

export async function SendWithReliability(params: SendraParams, signer: Signer, options: SendraOptions) {
    const rpc = await selectRpc();
    const tx = await BuildTx(rpc, signer, params);
    const optimisedTx = await optimizeFee(tx, rpc);
    const simulateResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
    if (!simulateResult.success) {
        return { success: false, error: simulateResult.error, attempts: 1 };
    }
    const signedTx = await signer.signTransaction(simulateResult.transaction);
    const signature = await SendTx(signedTx, rpc);
    const result = await ConfirmTx(rpc, signature);
    if (result.success) {
        return { ...result, attempts: 1 };
    }
    let attempt = 1;
    let lastFee = optimisedTx.fee;

    while (attempt < options.maxRetries) {
        const currentRpc = await selectRpc();
        const newTx = await BuildTx(currentRpc, signer, params);

        const reOptimized = await optimizeFee(newTx, currentRpc, lastFee);
        lastFee = reOptimized.fee;

        const sim = await SimulateTx(reOptimized.transaction, rpc, signer);
        if (!sim.success) {
            return { success: false, error: sim.error, attempts: attempt + 1 };
        }

        const signedTx = await signer.signTransaction(sim.transaction);
        const signature = await SendTx(signedTx, rpc);
        const res = await ConfirmTx(rpc, signature);

        if (res.success) {
            return { ...res, attempts: attempt + 1 };
        }

        attempt++;
    }
    return {
        success: false,
        error: "Max retries reached",
        attempts: attempt
    };
}