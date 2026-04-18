# Sendra

Transactions that don’t fail.

Reliable transaction execution layer for Solana.

---

## 🚀 What is Sendra?

Sendra is a developer-focused SDK that ensures Solana transactions are executed reliably. Instead of just sending a transaction and hoping it lands, Sendra manages the full lifecycle — from construction to confirmation — handling failures, retries, and network issues automatically.

---

## ⚡ Why not build this yourself?

You can build parts of this yourself — retry logic, RPC fallback, fee tuning.

But in production, reliability is not one problem — it’s multiple interacting problems:

* dynamic network conditions
* RPC instability
* fee competitiveness
* blockhash expiry timing

Handling all of this together, consistently, is complex and error-prone.

Sendra provides this as a single, reliable execution layer — so you don’t have to rebuild it for every project.

---

## ❗ Problem

Solana transactions often fail due to:

- RPC node failures or latency  
- Network congestion  
- Incorrect or insufficient priority fees  
- Stale blockhashes  

Developers typically need to build their own:

- Retry logic  
- RPC failover systems  
- Fee estimation mechanisms  
- Monitoring loops  

This is complex, error-prone, and repetitive.

---

## 👥 Who is this for?

* dApp developers (DeFi, NFTs, payments)
* Trading bots and automation systems
* Backend services interacting with Solana
* Any system where transaction reliability matters

If your application depends on transactions landing successfully, Sendra is built for you.

---

## 🧠 When should you use Sendra?

Use Sendra when:
- your transactions fail intermittently
- you rely on user-triggered actions (swap, mint, transfer)
- you need higher success rates in production
- you don’t want to build custom retry + infra logic

If reliability matters, Sendra should be part of your stack.

---

## ✅ Solution

Sendra provides a single SDK function that handles everything:

- Smart RPC routing (fastest node selection)  
- Dynamic fee optimization  
- Pre-flight simulation  
- Automatic retries with fresh blockhash  
- Transaction monitoring and confirmation  

👉 Instead of:
```
write custom retry + routing + fee logic
```

👉 You just do:
```
sendWithReliability(...)
```

---

## 💡 Example Use Case

A user clicks “Swap” in your dApp.

Without Sendra:

* Transaction may fail silently
* You need manual retries
* Users get poor experience

With Sendra:

* Transaction is simulated before sending
* If it fails, it retries with better conditions
* User gets a confirmed transaction without manual intervention

---

## ⚔️ Without vs With Sendra

Without Sendra:
- Fire-and-forget transaction
- No retry strategy
- RPC dependency
- Silent failures

With Sendra:
- Adaptive execution pipeline
- Automatic retries with better conditions
- RPC failover
- Higher success rate

---

## ⚡ Quick Start

```ts
import { sendWithReliability } from "sendra";
const result = await sendWithReliability(
  {
    receiver: "RECEIVER_PUBLIC_KEY",
    amount: 1000,
  },
  signer,
  { maxRetries: 3 }
);
console.log(result.signature);
```

That’s it — Sendra handles routing, retries, and optimization automatically.

---

## 📦 Installation

```bash
npm install sendra
```

---

## ⚙️ Usage

```ts
import { sendWithReliability } from "sendra";

const result = await sendWithReliability(
  {
    receiver: "RECEIVER_PUBLIC_KEY",
    amount: 1000,
  },
  signer,
  { maxRetries: 3 }
);

console.log(result);
```

### Using Pre-built Transactions (Swap, Mint, etc.)
```ts
const result = await sendWithReliability(
  {
    type: "built",
    serializedTx: false,
    transaction: versionedTransaction, // prebuilt tx
  },
  signer,
  { maxRetries: 3 }
);
```

Works with swaps, minting, and any program interactions.

---

## 🔍 Real Transaction Proof

Tested on Solana Devnet with successful executions using Sendra.

