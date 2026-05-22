import type { RpcEndpoint, Network } from "@repo/types";
import { DEVNET_RPC_URLS, MAINNET_RPC_URLS } from "@repo/config";
import { Connection } from "@solana/web3.js";

export async function selectRpc(network: Network): Promise<RpcEndpoint> {
    const urls = network === "mainnet" ? MAINNET_RPC_URLS : DEVNET_RPC_URLS;
    const latencyPromises = urls.map(async (rpcUrl) => {
        const connection = new Connection(rpcUrl, "confirmed");
        let success = true;
        const start = performance.now();
        try {
            await connection.getLatestBlockhash();
        } catch (error) {
            success = false;
        }
        const end = performance.now();
        return {
            rpc: rpcUrl,
            timeTaken: end - start,
            success,
        };
    });

    const latency = await Promise.all(latencyPromises);

    const valid = latency.filter((e) => e.success).sort((a, b) => a.timeTaken - b.timeTaken);

    if (valid.length === 0) {
        return {
            url: "No RPC Available",
            latency: 0,
            successRate: false,
        };
    }

    return {
        url: valid[0]!.rpc,
        latency: valid[0]!.timeTaken,
        successRate: valid[0]!.success,
    };
}