import {
    Connection,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
    Keypair,
    PublicKey
} from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";

(async () => {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    const mnemonic = "arm habit roast ski analyst soccer birth axis improve private place bench";
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derived = derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key;

    const sender = Keypair.fromSecretKey(
        nacl.sign.keyPair.fromSeed(derived).secretKey
    );
    console.log(sender.publicKey.toBase58());
    const receiver = new PublicKey("DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa");

    const { blockhash } = await connection.getLatestBlockhash();

    const instruction = SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: receiver,
        lamports: 1000,
    });

    const message = new TransactionMessage({
        payerKey: sender.publicKey,
        recentBlockhash: blockhash,
        instructions: [instruction],
    }).compileToV0Message();

    const tx = new VersionedTransaction(message);
    tx.sign([sender]);

    console.log(Buffer.from(tx.serialize()).toString("base64"));
})();