import { RpcEndpoint, Signature } from "@repo/types/index";
import { getTxStatus } from "@repo/rpc-client/status"
function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export async function ConfirmTx(rpc: RpcEndpoint, signature: Signature, intervalMs: number = 1000, timeoutMs: number = 60000) {
    const start = Date.now();

    while (true) {
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
