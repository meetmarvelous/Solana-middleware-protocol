export const SOLANA_DEVNET_RPC_URL = "https://api.devnet.solana.com" // use it for testing from postman
export const SOLANA_ALCHEMY_RPC_URL = "https://solana-devnet.g.alchemy.com/v2/zHJtGhgb5h3-lIb9aoIlM"
export const SOLANA_HELIUS_RPC_URL = "https://devnet.helius-rpc.com/?api-key=947560ea-5abd-434f-843e-2795916f3170"
export const SOLANA_QUICKNODE_RPC_URL = "https://wiser-young-slug.solana-devnet.quiknode.pro/fa2a42af7526932a4d52b8a1f2523a1576950737"

export const pipeline = [
    { label: "Select RPC", desc: "Probes multiple RPC endpoints and picks the fastest, most reliable node for your transaction." },
    { label: "Build Transaction", desc: "Constructs the full transaction payload with recent blockhash and correct account references." },
    { label: "Optimize Fees", desc: "Dynamically computes the ideal priority fee based on current network congestion — never overpay." },
    { label: "Simulate", desc: "Runs a pre-flight simulation against live chain state to catch reverts before they cost you." },
    { label: "Send & Confirm", desc: "Signs, broadcasts, and monitors the transaction until on-chain confirmation is received." },
    { label: "Auto-Retry", desc: "If anything fails — timeout, dropped tx, RPC error — Sendra automatically retries with a fresh route." },
];

export const demoLogs = [
    { type: "info", text: "Initializing transaction simulation...", delay: 0 },
    { type: "success", text: "Simulation passed — no revert detected", delay: 900 },
    { type: "info", text: "Computing optimal compute unit price...", delay: 1700 },
    { type: "success", text: "Fee optimized: 0.000031 SOL (saved 42%)", delay: 2600 },
    { type: "info", text: "Selecting best RPC endpoint (latency scan)...", delay: 3400 },
    { type: "success", text: "Routed to primary: ny1.helius-rpc.com (12ms)", delay: 4200 },
    { type: "info", text: "Sending transaction...", delay: 5000 },
    { type: "warn", text: "Attempt 1 timed out — switching RPC node", delay: 5900 },
    { type: "info", text: "Retrying via fallback: fra1.helius-rpc.com...", delay: 6700 },
    { type: "success", text: "✓ Confirmed in slot 312,847,291 (1.2s)", delay: 7600 },
];

export const faqData = [
    {
        q: "What is Sendra?",
        a: "Sendra is a transaction reliability layer for Solana. It intercepts your transactions before they hit the network, simulates them, optimizes fees, selects the fastest RPC, and handles retries automatically — ensuring every transaction lands.",
    },
    {
        q: "How does Sendra integrate with my existing app?",
        a: "Sendra provides a drop-in SDK. Replace your existing sendTransaction call with sendWithReliability — no infrastructure changes, no new dependencies, no migration. It works with any Solana SDK.",
    },
    {
        q: "How is Sendra different from standard RPC providers?",
        a: "Standard RPCs are just pipes — they send your transaction and hope it lands. Sendra adds an intelligent execution layer: pre-flight simulation, dynamic fee optimization, multi-node routing, and automatic retry with exponential backoff.",
    },
    {
        q: "Does Sendra modify my transaction?",
        a: "Sendra only adjusts the compute unit price (priority fee) based on real-time network conditions. Your transaction instructions, accounts, and logic remain completely untouched.",
    },
    {
        q: "What happens when a transaction fails?",
        a: "Sendra automatically retries with a fresh RPC route and recalculated fees. It uses exponential backoff and intelligent node switching to maximize the chance of confirmation, up to your configured retry limit.",
    },
    {
        q: "What Solana programs does Sendra support?",
        a: "Sendra is program-agnostic. It works with any Solana program — token transfers, DeFi swaps, NFT mints, governance votes, or custom programs. If it's a Solana transaction, Sendra can handle it.",
    },
    {
        q: "Is Sendra open source?",
        a: "Yes. Sendra's SDK and core packages are fully open source. You can inspect every line of code, contribute, or fork it for your own use.",
    },
];