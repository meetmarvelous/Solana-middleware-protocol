export const DEVNET_RPC_URLS = Object.entries(process.env || {})
    .filter(([key, value]) => key.startsWith("SENDRA_DEVNET_URL_") && value)
    .map(([_, value]) => value as string);

if (DEVNET_RPC_URLS.length === 0) {
    DEVNET_RPC_URLS.push("https://api.devnet.solana.com");
}

export const MAINNET_RPC_URLS = Object.entries(process.env || {})
    .filter(([key, value]) => key.startsWith("SENDRA_MAINNET_URL_") && value)
    .map(([_, value]) => value as string);

if (MAINNET_RPC_URLS.length === 0) {
    MAINNET_RPC_URLS.push("https://api.mainnet-beta.solana.com");
}

export const pipeline = [
    { label: "Select RPC", desc: "Probes multiple RPC endpoints and picks the fastest, most reliable node for your transaction." },
    { label: "Build Transaction", desc: "Constructs the full transaction payload with recent blockhash and correct account references." },
    { label: "Optimize Fees", desc: "Dynamically computes the ideal priority fee based on current network congestion — never overpay." },
    { label: "Simulate", desc: "Runs a pre-flight simulation against live chain state to catch reverts before they cost you." },
    { label: "Send & Confirm", desc: "Signs, broadcasts, and monitors the transaction until on-chain confirmation is received." },
    { label: "Auto-Retry", desc: "If anything fails — timeout, dropped tx, RPC error — Sendra automatically retries with a fresh route." },
];

export const demoLogs = [
    { type: "info", text: "[INIT] Starting transaction execution...", delay: 200 },

    { type: "info", text: "[RPC] Selecting fastest RPC endpoint...", delay: 600 },
    { type: "success", text: "[RPC_SELECTED] Helius (42ms latency)", delay: 1000 },

    { type: "info", text: "[BUILD] Constructing transaction...", delay: 1400 },
    { type: "info", text: "[SIMULATION] Running pre-flight simulation...", delay: 1800 },
    { type: "success", text: "[SIMULATION] Success — no errors detected", delay: 2200 },

    { type: "info", text: "[FEE] Calculating optimal priority fee...", delay: 2600 },
    { type: "success", text: "[FEE_APPLIED] 5,000 micro-lamports", delay: 3000 },

    { type: "info", text: "[SIGN] Awaiting wallet signature...", delay: 3400 },
    { type: "success", text: "[SIGNED] Transaction signed successfully", delay: 3800 },

    { type: "info", text: "[SEND] Broadcasting transaction...", delay: 4200 },
    { type: "info", text: "[STATUS] Pending confirmation...", delay: 4600 },

    { type: "warn", text: "[DELAY] Network congestion detected", delay: 5200 },
    { type: "error", text: "[FAILED] Transaction not confirmed in time", delay: 5800 },

    { type: "info", text: "[RETRY] Attempt 2 initiated...", delay: 6400 },
    { type: "info", text: "[RPC] Switching RPC endpoint...", delay: 6800 },
    { type: "success", text: "[RPC_SELECTED] QuickNode (28ms latency)", delay: 7200 },

    { type: "info", text: "[REBUILD] Fetching new blockhash...", delay: 7600 },
    { type: "info", text: "[FEE] Increasing priority fee...", delay: 8000 },
    { type: "success", text: "[FEE_BUMP] +20% (6,000 micro-lamports)", delay: 8400 },

    { type: "info", text: "[SIMULATION] Re-validating transaction...", delay: 8800 },
    { type: "success", text: "[SIMULATION] Success", delay: 9200 },

    { type: "info", text: "[SIGN] Re-signing transaction...", delay: 9600 },
    { type: "success", text: "[SIGNED] Signature updated", delay: 10000 },

    { type: "info", text: "[SEND] Re-broadcasting transaction...", delay: 10400 },
    { type: "info", text: "[STATUS] Confirming...", delay: 10800 },

    { type: "success", text: "[CONFIRMED] Transaction landed successfully", delay: 11400 },
    { type: "success", text: "[FINAL] Execution completed in 2 attempts", delay: 12000 },
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