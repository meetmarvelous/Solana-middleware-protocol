The Signer pattern is a fundamental architectural choice in Sendra that ensures absolute security and non-custodial operation. By abstracting the signing process into a callback interface, Sendra can rebuild transactions during the retry loop without ever touching your private keys.

## The `Signer` Interface

In Solana, a transaction is structurally tied to its blockhash. Since Sendra refreshes the blockhash on every retry attempt to ensure the 60-second window is reset, the transaction signature must also be refreshed. 

```typescript
interface Signer {
  signTransaction(tx: VersionedTransaction): Promise<VersionedTransaction>;
  
  publicKey: PublicKey;
}
```

## Supported Implementations

Sendra is designed to be compatible with every major signing pattern in the Solana ecosystem.

### 1. Wallet Adapter (Frontend)
The standard `@solana/wallet-adapter-react` satisfies the Signer interface out of the box.

```typescript
const { signTransaction, publicKey } = useWallet();
await SendWithReliability(params, { signTransaction, publicKey });
```

### 2. Local Keypair (Backend)
For automated tasks running on a server, you can wrap a standard `Keypair`.

```typescript
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.fromSecretKey(Uint8Array.from([...]));
const signer = {
  publicKey: keypair.publicKey,
  signTransaction: async (tx) => {
    tx.sign([keypair]);
    return tx;
  }
};
```

## Security Philosophy: Zero-Key Access

Sendra never handles raw private keys, mnemonic phrases, or seed buffers. The division of labor is strict:
- **Sendra**: Orchestrates network metadata, priority fees, and RPC routing.
- **Your Application**: Orchestrates user intent and secure signing.

This isolation means that even if a Sendra dependencies were compromised, your root private keys remain in your application's secure context (Hardware wallet, environment variable, or HSM).

## Signature Fatigue in Retries

A strategic tradeoff of the Signer pattern is that it requires a new signature for every rebuild. 
- **Automated Signers**: For backend bots or server-side scripts, this happens in milliseconds with no overhead.
- **Interactive Wallets (Phantom/Ledger)**: The user will receive a new "Approve Transaction" prompt if the first attempt fails. 

**Developer Tip**: Use the `logger` to inform users: "Network is congested. We are re-signing with a higher priority fee to ensure your transaction lands."

## Best Practices for Custom Signers

When implementing a custom signer (e.g., using AWS KMS or a hardware security module):
- **Idempotency**: Ensure that signing the same instructions with a different blockhash is permitted.
- **Latency**: Minimize the time taken to return the signed transaction, as the blockhash fetched in Stage 1 of the Sendra lifecycle is already "aging" while waiting for your signature.
