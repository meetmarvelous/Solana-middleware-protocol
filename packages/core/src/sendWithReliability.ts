import { SendraOptions, SendraParams, Signer } from "@repo/types";
import { selectRpc } from "@repo/router"
import { SimulateTx } from "@repo/simulator";
import { SendTx } from "@repo/rpc-client"
import { BuildTx } from "@repo/tx-builder";
import { optimizeFee } from "@repo/fee-optimizer";
import { ConfirmTx } from "@repo/logger";

export async function SendWithReliability(params: SendraParams, signer: Signer, options: SendraOptions) {
    const rpc = await selectRpc();
    const tx = await BuildTx(rpc, signer, params);
    const optimisedTx = await optimizeFee(tx, rpc);
    const simulateResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
    if (!simulateResult.success) {
        return { success: false, error: simulateResult.error };
    }
    const signedTx = await signer.signTransaction(simulateResult.transaction);
    const signature = await SendTx(signedTx, rpc);
    const result = await ConfirmTx(rpc, signature);
    if (result.success) {
        return result;
    }
    let attempt = 0;
    let lastFee = optimisedTx.fee;

    while (attempt < options.maxRetries) {
        const currentRpc = await selectRpc();
        const newTx = await BuildTx(currentRpc, signer, params);

        const reOptimized = await optimizeFee(newTx, currentRpc, lastFee);
        lastFee = reOptimized.fee;

        const sim = await SimulateTx(reOptimized.transaction, rpc, signer);
        if (!sim.success) {
            return { success: false, error: sim.error };
        }

        const signedTx = await signer.signTransaction(sim.transaction);
        const signature = await SendTx(signedTx, rpc);
        const result = await ConfirmTx(rpc, signature);

        if (result.success) {
            return result;
        }

        attempt++;
    }
    return {
        success: false,
        error: "Max retries reached"
    };
}