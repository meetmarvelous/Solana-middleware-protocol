The Sendra SDK is a low-level orchestration framework designed for developers building mission-critical Solana infrastructure. It provides a unified execution interface that abstracts away the complexity of RPC rotation, fee management, and persistent retry logic.

## Primary Interface: `SendWithReliability`

The core of the SDK is the `SendWithReliability` function. This function oversees the entire transaction lifecycle, from structural assembly to final on-chain confirmation.

```typescript
async function SendWithReliability(
  params: SendraParams,
  signer: Signer,
  options: SendraOptions
): Promise<SendraResult>
```

### 1. The `SendraParams` Strategy

Sendra supports two primary operational patterns, allowing it to integrate at any stage of your existing transaction building pipeline.

- **Pattern A: Intent-Based (`type: "params"`)**
  This is the recommended pattern for most applications. You provide raw `TransactionInstruction` objects, and Sendra handles the heavy lifting of blockhash management, fee injection, and Address Lookup Table (ALT) resolution. 
  - `instructions`: `TransactionInstruction[]`
  - `payer`: `PublicKey`
  - `addressLookupTableAccounts`: (Optional) `AddressLookupTableAccount[]`

- **Pattern B: Pre-built Wrapping (`type: "built"`)**
  Designed for integration with external aggregators (e.g., Jupiter API). Sendra accepts a `VersionedTransaction`, extracts the operational intent, and rebuilds it with fresh network metadata during retries.
  - `transaction`: `VersionedTransaction`
  - `serializedTx`: (Optional) `boolean` for raw buffer inputs.

### 2. Non-Custodial `Signer` Abstraction

Security is a first-class citizen in Sendra. The SDK is natively non-custodial, meaning it never requires access to private keys or seeds. Instead, it uses a callback-driven signature model.

```typescript
interface Signer {
  signTransaction(tx: VersionedTransaction): Promise<VersionedTransaction>;
}
```
This interface is compatible with the standard `@solana/wallet-adapter-react` `signTransaction` method, as well as backend HSM implementations (AWS KMS, Azure Vault) and local `Keypair` wrappers.

### 3. Detailed `SendraOptions` Specification

Fine-tuning the execution engine is critical for specific use cases like high-frequency trading or mass distribution.

- **`maxRetries` (number)**
  Total reconstruction cycles allowed. Default: `5`. For congested environments like NFT mints, `15-20` is common.
- **`commitment` (Commitment)**
  The finality level to wait for. `"confirmed"` is recommended for most dApps. Use `"finalized"` for high-value financial transfers.
- **`logger` (Event Callback)**
  A high-frequency event stream. Provides real-time visibility into the engine's internal state transitions (e.g., `RPC_SELECTED`, `FEE_BUMPED`, `BLOCKHASH_REFRESHED`).
- **`skipSimulation` (boolean)**
  If true, skips the pre-flight guard. **Expert usage only**; disabling this removes protection against logical failures.
- **`minContextSlot` (number)**
  Ensures the RPC is at least at this slot before simulation, preventing "lagging state" failures.

---

## The Execution State Machine

Unlike standard SDKs that follow a linear `send -> wait` path, the Sendra SDK implements a recursive state machine.

1. **Discovery State**: Benchmarking RPCs to find the freshest node.
2. **Construction State**: Merging instructions, ALTs, and a fresh blockhash into a `VersionedTransaction`.
3. **Guard State**: Simulating against current cluster state to discover Compute Unit requirements and validate business logic.
4. **Execution State**: Broadcasting via the optimal QUIC path.
5. **Observation State**: Monitoring the cluster for inclusion.
6. **Recovery State (Recursive)**: On failure, classifying the error (Congestion vs. Expiry vs. RPC Lag) and transitioning back to the **Discovery** or **Construction** state with updated multipliers.

## Developer Insights & Best Practices

- **Handling Ledger/Hardware Wallets**
  Because Sendra rebuilds the transaction during retries to increase the probability of landing, users on hardware wallets will be prompted to sign again if the first attempt fails. It is a best practice to inform users that a "Reliable Transfer" may require multiple sign approvals during network congestion.

- **Monitoring Inclusion with the Logger**
  Don't leave your users in the dark. Pipe the `logger` events directly into your UI (e.g., "Re-calculating fees for higher priority...") to increase transparency and user confidence during the ~30-60 second execution window.
