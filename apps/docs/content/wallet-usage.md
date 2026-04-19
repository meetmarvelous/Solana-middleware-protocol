Implementing Sendra in a dApp frontend requires careful UX management. While Sendra increases the landing rate, it changes the standard "One-Click-and-Done" behavior into an active execution process.

## 1. Integrating with Solana Wallet Adapter

Sendra is natively compatible with the official `@solana/wallet-adapter-react`.

```typescript
import { useWallet } from "@solana/wallet-adapter-react";

const { publicKey, signTransaction } = useWallet();

const handleTransaction = async () => {
    const signer = { publicKey, signTransaction };
    
    const result = await SendWithReliability(params, signer);
}
```

## 2. Managing the Re-signing User Experience

If a transaction needs to be rebuilt during a retry (due to blockhash expiry or fee bumping), the browser extension (Phantom, Solflare) will prompt the user to sign again.

- **Developer Tip**: Do not surprise the user with multiple popups. Always display an "Active Optimization" banner in your UI.
- **Example UX Message**: *"The network is currently busy. We are re-calculating the best path for your transaction. Please approve the incoming signature request to maintain your position in the queue."*

## 3. The Power of Real-time Status Updates

Use the Sendra `logger` to update your UI state. This provides users with a sense of "Progress" rather than a stalled loading circle.

```typescript
const [status, setStatus] = useState("Preparing...");

await SendWithReliability(params, signer, {
  logger: (e) => setStatus(e.message)
});
```

## 4. Hardware Wallets (Ledger) Considerations

Users with Ledger devices have higher latency during the signing phase. 
- **Time to Live**: Because the blockhash age is limited, ensure your code fetches everything (fees, context slot) *before* triggering the signer phase.
- Sendra handles this automatically, but you should inform Ledger users that they must keep their device connected and the Solana app open throughout the Sendra recovery loop.

## Developer Insight: When to NOT use Sendra

If your dApp is doing low-stakes, non-critical operations (like requesting a faucet or updating a social profile) where a failure is easily handled by the user clicking "Retry," the overhead of Sendra might not be necessary. Sendra is a **Mission-Critical** tool. Use it for trades, mints, and state-changes where a failed transaction results in a poor user outcome.
