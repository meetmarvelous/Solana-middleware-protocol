import { RpcEndpoint, Signature } from "@repo/types";
import { getTxStatus } from "@repo/rpc-client"
import { Connection } from "@solana/web3.js";

function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export async function ConfirmTx(rpc: RpcEndpoint, signature: Signature, lastValidBlockHeight: number, intervalMs: number = 1000, timeoutMs: number = 60000) {
    const connection = new Connection(`${rpc.url}`, "confirmed");
    const start = Date.now();

    while (true) {
        const currentBlock = await connection.getBlockHeight();

        if (currentBlock > lastValidBlockHeight) {
            return { success: false, signature, error: "expired" };
        }
        const status = await getTxStatus(signature, rpc);
        if (status === "confirmed") {
            return { success: true, signature };
        }

        if (status === "failed") {
            return { success: false, signature };
        }

        if (Date.now() - start > timeoutMs) {
            return { success: false, signature, error: "timeout" };
        }

        await sleep(intervalMs);
    }
}