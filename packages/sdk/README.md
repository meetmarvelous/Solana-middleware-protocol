# Sendra — Reliability Layer for Solana Transactions

> Adaptive transaction execution infrastructure for Solana.

[![npm version](https://badge.fury.io/js/sendra-tx.svg)](https://www.npmjs.com/package/sendra-tx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is Sendra?

Sendra is a production-grade execution layer designed to improve transaction reliability and execution success rates on the Solana blockchain. It intelligently handles RPC instability, automatic retries, blockhash expiration, dynamic fee optimization, smart routing, and robust confirmation monitoring.

Execution reliability should be infrastructure, not application logic.

## Why Sendra?

Solana developers often face pain points when dealing with high network congestion and unpredictable RPC endpoints. Common struggles include:
- Dropped transactions
- Network congestion causing timeouts
- Building complex, custom retry systems
- Fragmented infrastructure tooling
- Custom failover logic that bloats application code

Sendra abstracts these problems away, giving you a unified, battle-tested execution pipeline.

## Features

- **Adaptive Retries:** Intelligently retries transactions based on network state and error types.
- **RPC Routing:** Automatically routes and fails over between multiple RPC providers to ensure uptime.
- **Simulation:** Pre-simulates transactions to prevent landing predictable failures.
- **Fee Optimization:** Dynamically adjusts compute unit prices and limits to ensure inclusion during congestion.
- **Execution Monitoring:** Tracks the full lifecycle of a transaction from broadcast to finality.
- **Confirmation Tracking:** High-fidelity tracking of confirmation states.
- **Detailed Logs:** Emits comprehensive execution telemetry for easy debugging.
- **Modular Architecture:** Use the components you need, from builders to routers and optimizers.

## Installation

```bash
npm install sendra-tx @solana/web3.js
```

and

```bash
bun add sendra-tx @solana/web3.js
```

## Quick Start

```typescript
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SendWithReliability } from "sendra-tx";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const signer = Keypair.generate();
const receiver = new PublicKey("11111111111111111111111111111111");
const amount = 1_000_000; // 0.001 SOL

async function main() {
  const result = await SendWithReliability({
    connection,
    signer,
    receiver,
    amount,
    maxRetries: 5
  });

  console.log(`Transaction executed successfully: ${result.signature}`);
}

main();
```

## Built Transaction Example

Sendra works seamlessly with complex transactions, including swaps, minting, and versioned transactions.

```typescript
import { VersionedTransaction } from "@solana/web3.js";
import { SendWithReliability } from "sendra-tx";

// Example for executing a pre-built swap or minting transaction
async function executeComplexTx(
  connection: Connection,
  signer: Keypair,
  transaction: VersionedTransaction
) {
  const result = await SendWithReliability({
    connection,
    signer,
    transaction, // Sendra handles versioned transactions automatically
    maxRetries: 5
  });

  console.log(`Complex transaction confirmed: ${result.signature}`);
}
```

## Dashboard + Logs

Sendra comes with built-in tools to give you total visibility into your transaction pipeline:
- **Real-Time Dashboard:** Monitor execution success rates, RPC health, and network state visually.
- **Monitoring & Execution Control:** Gain granular control over how transactions are processed and retried.
- **Sendra Logs:** Persistent file-based and console logging to track latency, fees, retries, and errors.
- **Debugging Execution Pipeline:** Trace transactions step-by-step from simulation to confirmation.

## Architecture

Sendra is built as a set of modular, interoperable packages:
- **Router:** Manages RPC failover and intelligent endpoint selection.
- **Retry Engine:** Handles adaptive backoffs and state-aware retries.
- **Fee Optimizer:** Calculates competitive compute unit limits and priority fees.
- **Simulator:** Runs pre-flight checks against the network.
- **Tx Builder:** Simplifies the construction of complex, versioned transactions.
- **RPC Client:** Optimized client wrapper for interacting with Solana nodes.
- **Logger:** Emits structured telemetry and metrics for observability.

## Real Execution

- **Tested on Solana Devnet:** Hardened through extensive stress testing.
- **Real Transaction Execution:** Not just theory—Sendra powers actual on-chain executions.
- **Retries and Monitoring Tested:** Built to survive heavy network congestion and RPC instability.

## Links

- [Website](#)
- [Docs](#)
- [GitHub](#)
- [npm](https://www.npmjs.com/package/sendra-tx)

## Vision

Sendra aims to become the execution infrastructure layer for Solana.

Developers write the logic. Sendra ensures it lands.
