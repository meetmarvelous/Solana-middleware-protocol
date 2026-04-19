Running Solana transactions from a backend environment (Server-side) introduces different requirements than browser sessions. Resilience, error classification, and automated recovery are the primary concerns.

## 1. Headless Execution Environment

In a backend context (e.g., a rewards bot or an automated market maker), there is no user to manually retry a transaction. Sendra provides the "Set and Forget" infrastructure required for these cases.

**Primary Configuration for Backend**:
- **`maxRetries`**: High (e.g., 20+).
- **`commitment`**: `finalized` (for absolute state certainty).
- **`skipSimulation`**: `false` (never disable simulation on headless agents).

## 2. Implementing a Backend Signer

For server-side usage, you must implement a `Signer` that uses an environment-locked secret key or an HSM (Hardware Security Module).

```typescript
const secret = process.env.SYSTEM_KEY;
const authority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));

const backendSigner = {
  publicKey: authority.publicKey,
  signTransaction: async (tx) => {
    tx.sign([authority]);
    return tx;
  }
};
```

## 3. High-Throughput Batch Processing

When sending a batch of 1,000 transactions, the "Success Status" of each is decoupled. Sendra's engine runs in parallel, managing the unique blockhash and priority fee requirements for every item in the queue.

- **Account Isolation**: Sendra identifies if multiple transactions in your batch are contending for the same account and optimizes their relative inclusion priority.

## 4. Log Streaming & Observability

Observability is crucial for backend services. We recommend piping the Sendra `logger` stream into your enterprise logging system (e.g., Datadog, ELK, or generic stdout).

```typescript
await SendWithReliability(params, signer, {
  logger: (e) => {
    console.log(JSON.stringify({ 
      service: 'sendra-engine', 
      step: e.step, 
      msg: e.message, 
      ts: new Date().toISOString() 
    }));
  }
});
```

## Developer Insight: Handling "Insufficient Funds"

A common edge case in backend usage is a "Fund Exhaustion" events. If your backend wallet runs low on SOL to pay for priority fees, Sendra's simulation will detect the `InsufficientFundsForRent` or `AccountNotFound` error in the pre-flight stage, preventing the transaction from entering the broadcast loop and saving you debugging time on "Unknown Transaction Failures."
