import { SendWithReliability } from "@repo/core";
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as fs from 'fs';
import * as path from 'path';

// ANSI escape codes for beautiful terminal styling
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

async function main() {
  console.log(`\n${colors.bold}${colors.magenta}=== SENDRA MULTI-SENDER CLI ===${colors.reset}\n`);

  // Connect to Solana Devnet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  // Load or generate transient keypair
  const secretKeyPath = path.join(process.cwd(), 'dev-wallet.json');
  let walletKeypair: Keypair;

  if (fs.existsSync(secretKeyPath)) {
    const secretKeyData = JSON.parse(fs.readFileSync(secretKeyPath, 'utf8'));
    walletKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyData));
    console.log(`${colors.green}✔ Loaded existing test wallet:${colors.reset} ${colors.bold}${walletKeypair.publicKey.toBase58()}${colors.reset}`);
  } else {
    walletKeypair = Keypair.generate();
    fs.writeFileSync(secretKeyPath, JSON.stringify(Array.from(walletKeypair.secretKey)));
    console.log(`${colors.green}✔ Generated new test wallet:${colors.reset} ${colors.bold}${walletKeypair.publicKey.toBase58()}${colors.reset}`);
  }

  // Check balance
  let balance = await connection.getBalance(walletKeypair.publicKey);
  console.log(`${colors.cyan}Current Balance:${colors.reset} ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

  // Request airdrop if needed
  if (balance < 0.03 * LAMPORTS_PER_SOL) {
    const requestAmount = 0.05 * LAMPORTS_PER_SOL;
    console.log(`\n${colors.yellow}Balance low. Requesting airdrop of 0.05 SOL...${colors.reset}`);
    try {
      const airdropSig = await connection.requestAirdrop(walletKeypair.publicKey, requestAmount);
      const latestBlock = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: airdropSig,
        blockhash: latestBlock.blockhash,
        lastValidBlockHeight: latestBlock.lastValidBlockHeight
      });
      balance = await connection.getBalance(walletKeypair.publicKey);
      console.log(`${colors.green}✔ Airdrop confirmed! New Balance:${colors.reset} ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
    } catch (e: any) {
      console.error(`${colors.red}✗ Airdrop failed:${colors.reset} ${e.message}`);
      console.log(`\n${colors.yellow}Solana public faucet might be rate-limited. Please fund the wallet manually using your terminal:${colors.reset}`);
      console.log(`${colors.bold}Command:${colors.reset} ${colors.cyan}solana airdrop 1 ${walletKeypair.publicKey.toBase58()} --url devnet${colors.reset}\n`);
      return;
    }
  }

  // Generate 3 mock recipient addresses dynamically
  const recipients = [
    { address: Keypair.generate().publicKey.toBase58(), amount: 0.01 },
    { address: Keypair.generate().publicKey.toBase58(), amount: 0.005 },
    { address: Keypair.generate().publicKey.toBase58(), amount: 0.008 },
  ];

  console.log(`\n${colors.bold}Starting transaction batch to ${recipients.length} recipients...${colors.reset}`);

  // Create signer compatible with Sendra SDK
  const signer = {
    publicKey: walletKeypair.publicKey,
    signTransaction: async (tx: any) => {
      tx.sign([walletKeypair]);
      return tx;
    }
  };

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i]!;
    console.log(`\n${colors.bold}----------------------------------------${colors.reset}`);
    console.log(`${colors.bold}Recipient #${i + 1}:${colors.reset} ${recipient.address} (${recipient.amount} SOL)`);
    console.log(`----------------------------------------`);

    try {
      // Execute the real Sendra reliability transaction wrapper
      const result = await SendWithReliability(
        {
          type: "params",
          to: new PublicKey(recipient.address),
          amount: Math.round(recipient.amount * LAMPORTS_PER_SOL)
        },
        signer,
        {
          maxRetries: 5,
          logger: (event) => {
            const time = new Date().toLocaleTimeString();
            console.log(
              `${colors.gray}[${time}]${colors.reset} ${colors.cyan}[${event.step}]${colors.reset}` +
              (event.message ? ` - ${event.message}` : "") +
              (event.rpc ? ` (${event.rpc.replace("https://", "")})` : "") +
              (event.fee ? ` | Fee: ${event.fee} lamports` : "")
            );
          }
        },
        "devnet"
      );

      if (result.success) {
        console.log(`\n${colors.green}${colors.bold}✔ Transaction successfully landed!${colors.reset}`);
        console.log(`${colors.green}Signature:${colors.reset} ${colors.bold}${result.signature}${colors.reset}`);
        console.log(`${colors.green}Explorer Link:${colors.reset} https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);
      } else {
        console.log(`\n${colors.red}✗ Transaction failed: ${result.error}${colors.reset}`);
      }
    } catch (e: any) {
      console.log(`\n${colors.red}✗ Execution error: ${e.message}${colors.reset}`);
    }
  }

  console.log(`\n${colors.bold}${colors.magenta}=== Batch completed! ===${colors.reset}\n`);
}

main().catch((err) => {
  console.error(err);
});
