The Sendra Quickstart is designed to get you from a raw Solana instruction to a reliably confirmed on-chain transaction in under five minutes. This guide assumes you have a basic understanding of Solana transactions but want to offload the complexity of execution to Sendra.

## Prerequisites

Before starting, ensure you have the following installed and configured:

- **Node.js**: v18.0.0 or higher.
- **Solana Web3.js**: `@solana/web3.js` v1.9.0 or higher.
- **RPC Endpoint**: A valid Solana RPC URL.

## 1. Environment Initialization

First, install the Sendra SDK into your project.

```bash
[multi]
pnpm add @sendra/sdk @solana/web3.js
npm install @sendra/sdk @solana/web3.js
yarn add @sendra/sdk @solana/web3.js
bun add @sendra/sdk @solana/web3.js
```

In your application, you will need to provide at least one RPC URL. Sendra's Dynamic Router works best when given multiple providers to benchmark against.

```typescript
const RPC_URLS = [
  "https://mainnet.helius-rpc.com/?api-key=...",
  "https://solana-mainnet.g.alchemy.com/v2/..."
];
```

## 2. Defining the Execution Intent

Unlike standard SDKs, you don't need to fetch a blockhash or set priority fees manually. You simply define the "Intent"—the set of instructions you want to execute.

```typescript
import { SystemProgram, PublicKey } from "@solana/web3.js";

const sender = new PublicKey("...");
const receiver = new PublicKey("...");

const instructions = [
  SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: receiver,
    lamports: 1000000,
  })
];
```

## 3. Reliable Transmission

Now, pass your instructions to `SendWithReliability`. Sendra will automatically handle the simulation, fee optimization, and re-signing logic.

```typescript
import { SendWithReliability } from "@sendra/sdk";

const result = await SendWithReliability(
  {
    type: "params",
    instructions,
    payer: sender
  },
  wallet,
  { 
    maxRetries: 5,
    logger: (event) => console.log(`[Sendra] ${event.message}`)
  }
);

if (result.success) {
  console.log(`Successfully finalized: ${result.signature}`);
}
```

## Developer Insight: The "Wait" Period

During the `SendWithReliability` execution, you may see multiple `RETRY_ATTEMPT` events in the log. This is normal behavior during Solana network congestion. Sendra is actively re-calculating the optimal inclusion path for your transaction in the background, ensuring you don't have to manually restart the process.
