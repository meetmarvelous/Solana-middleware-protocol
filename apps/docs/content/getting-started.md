Sendra is a specialized execution orchestration layer for the Solana blockchain. It provides a deterministic pipeline for transaction submission, moving away from the "fire-and-forget" model of standard RPC nodes toward a state-aware, autonomous execution engine.

## The Execution Gap on Solana

In a traditional blockchain environment, submitting a transaction is often seen as a binary event: either the node accepts it, or it doesn't. However, on Solana, a "successful" submission to an RPC node is only the first link in a fragile chain of events. Between the point of submission and the point of finalization, a transaction must survive the Gossip network, pass through QUIC-based flow control at the leader's TPU (Transaction Processing Unit), and be included in a block before its 60-second blockhash expiry.

Sendra was engineered to fill this "Execution Gap." By wrapping the low-level JSON-RPC calls in a persistent state-machine, Sendra ensures that your transaction logic is executed regardless of transient network congestion, leader skips, or RPC synchronization lags.

## How Sendra Transforms Execution

Standard SDKs provide a thin wrapper around a single POST request to an RPC endpoint. Sendra, however, implements a multi-stage orchestration lifecycle for every single transaction:

- **State-Aware Routing**
  Sendra doesn't just broadcast to one node. It evaluates a cluster of providers, measuring not just latency but "data freshness" (slot height). It identifies the node closest to the network's current tip to ensure the blockhashes you use are as "young" as possible.

- **Pre-flight Integrity Guard**
  Before a transaction ever touches the network, Sendra simulates the state transition in a clean-room environment. This prevents the most common cause of wasted fees: "Logical Failures" (e.g., trying to swap with insufficient slippage or buying an NFT that was already sold).

- **Dynamic Inclusion Escalation**
  If a transaction isn't confirmed within a small window, Sendra doesn't just resend the same bytes. It performs an "Intelligent Refresh"—fetching a new blockhash, recalibrating the priority fee based on current account contention, and re-signing the transaction to secure a better position in the next leader's TPU queue.

## Installation & Setup

Sendra is designed to be lightweight and zero-dependency beyond the standard Solana web3 libraries.

```bash
# Core SDK and peer dependencies
npm install @sendra/sdk @solana/web3.js
```

### Initializing a Reliable Execution

The entry point for all reliability operations is the `SendWithReliability` function. It replaces the standard `connection.sendTransaction` and `connection.confirmTransaction` sequence with a single, resilient promise.

```typescript
import { SendWithReliability } from "@sendra/sdk";
import { SystemProgram, TransactionInstruction, PublicKey } from "@solana/web3.js";

async function executePayment(sender: PublicKey, receiver: PublicKey, lamports: number) {
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: receiver,
      lamports,
    })
  ];

  const { success, signature, error, attempts } = await SendWithReliability(
    {
      type: "params",
      instructions,
      payer: sender
    },

    wallet, 
    { 
      maxRetries: 10,
      commitment: "confirmed",
      logger: (e) => console.log(`[Sendra] ${e.step}: ${e.message}`)
    }
  );

  if (success) {
    console.log(`Transaction landed in ${attempts} attempts. Sig: ${signature}`);
  }
}
```

## Why Sendra is Production-Grade

Unlike simple "retry loops," Sendra is built for high-stakes financial infrastructure where transaction failure results in direct capital loss or degraded user trust.

- **Account Contention Analysis**
  Sendra identifies "hot" accounts (e.g., a popular Serum market or Raydium pool) and calculates the priority fee required to outbid other participants specifically for those accounts.

- **Non-Custodial Security**
  By using a callback-driven `Signer` interface, Sendra never needs access to private keys. It is fully compatible with Ledger, Phantom, and custom backend HSMs.

- **Reduced Operational Overhead**
  Developers no longer need to write complex "confirm-and-retry" logic or monitor blockhash expiry. Sendra turns transaction execution into a "Set and Forget" operation with deterministic results.
