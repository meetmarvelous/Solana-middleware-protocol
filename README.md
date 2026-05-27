<div align="center">

<img src="https://sendratx.vercel.app/logo.png" alt="Sendra" height="60" />

# Sendra

**The execution reliability layer for Solana.**

Sendra ensures your transactions land — handling RPC routing, fee optimization, simulation, and retries so your application doesn't have to.

[![npm](https://img.shields.io/npm/v/sendra-tx.svg?logo=npm&logoColor=fff&label=npm&color=limegreen)](https://www.npmjs.com/package/sendra-tx)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built for Solana](https://img.shields.io/badge/Built%20for-Solana-9945FF)](https://solana.com)

[**Dashboard**](https://sendratx.vercel.app) · [**Docs**](https://sendratxdocs.vercel.app/docs) · [**npm**](https://www.npmjs.com/package/sendra-tx)

</div>

---

## The Problem

On Solana, a successful RPC submission is only the first step. Between submission and finalization, a transaction must survive the gossip network, pass QUIC-based TPU flow control, and be included in a block before its 60-second blockhash expires.

Most developers hit this and build their own retry loops — **for every project, from scratch.**

Sendra closes this execution gap once, so you never have to again.

---

## Install

```bash
npm install sendra-tx @solana/web3.js
```

---

## Quick Start

```typescript
import { SendWithReliability } from "sendra-tx";

const result = await SendWithReliability(
  {
    type: "params",
    instructions,
    payer: sender,
  },
  wallet,
  {
    maxRetries: 10,
    commitment: "confirmed",
    logger: (e) => console.log(`[Sendra] ${e.step}: ${e.message}`),
  }
);

if (result.success) {
  console.log(`Landed in ${result.attempts} attempt(s). Sig: ${result.signature}`);
}
```

That's it. Sendra handles routing, simulation, fee optimization, and retries automatically.

---

## How It Works

Every transaction goes through a deterministic 6-stage pipeline:

```
① Select RPC      →  Probe endpoints, pick the fastest node closest to the network tip
② Build Tx        →  Construct payload with fresh blockhash and correct account refs
③ Optimize Fees   →  Compute ideal priority fee from live account contention data
④ Simulate        →  Pre-flight check against live chain state — catch failures before they cost you
⑤ Send & Confirm  →  Broadcast and monitor until on-chain confirmation
⑥ Auto-Retry      →  On failure: new blockhash, recalibrated fee, re-routed RPC — automatically
```

---

## Works With Pre-built Transactions

Sendra wraps any transaction — swaps, mints, DeFi interactions, custom programs:

```typescript
const result = await SendWithReliability(
  {
    type: "built",
    serializedTx: false,
    transaction: versionedTransaction, // your Jupiter swap, Metaplex mint, etc.
  },
  signer,
  { maxRetries: 3 }
);
```

---

## Signer Support

Works with wallets and backend keypairs alike:

```typescript
// Wallet adapter (Phantom, Backpack, Solflare)
const signer = wallet;

// Backend / server-side keypair
const signer = {
  publicKey: keypair.publicKey,
  signTransaction: async (tx) => {
    tx.sign([keypair]);
    return tx;
  },
};
```

Non-custodial by design — Sendra never touches your private keys.

---

## Response

```typescript
{
  success: boolean;
  signature: string;
  attempts: number;
  error?: string;
}
```

---

## Real Transactions on Devnet

Tested under real network conditions — RPC variability, congestion, and blockhash expiry:

| # | Transaction | Handled by Sendra |
|---|-------------|-------------------|
| 1 | [4eRS2VFe...](https://explorer.solana.com/tx/4eRS2VFeMKa3VSXcicKuMzWwPofFPk53YU4hJvWvjho3Ce9amNgQ6RMvrbH55dsr1557PdABRZ5zfxw6M8P96DMB?cluster=devnet) | RPC selection + fee optimization + confirmation |
| 2 | [4xWw62Rf...](https://explorer.solana.com/tx/4xWw62RfjLomaYnfpxgoLjHkoP3JENg7a3R1iH3Cu3xzu6847XXimbnsTw5J2DJREFnnxqbuE4TZXLtx1eod9MD1?cluster=devnet) | Retry with fresh blockhash + re-route |
| 3 | [5ofe726Z...](https://explorer.solana.com/tx/5ofe726Z3DhSGik6w62XZRDU4dgjeeiaSzTQzUDKoLSubJ7taYiGXZKMbL6S1mqFYqTuDd6Ur6LW49fMUiYxue1X?cluster=devnet) | Fee escalation + confirmed |

---

## Architecture

Sendra is a Turborepo monorepo with fully modular packages — swap, extend, or replace any layer independently:

```
packages/
├── sdk/            # Public entry point — SendWithReliability()
├── core/           # Execution orchestrator and state machine
├── router/         # RPC probe, selection, and failover
├── fee-optimizer/  # Real-time priority fee calculation
├── simulator/      # Pre-flight transaction simulation
├── rpc-client/     # Broadcast and confirmation polling
├── tx-builder/     # Build and rebuild transactions
└── logger/         # Structured execution traces

apps/
├── dashboard/      # Real-time monitoring dashboard
└── docs/           # Documentation site
```

---

## Who This Is For

- **dApp developers** — swaps, mints, transfers where failures hurt UX
- **Trading bots** — automated execution that can't afford silent drops
- **Backend services** — server-side Solana interactions with no manual retry logic
- **DeFi protocols** — high-stakes execution where every transaction counts

---

## Roadmap

- [x] TypeScript SDK
- [x] RPC routing and failover
- [x] Dynamic fee optimization
- [x] Pre-flight simulation
- [x] Auto-retry with blockhash refresh
- [x] Real-time dashboard
- [ ] Rust SDK
- [ ] Python SDK
- [ ] Go SDK
- [ ] Mainnet execution benchmarks
- [ ] Advanced execution analytics

---

## Contributing

```bash
git clone https://github.com/sarthakNITT/solana-middleware-protocol
cd solana-middleware-protocol
bun install
bun run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Keep packages modular, add shared types in `@repo/types`, test flows before submitting PRs.

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
  <sub>Built for Solana · <a href="https://sendratx.vercel.app">sendratx.vercel.app</a></sub>
</div>