Example transactions:
1. [4eRS2VFeMKa3VS...](https://explorer.solana.com/tx/4eRS2VFeMKa3VSXcicKuMzWwPofFPk53YU4hJvWvjho3Ce9amNgQ6RMvrbH55dsr1557PdABRZ5zfxw6M8P96DMB?cluster=devnet)
2. [4xWw62RfjLomaY...](https://explorer.solana.com/tx/4xWw62RfjLomaYnfpxgoLjHkoP3JENg7a3R1iH3Cu3xzu6847XXimbnsTw5J2DJREFnnxqbuE4TZXLtx1eod9MD1?cluster=devnet)
3. [5ofe726Z3DhSGi...](https://explorer.solana.com/tx/5ofe726Z3DhSGik6w62XZRDU4dgjeeiaSzTQzUDKoLSubJ7taYiGXZKMbL6S1mqFYqTuDd6Ur6LW49fMUiYxue1X?cluster=devnet)

Sendra handled:
- **RPC selection**
- **Fee optimization**
- **Retry on failure**
- **Final confirmation**

This is real transaction executed using the SDK (not simulated logs).
These transactions were executed under real network conditions including RPC variability and congestion.

---

## 📊 Execution Metrics
In our test transactions:
* Attempts: 1–2 (with retry when needed)
* Confirmation time: ~2–6 seconds
* Success rate: improved under unstable network conditions
Comparison:
- Normal transaction: may fail or get dropped under congestion
- Sendra: adapts (retry + fee + RPC switch) and lands successfully

---

## 🔑 Signer

Sendra requires a signer to sign transactions.

### Wallet Adapter (Recommended)

Works directly with Phantom, Solflare, Backpack, etc.

```ts
const signer = wallet;
```

---

### Backend Keypair

```ts
const signer = {
  publicKey: keypair.publicKey,
  signTransaction: async (tx) => {
    tx.sign([keypair]);
    return tx;
  },
};
```

---

## 🔄 How it Works

1. Select fastest RPC  
2. Build transaction  
3. Optimize priority fee  
4. Simulate transaction  
5. Sign transaction  
6. Send to network  
7. Monitor confirmation  
8. Retry with new blockhash if needed  

---

## 🧱 Architecture

Sendra is built as a modular execution pipeline:

* Router → selects best RPC
* Tx Builder → constructs or rebuilds transactions
* Fee Optimizer → sets competitive priority fee
* Simulator → checks for failures before sending
* RPC Client → broadcasts transaction
* Logger → tracks status and retries

All components work together to ensure reliable execution.

---

## ✨ Features

- Smart RPC failover  
- Dynamic fee optimization  
- Pre-flight simulation  
- Automatic retry engine  
- Transaction confirmation monitoring  
- Modular architecture  

---

## 📊 Response Format

```json
{
  "status": "success" | "failed",
  "signature": "string",
  "attempts": number
}
```

---

## 🧪 Demo

Run a demo script:

```bash
bun run demo.ts
```
---

## 🚀 Try it now

Integrate Sendra in your project and test it under real network conditions.

If you're building on Solana, this can immediately improve your transaction success rate.

---

## 🏗️ Project Structure

```
packages/
  sdk/            # Public SDK entry
  core/           # Orchestration logic
  router/         # RPC selection
  fee-optimizer/  # Fee logic
  simulator/      # Pre-flight checks
  rpc-client/     # Send + status
  tx-builder/     # Build/rebuild tx
```

---

## 🤝 Contributing

### Setup

```bash
git clone <repo>
cd sendra
npm install
```

### Run locally

```bash
npm run dev
```

### Guidelines

- Keep packages modular  
- Avoid tight coupling between packages  
- Add shared types in `@repo/types`  
- Write reusable functions  
- Test flows before submitting PR  

---

## ⚠️ Current Status
- Optimized for standard transactions via params input
- Supports pre-built transactions (swap, mint, etc.)
- Native support for all transaction types is actively expanding

---

## 💡 Vision

Sendra aims to become the execution layer for Solana — ensuring every transaction is not just sent, but successfully landed.

---

## 📌 Summary
Sendra is not just a transaction sender.
It is the execution layer for Solana transactions — ensuring they land reliably under real network conditions.

