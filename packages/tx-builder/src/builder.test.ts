import { describe, expect, it } from "vitest";
import { Keypair, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { applyPriorityFee } from "./applyFee";
import { newTxMessageFromOld } from "./builder";

function createTransferTx() {
    const payer = Keypair.generate().publicKey;
    const recipient = Keypair.generate().publicKey;
    const instruction = SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: recipient,
        lamports: 1,
    });

    return new VersionedTransaction(new TransactionMessage({
        payerKey: payer,
        recentBlockhash: "11111111111111111111111111111111",
        instructions: [instruction],
    }).compileToV0Message());
}

describe("@repo/tx-builder", () => {
    it("prepends a compute budget fee instruction without dropping original instructions", async () => {
        const tx = createTransferTx();

        const withFee = await applyPriorityFee(tx, 500);
        const message = TransactionMessage.decompile(withFee.message);

        expect(message.instructions).toHaveLength(2);
        expect(message.instructions[0]?.programId.toBase58()).toBe("ComputeBudget111111111111111111111111111111");
        expect(message.instructions[1]?.programId.toBase58()).toBe(SystemProgram.programId.toBase58());
    });

    it("rebuilds a transaction message with a fresh blockhash", () => {
        const tx = createTransferTx();

        const message = newTxMessageFromOld(tx, "22222222222222222222222222222222");

        expect(message.recentBlockhash).toBe("22222222222222222222222222222222");
    });
});
