# Sendra

Reliable transaction execution layer for Solana.

---

## 🚀 What is Sendra?

Sendra is a developer-focused SDK that ensures Solana transactions are executed reliably. Instead of just sending a transaction and hoping it lands, Sendra manages the full lifecycle — from construction to confirmation — handling failures, retries, and network issues automatically.

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

## 💡 Vision

Sendra aims to become the execution layer for Solana — ensuring every transaction is not just sent, but successfully landed.

---

## 📌 Summary

Sendra guarantees that your transaction lands, not just gets sent.