import type { RpcEndpoint } from "@repo/types/index"
import {
    SOLANA_ALCHEMY_RPC_URL,
    SOLANA_DEVNET_RPC_URL,
    SOLANA_HELIUS_RPC_URL,
    SOLANA_QUICKNODE_RPC_URL
} from "@repo/config/index";
import { Connection } from "@solana/web3.js"

export async function selectRpc(): Promise<RpcEndpoint> {
    const connectionWithDevnet = new Connection(`${SOLANA_DEVNET_RPC_URL}`, "confirmed");
    const connectionWithAlchemy = new Connection(`${SOLANA_ALCHEMY_RPC_URL}`, "confirmed");
    const connectionWithHelius = new Connection(`${SOLANA_HELIUS_RPC_URL}`, "confirmed");
    const connectionWithQuicknode = new Connection(`${SOLANA_QUICKNODE_RPC_URL}`, "confirmed");

    let succesForDevnet = true;
    let timeTakenForDevnet = 0;
    const startForDevnet = performance.now();
    try {
        await connectionWithDevnet.getLatestBlockhash();
    } catch (error) {
        succesForDevnet = false
    }
    const endForDevnet = performance.now();
    timeTakenForDevnet = endForDevnet - startForDevnet;

    let succesForAlchemy = true;
    let timeTakenForAlchemy = 0;
    const startForAlchemy = performance.now();
    try {
        await connectionWithAlchemy.getLatestBlockhash();
    } catch (error) {
        succesForAlchemy = false
    }
    const endForAlchemy = performance.now();
    timeTakenForAlchemy = endForAlchemy - startForAlchemy;

    let succesForHelius = true;
    let timeTakenForHelius = 0;
    const startForHelius = performance.now();
    try {
        await connectionWithHelius.getLatestBlockhash();
    } catch (error) {
        succesForHelius = false
    }
    const endForHelius = performance.now();
    timeTakenForHelius = endForHelius - startForHelius;

    let succesForQuicknode = true;
    let timeTakenForQuicknode = 0;
    const startForQuicknode = performance.now();
    try {
        await connectionWithQuicknode.getLatestBlockhash();
    } catch (error) {
        succesForQuicknode = false
    }
    const endForQuicknode = performance.now();
    timeTakenForQuicknode = endForQuicknode - startForQuicknode;

    const latency: { rpc: string, timeTaken: number, success: boolean }[] = [
        { rpc: SOLANA_DEVNET_RPC_URL, timeTaken: timeTakenForDevnet, success: succesForDevnet },
        { rpc: SOLANA_ALCHEMY_RPC_URL, timeTaken: timeTakenForAlchemy, success: succesForAlchemy },
        { rpc: SOLANA_HELIUS_RPC_URL, timeTaken: timeTakenForHelius, success: succesForHelius },
        { rpc: SOLANA_QUICKNODE_RPC_URL, timeTaken: timeTakenForQuicknode, success: succesForQuicknode }
    ];

    const valid = latency
        .filter((e) => e.success === true)
        .sort((a, b) => a.timeTaken - b.timeTaken);

    if (valid.length === 0) {
        return {
            url: "No RPC Available",
            latency: 0,
            successRate: false
        };
    }

    return {
        url: valid[0]!.rpc,
        latency: valid[0]!.timeTaken,
        successRate: valid[0]!.success
    };
}