"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Connection, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { SendWithReliability } from "@repo/sdk";

const Icons = {
  Logo: () => (
    <img src="/logo.png" alt="Sendra Logo" width={32} height={32} className="rounded-md object-contain" />
  ),
  Back: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Error: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Terminal: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Network: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Flow: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Wallet: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  Docs: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Lightbulb: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </svg>
  ),
  Architecture: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Changelog: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  ExternalLink: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

const PIPELINE_STAGES = [
  { id: "SELECT_RPC", label: "Select RPC", desc: "Optimal node routing" },
  { id: "BUILD_TX", label: "Build TX", desc: "Construct transaction payload" },
  { id: "OPTIMIZE_FEE", label: "Optimize Fees", desc: "Dynamic priority fee" },
  { id: "SIMULATE", label: "Simulate", desc: "Pre-flight validation" },
  { id: "SIGN_TX", label: "Sign", desc: "Wallet signature" },
  { id: "SEND_TX", label: "Broadcast", desc: "Send to network" },
  { id: "CONFIRM_TX", label: "Confirm", desc: "On-chain finality" },
  { id: "RETRY", label: "Retry", desc: "Auto-retry with new route" },
];

const EVENT_TO_PIPELINE: Record<string, string> = {
  RPC_SELECTED: "SELECT_RPC",
  TX_BUILT: "BUILD_TX",
  TX_LOADED: "BUILD_TX",
  FEE_OPTIMIZED: "OPTIMIZE_FEE",
  SIMULATION_SUCCESS: "SIMULATE",
  SIMULATION_FAILED: "SIMULATE",
  TX_SIGNED: "SIGN_TX",
  TX_SENT: "SEND_TX",
  TX_CONFIRMED: "CONFIRM_TX",
  TX_CONFIRMED_AFTER_RETRY: "CONFIRM_TX",
  RETRY_ATTEMPT: "RETRY",
  FEE_REOPTIMIZED: "OPTIMIZE_FEE",
  RETRY_SIMULATION_SUCCESS: "SIMULATE",
  RETRY_SIMULATION_FAILED: "SIMULATE",
};

type TxStatus = "idle" | "initializing" | "broadcasting" | "confirmed" | "retrying" | "failed";

function eventToTerminalLog(event: any): { type: "info" | "success" | "error" | "warn"; message: string } {
  const step = event.step;
  switch (step) {
    case "RPC_SELECTED": return { type: "info", message: `RPC selected → ${event.rpc ? event.rpc.replace('https://', '').slice(0, 40) : 'endpoint'}${event.attempt ? ` (attempt ${event.attempt})` : ''}` };
    case "TX_BUILT": return { type: "info", message: `Transaction constructed${event.rpc ? ` via ${event.rpc.replace('https://', '').slice(0, 30)}` : ''}` };
    case "TX_LOADED": return { type: "info", message: "Pre-built transaction loaded" };
    case "FEE_OPTIMIZED": return { type: "info", message: `Fee optimized → ${event.fee ? event.fee + ' micro-lamports' : 'dynamic'}` };
    case "FEE_REOPTIMIZED": return { type: "warn", message: `Fee re-optimized → ${event.fee || 'adjusted'} micro-lamports (attempt ${event.attempt || '?'})` };
    case "SIMULATION_SUCCESS": return { type: "success", message: "✓ Simulation passed — transaction is valid" };
    case "SIMULATION_FAILED": return { type: "error", message: "✗ Simulation failed — transaction would revert" };
    case "RETRY_SIMULATION_SUCCESS": return { type: "success", message: `✓ Retry simulation passed (attempt ${event.attempt || '?'})` };
    case "RETRY_SIMULATION_FAILED": return { type: "error", message: `✗ Retry simulation failed (attempt ${event.attempt || '?'})` };
    case "TX_SIGNED": return { type: "info", message: `Transaction signed by wallet${event.attempt ? ` (attempt ${event.attempt})` : ''}` };
    case "TX_SENT": return { type: "info", message: `Transaction broadcast to network${event.attempt ? ` (attempt ${event.attempt})` : ''}` };
    case "TX_CONFIRMED": return { type: "success", message: "═══ ✓ Transaction Confirmed On-Chain ═══" };
    case "TX_CONFIRMED_AFTER_RETRY": return { type: "success", message: `═══ ✓ Confirmed after ${event.attempt || '?'} retries ═══` };
    case "TX_NOT_CONFIRMED": return { type: "warn", message: "Transaction not confirmed — will retry" };
    case "ATTEMPT_FAILED": return { type: "warn", message: "Initial attempt failed — entering retry loop" };
    case "RETRY_ATTEMPT": return { type: "warn", message: `↻ Retry attempt ${event.attempt || '?'} starting...` };
    case "BLOCKHASH_EXPIRED": return { type: "warn", message: "Blockhash expired — rebuilding transaction" };
    case "SEND_FAILED": return { type: "error", message: `Send failed: ${event.message || 'unknown error'}` };
    case "RETRY_FAILED_REASON": return { type: "warn", message: `Failure classified: ${event.message || 'unknown'}` };
    case "ACTION": return { type: "info", message: `Action: ${event.message || ''}` };
    case "MAX_RETRIES_EXCEEDED": return { type: "error", message: "✗ Maximum retries exceeded — transaction failed" };
    default: return { type: "info", message: `[${step}] ${event.message || ''}` };
  }
}

type SidebarTab = "dashboard" | "sdk-docs" | "problem-solution" | "architecture" | "changelog";

interface TxHistoryEntry {
  id: string;
  signature: string;
  method: "sendra" | "standard";
  success: boolean;
  amount: string;
  receiver: string;
  timestamp: Date;
  attempts: number;
}

export default function DemoPage() {
  const { connected, publicKey, signTransaction, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [sdkLogs, setSdkLogs] = useState<any[]>([]);
  const [isSendraTx, setIsSendraTx] = useState(false);
  const [txHistory, setTxHistory] = useState<TxHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const terminalRef = useRef<HTMLDivElement>(null);
  const logQueueRef = useRef<any[]>([]);
  const processingRef = useRef(false);

  const processLogQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    while (logQueueRef.current.length > 0) {
      const item = logQueueRef.current.shift()!;
      // Small delay between visual updates for realistic feel
      await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
      // Update terminal log
      const termLog = eventToTerminalLog(item);
      const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [...prev, { ...termLog, time, id: Math.random() }]);
      // Update SDK execution trace
      setSdkLogs(prev => [...prev, { ...item, _ts: Date.now() }]);
      // Update pipeline
      const pipelineId = EVENT_TO_PIPELINE[item.step];
      if (pipelineId) {
        setActiveStage(pipelineId);
        // Mark previous stage as completed when a new one activates
        setCompletedStages(prev => {
          const next = new Set(prev);
          if (pipelineId) next.add(pipelineId);
          return next;
        });
      }
      // Update transaction status
      if (item.step === "TX_SENT") setTxStatus("broadcasting");
      if (item.step === "RETRY_ATTEMPT") setTxStatus("retrying");
      if (item.step === "TX_CONFIRMED" || item.step === "TX_CONFIRMED_AFTER_RETRY") setTxStatus("confirmed");
      if (item.step === "SIMULATION_FAILED" || item.step === "MAX_RETRIES_EXCEEDED" || item.step === "SEND_FAILED") setTxStatus("failed");
    }
    processingRef.current = false;
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  const pushLog = (type: "info" | "success" | "error" | "warn", message: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { type, message, time, id: Math.random() }]);
  };

  const addToHistory = (entry: Omit<TxHistoryEntry, "id" | "timestamp">) => {
    setTxHistory(prev => [{
      ...entry,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
    }, ...prev]);
  };

  const handleSend = async () => {
    if (!connected || !publicKey || !signTransaction) {
      pushLog("error", "Wallet not connected. Please connect your wallet first.");
      return;
    }
    if (!receiver || !amount) {
      pushLog("error", "Missing transaction details. Please enter receiver address and amount.");
      return;
    }

    // Reset all state
    setLoading(true);
    setResult(null);
    setLogs([]);
    setSdkLogs([]);
    setIsSendraTx(true);
    setActiveTab("dashboard");
    setCompletedStages(new Set());
    setActiveStage(null);
    setTxStatus("initializing");
    logQueueRef.current = [];
    processingRef.current = false;

    // Initial log
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs([{ type: "info", message: "─── Sendra Reliability Layer Activated ───", time, id: Math.random() }]);
    await new Promise(r => setTimeout(r, 200));
    pushLog("info", `Sender: ${publicKey.toBase58().slice(0, 8)}...${publicKey.toBase58().slice(-4)} → Receiver: ${receiver.slice(0, 8)}...${receiver.slice(-4)}`);
    pushLog("info", `Amount: ${amount} lamports (${(Number(amount) / 1e9).toFixed(6)} SOL)`);
    await new Promise(r => setTimeout(r, 150));
    pushLog("info", "Entering Sendra pipeline...");

    try {
      const signer = { publicKey, signTransaction };

      // Real-time logger callback — this is the key
      const realtimeLogger = (event: any) => {
        logQueueRef.current.push(event);
        processLogQueue();
      };

      const res = await SendWithReliability(
        { type: "params", to: new PublicKey(receiver), amount: Number(amount) },
        signer,
        { maxRetries: 3, logger: realtimeLogger }
      ) as any;

      // Wait for remaining queued logs to finish rendering
      await new Promise(r => setTimeout(r, 500));
      while (logQueueRef.current.length > 0 || processingRef.current) {
        await new Promise(r => setTimeout(r, 100));
      }

      if (res.success) {
        setResult(res);
        setTxStatus("confirmed");
        addToHistory({ signature: res.signature || "", method: "sendra", success: true, amount, receiver, attempts: res.attempts || 1 });
      } else {
        setResult(res);
        setTxStatus("failed");
        pushLog("error", `✗ Transaction Failed: ${res.error}`);
        addToHistory({ signature: res.signature || "", method: "sendra", success: false, amount, receiver, attempts: res.attempts || 1 });
      }
    } catch (e: any) {
      const msg = e.message || "Unknown error";
      if (msg.includes("User rejected") || msg.includes("rejected")) {
        pushLog("warn", "Wallet signature rejected by user");
        setTxStatus("failed");
        setResult({ success: false, error: "Wallet rejected", attempts: 0 });
      } else if (msg.includes("RPC") || msg.includes("fetch") || msg.includes("Network")) {
        pushLog("error", `RPC Error: ${msg}`);
        setTxStatus("failed");
        setResult({ success: false, error: msg, attempts: 0 });
      } else {
        pushLog("error", `✗ Error: ${msg}`);
        setTxStatus("failed");
        setResult({ success: false, error: msg, attempts: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNormalSend = async () => {
    if (!connected || !publicKey || !signTransaction) {
      pushLog("error", "Wallet not connected. Please connect your wallet first.");
      return;
    }
    if (!receiver || !amount) {
      pushLog("error", "Missing transaction details. Please enter receiver address and amount.");
      return;
    }

    setLoading(true);
    setResult(null);
    setLogs([]);
    setSdkLogs([]);
    setIsSendraTx(false);
    setActiveTab("dashboard");
    setCompletedStages(new Set());
    setActiveStage(null);
    setTxStatus("initializing");

    pushLog("info", "─── Standard Solana Transaction (No Sendra) ───");
    pushLog("info", "Step 1/5: Connecting to Solana Devnet RPC...");
    pushLog("info", "  → Using default RPC: api.devnet.solana.com");
    pushLog("warn", "  ⚠ No simulation, fee optimization, or retry logic will be applied");

    try {
      const rpcUrl = "https://api.devnet.solana.com";
      const connection = new Connection(rpcUrl, "confirmed");
      pushLog("info", "Step 2/5: Building transaction payload...");
      pushLog("info", `  → From: ${publicKey.toBase58().slice(0, 8)}...${publicKey.toBase58().slice(-4)}`);
      pushLog("info", `  → To: ${receiver.slice(0, 8)}...${receiver.slice(-4)}`);
      pushLog("info", `  → Amount: ${amount} lamports`);
      const senderAdd = publicKey;
      const receiverAdd = new PublicKey(receiver);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      pushLog("info", `  → Blockhash: ${blockhash.slice(0, 12)}...`);
      const instruction = SystemProgram.transfer({ fromPubkey: senderAdd, toPubkey: receiverAdd, lamports: Number(amount) });
      const message = new TransactionMessage({ payerKey: senderAdd, instructions: [instruction], recentBlockhash: blockhash }).compileToV0Message();
      const tx = new VersionedTransaction(message);
      pushLog("info", "Step 3/5: Requesting wallet signature...");
      pushLog("info", "  → Please approve the transaction in your wallet");
      const signedTx = await signTransaction(tx);
      pushLog("success", "  ✓ Transaction signed successfully");
      pushLog("info", "Step 4/5: Broadcasting to network...");
      setTxStatus("broadcasting");
      const signature = await connection.sendTransaction(signedTx);
      pushLog("info", `  → Signature: ${signature.slice(0, 16)}...`);
      pushLog("info", "Step 5/5: Waiting for on-chain confirmation...");
      pushLog("info", "  → Commitment level: confirmed");
      const confirmation = await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
      if (confirmation.value.err) { throw new Error(confirmation.value.err.toString()); }
      setResult({ success: true, signature, attempts: 1 });
      setTxStatus("confirmed");
      pushLog("success", "═══════════════════════════════════════");
      pushLog("success", `✓ Transaction Confirmed!`);
      pushLog("success", `  Signature: ${signature}`);
      pushLog("success", "═══════════════════════════════════════");
      addToHistory({ signature, method: "standard", success: true, amount, receiver, attempts: 1 });
    } catch (e: any) {
      const msg = e.message || "Unknown error";
      if (msg.includes("User rejected") || msg.includes("rejected")) {
        pushLog("warn", "Wallet signature rejected by user");
      } else {
        pushLog("error", `✗ Failed: ${msg}`);
      }
      setResult({ success: false, error: msg, attempts: 1 });
      setTxStatus("failed");
      addToHistory({ signature: "", method: "standard", success: false, amount, receiver, attempts: 1 });
    } finally {
      setLoading(false);
    }
  };

  const walletLabel = useMemo(() => {
    if (!connected || !publicKey) return null;
    const b58 = publicKey.toBase58();
    return `${b58.slice(0, 4)}..${b58.slice(-4)}`;
  }, [connected, publicKey]);

  // Status label for the header
  const statusLabel = useMemo(() => {
    switch (txStatus) {
      case "idle": return { text: "Idle — Awaiting Transaction", color: "text-white/20", dot: "bg-white/10" };
      case "initializing": return { text: "Initializing Pipeline", color: "text-indigo-400/80", dot: "bg-indigo-400" };
      case "broadcasting": return { text: "Broadcasting to Network", color: "text-amber-400/80", dot: "bg-amber-400" };
      case "retrying": return { text: "Retrying Transaction", color: "text-amber-400/80", dot: "bg-amber-400" };
      case "confirmed": return { text: "Transaction Confirmed", color: "text-emerald-400/80", dot: "bg-emerald-400" };
      case "failed": return { text: "Transaction Failed", color: "text-red-400/80", dot: "bg-red-400" };
    }
  }, [txStatus]);

  const sidebarItems: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard", icon: <Icons.Dashboard />, label: "Dashboard" },
    { id: "sdk-docs", icon: <Icons.Docs />, label: "SDK Docs" },
    { id: "problem-solution", icon: <Icons.Lightbulb />, label: "Why Sendra" },
    { id: "architecture", icon: <Icons.Architecture />, label: "Architecture" },
    { id: "changelog", icon: <Icons.Changelog />, label: "Changelog" },
  ];

  return (
    <div className="h-screen w-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">

      <header className="flex-shrink-0 h-[52px] flex items-center justify-between px-5 border-b border-white/[0.06]"
        style={{ background: "linear-gradient(180deg, rgba(15,15,22,1) 0%, rgba(10,10,15,0.95) 100%)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <Icons.Logo />
            <span className="font-semibold text-[14px] tracking-tight text-white/90">Sendra</span>
          </Link>
          <div className="w-px h-5 bg-white/[0.08] mx-1" />
          <span className="text-[11px] font-mono text-white/25 uppercase tracking-widest">Dashboard</span>
          <div className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 text-[9px] font-mono text-indigo-400 uppercase tracking-widest">
            Devnet
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-[11px] font-mono text-white/30 hover:text-white/60 transition-colors">
            <Icons.Back />
            <span>Home</span>
          </Link>
          <div className="w-px h-5 bg-white/[0.08]" />
          {connected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-emerald-400">{walletLabel}</span>
              </div>
              <button onClick={() => disconnect()} className="text-[10px] font-mono text-white/20 hover:text-white/50 transition-colors">
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all text-[11px] font-mono text-white/50"
            >
              <Icons.Wallet />
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        <aside className="flex-shrink-0 w-[200px] border-r border-white/[0.06] flex flex-col"
          style={{ background: "rgba(12,12,18,0.6)" }}>

          <nav className="flex flex-col gap-1 py-4 px-3 flex-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-mono transition-all text-left w-full ${activeTab === item.id
                  ? "bg-white/[0.06] text-white/80 border border-white/[0.08]"
                  : "text-white/25 hover:text-white/40 hover:bg-white/[0.02] border border-transparent"
                  }`}
              >
                <span className={activeTab === item.id ? "text-indigo-400/80" : "text-white/20"}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {txHistory.length > 0 && (
            <div className="px-3 pb-2">
              <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[9px] font-mono text-white/15 uppercase tracking-widest mb-0.5">Session TXs</div>
                <div className="text-[12px] font-mono text-white/50 font-bold">{txHistory.length}</div>
              </div>
            </div>
          )}

          <div className="px-3 pb-3">
            <div className="rounded-xl overflow-hidden border border-white/[0.06]" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(15,15,25,0.9) 50%, rgba(16,185,129,0.06) 100%)" }}>
              <div className="px-3.5 py-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/[0.08]">
                  <Icons.Logo />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-mono text-white/70 font-bold tracking-tight">Sendra SDK</div>
                  <div className="text-[9px] font-mono text-white/25">v2.1.0 · Devnet</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">

            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 flex flex-col overflow-hidden">

                <div className="flex-shrink-0 border-b border-white/[0.06]">
                  <div className="flex h-full">
                    <div className="flex-1 p-5 border-r border-white/[0.06]">
                      <div className="flex items-center gap-2 mb-4">
                        <Icons.Send />
                        <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Transaction Builder</span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-mono text-white/20 uppercase tracking-[0.15em]">Receiver Address</label>
                          <input type="text" value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="Enter devnet public key..." disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[12px] text-white/80 font-mono outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.05] placeholder:text-white/10 disabled:opacity-40" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-mono text-white/20 uppercase tracking-[0.15em]">Amount (Lamports)</label>
                          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1000000" disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[12px] text-white/80 font-mono outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.05] placeholder:text-white/10 disabled:opacity-40" />
                        </div>
                        <div className="flex gap-2">
                          {!connected ? (
                            <button onClick={() => setVisible(true)} className="px-4 py-2.5 rounded-lg bg-white text-black text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 transition-all whitespace-nowrap">
                              Connect Wallet
                            </button>
                          ) : (
                            <>
                              <button onClick={handleNormalSend} disabled={loading} className="px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-[11px] font-bold border border-white/[0.08] transition-all disabled:opacity-30 uppercase tracking-wider whitespace-nowrap">
                                Standard TX
                              </button>
                              <button onClick={handleSend} disabled={loading} className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-bold transition-all disabled:opacity-30 uppercase tracking-wider whitespace-nowrap relative overflow-hidden group">
                                <div className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out" />
                                <span className="relative z-10">{loading ? "Processing..." : "Send via Sendra"}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-[280px] p-5 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <Icons.Network />
                        <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Network</span>
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-white/20 uppercase">Chain</span>
                          <span className="text-[11px] font-mono text-white/60">Solana Devnet</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-white/20 uppercase">Status</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] font-mono text-emerald-400">Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-white/20 uppercase">Reliability</span>
                          <span className="text-[11px] font-mono text-indigo-400">{isSendraTx ? "Sendra" : "Standard"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-white/20 uppercase">Wallet</span>
                          <span className="text-[11px] font-mono text-white/40">{connected ? walletLabel : "Not Connected"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">

                  <div className="flex-1 flex flex-col border-r border-white/[0.06] overflow-hidden">
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/70" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/70" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/70" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icons.Terminal />
                          <span className="text-[10px] font-mono text-white/25">sendra — console output</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {loading && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[9px] font-mono text-amber-400/60">RUNNING</span>
                          </div>
                        )}
                        {logs.length > 0 && (
                          <button onClick={() => setLogs([])} className="text-[9px] font-mono text-white/15 hover:text-white/40 transition-colors uppercase tracking-wider">Clear</button>
                        )}
                      </div>
                    </div>
                    <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-[3px]" style={{ background: "rgba(5,5,8,0.8)" }}>
                      {logs.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto">
                              <Icons.Terminal />
                            </div>
                            <div>
                              <div className="text-[12px] text-white/20 font-mono mb-1">Ready to execute</div>
                              <div className="text-[10px] text-white/10 font-mono leading-relaxed max-w-[280px]">
                                {!connected ? "Connect your wallet to start sending transactions through the Sendra pipeline." : "Enter a receiver address and amount above, then click \"Send via Sendra\" to see the reliability engine in action."}
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-white/10">
                              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400/30" /><span>= success</span></div>
                              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400/30" /><span>= warning</span></div>
                              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400/30" /><span>= error</span></div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                      <AnimatePresence initial={false}>
                        {logs.map((log) => (
                          <motion.div key={log.id} initial={{ opacity: 0, x: -7 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.24 }} className="flex items-start gap-2.5 leading-relaxed">
                            <span className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.type === "error" ? "bg-red-400" : log.type === "success" ? "bg-emerald-400" : log.type === "warn" ? "bg-amber-400" : "bg-white/14"}`} />
                            <span className="text-white/[0.08] shrink-0 select-none text-[10px]">{log.time}</span>
                            <span className={log.type === "error" ? "text-red-400" : log.type === "success" ? "text-emerald-400" : log.type === "warn" ? "text-amber-400" : "text-white/40"}>{log.message}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {loading && (
                        <div className="flex gap-1 pl-4 pt-1">
                          {[0, 1, 2].map(i => (<motion.div key={i} className="w-1 h-1 rounded-full bg-white/14" animate={{ opacity: [0.14, 0.6, 0.14] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-[360px] flex flex-col" style={{ background: "rgba(8,8,14,0.5)" }}>

                    <div className="flex-shrink-0 px-4 py-2 border-b border-white/[0.06]" style={{ background: "rgba(0,0,0,0.2)" }}>
                      <div className="flex items-center gap-2">
                        {(txStatus === "initializing" || txStatus === "broadcasting" || txStatus === "retrying") ? (
                          <motion.div className={`w-2 h-2 rounded-full ${statusLabel!.dot}`} animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }} />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${statusLabel!.dot}`} />
                        )}
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${statusLabel!.color}`}>{statusLabel!.text}</span>
                      </div>
                    </div>

                    <div className="flex-1 px-4 py-3 border-b border-white/[0.06] flex flex-col">
                      <div className="flex items-center gap-2 mb-2.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Result</span>
                      </div>
                      <AnimatePresence mode="wait">
                        {(txStatus === "initializing" || txStatus === "broadcasting" || txStatus === "retrying") ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.03]">
                            <div className="w-5 h-5 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin flex-shrink-0" />
                            <div>
                              <div className="text-[11px] font-mono text-indigo-400">
                                {txStatus === "initializing" && "Initializing Pipeline"}
                                {txStatus === "broadcasting" && "Broadcasting to Network"}
                                {txStatus === "retrying" && "Retrying Transaction"}
                              </div>
                              <div className="text-[9px] font-mono text-white/25">
                                {txStatus === "initializing" && "Setting up reliability layer..."}
                                {txStatus === "broadcasting" && "Waiting for on-chain confirmation..."}
                                {txStatus === "retrying" && "Re-routing through new node..."}
                              </div>
                            </div>
                          </motion.div>
                        ) : (txStatus === "confirmed" || txStatus === "failed") && result ? (
                          <motion.div key="result" initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}
                            className={`p-3 rounded-lg border ${result.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1.5 rounded-lg ${result.success ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                {result.success ? <Icons.Check /> : <Icons.Error />}
                              </div>
                              <div className="text-[13px] font-bold tracking-tight">{result.success ? "Confirmed" : "Failed"}</div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-[8px] font-mono text-white/15 uppercase tracking-widest mb-0.5">Signature</div>
                                <div className="text-[10px] font-mono text-white/40 break-all">{result.signature || result.error || "n/a"}</div>
                              </div>
                              {result.signature && (
                                <a href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-[9px] font-mono text-indigo-400/60 hover:text-indigo-400 transition-colors">
                                  <Icons.ExternalLink /> View on Solana Explorer
                                </a>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-[8px] font-mono text-white/15 uppercase tracking-widest mb-0.5">Attempts</div>
                                  <div className="text-[13px] font-bold text-white/80">{result.attempts || 1}</div>
                                </div>
                                <div>
                                  <div className="text-[8px] font-mono text-white/15 uppercase tracking-widest mb-0.5">Method</div>
                                  <div className={`text-[13px] font-bold ${isSendraTx ? "text-indigo-400" : "text-white/50"}`}>{isSendraTx ? "Sendra" : "Standard"}</div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center rounded-lg border border-white/[0.04] border-dashed">
                            <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-white/10 mb-3">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </div>
                            <div className="text-[11px] text-white/20 font-mono mb-1">No transaction yet</div>
                            <div className="text-[9px] text-white/10 font-mono max-w-[200px] leading-relaxed">Send a transaction to see real-time results and pipeline status.</div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex-1 px-4 py-3 border-b border-white/[0.06] flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.Flow />
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Pipeline</span>
                        {loading && isSendraTx && (
                          <motion.div className="ml-auto flex items-center gap-1" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span className="text-[7px] font-mono text-indigo-400/60 uppercase">Live</span>
                          </motion.div>
                        )}
                      </div>
                      <div>
                        {PIPELINE_STAGES.map((stage) => {
                          const isActive = activeStage === stage.id && txStatus !== "confirmed" && txStatus !== "failed";
                          const isDone = completedStages.has(stage.id) && activeStage !== stage.id;
                          const isDoneAndFinished = completedStages.has(stage.id) && (txStatus === "confirmed" || txStatus === "failed");
                          const isRetry = stage.id === "RETRY";
                          const hasRetry = sdkLogs.some(l => l.step === "RETRY_ATTEMPT");
                          if (isRetry && !hasRetry && !isActive) return null;

                          return (
                            <motion.div key={stage.id}
                              initial={false}
                              animate={{ backgroundColor: isActive ? "rgba(99,102,241,0.08)" : "rgba(0,0,0,0)" }}
                              className="flex items-center gap-2.5 py-[5px] px-2 rounded">
                              <div className="flex-shrink-0 w-4 flex items-center justify-center">
                                {isActive ? (
                                  <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Infinity }} />
                                ) : isDone || isDoneAndFinished ? (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} className="w-2 h-2 rounded-full bg-emerald-400/60" />
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full border border-white/15" />
                                )}
                              </div>
                              <span className={`text-[10px] font-mono font-bold tracking-wider flex-1 transition-colors duration-300 ${
                                isActive ? "text-indigo-400" :
                                isDone || isDoneAndFinished ? "text-white/45" :
                                "text-white/15"
                              }`}>{stage.label}</span>
                              <span className={`text-[8px] font-mono transition-colors duration-300 ${isActive ? "text-white/25" : isDone || isDoneAndFinished ? "text-white/12" : "text-white/8"}`}>
                                {stage.desc}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {sdkLogs.length > 0 && (
                      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 border-t border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-2">
                          <Icons.Flow />
                          <span className="text-[10px] font-mono text-indigo-400/40 uppercase tracking-widest">Execution Trace</span>
                          <span className="text-[8px] font-mono text-white/10 ml-auto">{sdkLogs.length} events</span>
                        </div>
                        <div className="space-y-1.5">
                          <AnimatePresence initial={false}>
                          {sdkLogs.map((log, idx) => (
                            <motion.div key={log._ts + '-' + idx} initial={{ opacity: 0, x: -8, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} transition={{ duration: 0.25 }}
                              className="p-2 rounded-lg bg-black/30 border border-white/[0.04] font-mono text-[10px] flex flex-col gap-0.5 overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className={`font-bold tracking-wider ${log.step.includes("RETRY") || log.step.includes("FAIL") ? "text-amber-400" : log.step.includes("SUCCESS") || log.step.includes("CONFIRM") ? "text-emerald-400" : "text-indigo-400"}`}>[{log.step}]</span>
                                {log.attempt !== undefined && (<span className="text-white/15 text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.06]">Attempt {log.attempt}</span>)}
                              </div>
                              {log.message && <span className="text-white/50">{log.message}</span>}
                              {log.rpc && (<span className="text-white/20 text-[9px] truncate break-all">RPC: {log.rpc}</span>)}
                              {log.fee !== undefined && (<span className="text-white/20 text-[9px]">Fee: {log.fee}</span>)}
                            </motion.div>
                          ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "sdk-docs" && (
              <motion.div key="sdk-docs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0" style={{ backgroundImage: "url('/hero_bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18 }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.75) 50%, rgba(10,10,15,0.92) 100%)" }} />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-10 py-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Icons.Docs />
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Developer Guide</span>
                  </div>
                  <h1 className="text-[28px] font-light text-white mb-2 tracking-tight">Sendra SDK Documentation</h1>
                  <p className="text-[13px] font-mono text-white/30 mb-10 leading-relaxed max-w-2xl">
                    Integrate transaction reliability into your Solana dApp in under 5 minutes. Drop-in replacement — zero infrastructure changes.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-3 font-bold">01 — Install</div>
                      <div className="rounded-lg px-4 py-3 text-[12px] font-mono text-white/60 border border-white/[0.06] select-all" style={{ background: "rgba(0,0,0,0.3)" }}>
                        npm install @sendra/sdk
                      </div>
                      <p className="text-[10px] font-mono text-white/20 mt-3 leading-relaxed">Works with any Solana project. Compatible with @solana/web3.js v1.x and v2.x.</p>
                    </div>
                    <div className="p-5 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-3 font-bold">02 — Import</div>
                      <div className="rounded-lg px-4 py-3 text-[12px] font-mono text-white/50 border border-white/[0.06] space-y-0.5" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <div><span className="text-white/30">import</span> {"{ "}<span className="text-white/70">SendWithReliability</span>{" }"}</div>
                        <div><span className="text-white/30">from</span> <span className="text-white/50">"@sendra/sdk"</span></div>
                      </div>
                    </div>
                    <div className="p-5 rounded-xl border border-white/[0.06] lg:col-span-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-3 font-bold">03 — Send a Transaction</div>
                      <div className="rounded-lg px-4 py-4 text-[12px] font-mono text-white/45 border border-white/[0.06] space-y-0.5 leading-relaxed" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <div><span className="text-white/30">const</span> <span className="text-white/70">result</span> = <span className="text-white/30">await</span> <span className="text-white/60">SendWithReliability</span>(</div>
                        <div className="pl-4">{"{"}</div>
                        <div className="pl-8"><span className="text-white/55">receiver:</span> <span className="text-white/40">new PublicKey("...")</span>,</div>
                        <div className="pl-8"><span className="text-white/55">amount:</span> <span className="text-white/50">1000000</span>  <span className="text-white/15">// lamports</span></div>
                        <div className="pl-4">{"}"},</div>
                        <div className="pl-4"><span className="text-white/55">signer</span>,  <span className="text-white/15">// {"{ publicKey, signTransaction }"}</span></div>
                        <div className="pl-4">{"{ "}<span className="text-white/55">maxRetries:</span> <span className="text-white/50">3</span>{" }"}</div>
                        <div>)</div>
                      </div>
                    </div>
                    <div className="p-5 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-3 font-bold">04 — Handle Result</div>
                      <div className="rounded-lg px-4 py-3 text-[12px] font-mono text-white/45 border border-white/[0.06] space-y-0.5" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <div><span className="text-white/30">if</span> (result.<span className="text-white/70">success</span>) {"{"}</div>
                        <div className="pl-4 text-white/25">// Transaction confirmed on-chain!</div>
                        <div className="pl-4">console.log(result.<span className="text-white/70">signature</span>)</div>
                        <div>{"}"} <span className="text-white/30">else</span> {"{"}</div>
                        <div className="pl-4 text-white/20">// Handle failure</div>
                        <div className="pl-4">console.error(result.<span className="text-white/70">error</span>)</div>
                        <div>{"}"}</div>
                      </div>
                    </div>
                    <div className="p-5 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-3 font-bold">Config Options</div>
                      <div className="space-y-3 text-[12px] font-mono">
                        {[
                          ["maxRetries", "number", "3", "Max retry attempts on failure"],
                          ["commitment", "string", '"confirmed"', "Commitment level for confirmation"],
                          ["skipPreflight", "boolean", "false", "Skip simulation step"],
                        ].map(([name, type, def, desc]) => (
                          <div key={name} className="flex items-start justify-between gap-4 py-1.5 border-b border-white/[0.04] last:border-0">
                            <div>
                              <span className="text-white/60">{name}</span>
                              <span className="ml-2 text-[9px] text-white/20">{type}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-white/35 text-[10px]">default: {def}</div>
                              <div className="text-white/15 text-[9px]">{desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "problem-solution" && (
              <motion.div key="problem-solution" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0" style={{ backgroundImage: "url('/hero_bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18 }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.75) 50%, rgba(10,10,15,0.92) 100%)" }} />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-10 py-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Icons.Lightbulb />
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Why Sendra</span>
                  </div>
                  <h1 className="text-[28px] font-light text-white mb-2 tracking-tight">The Problem & The Solution</h1>
                  <p className="text-[13px] font-mono text-white/30 mb-10 leading-relaxed max-w-2xl">
                    Solana's speed comes with a reliability gap. Sendra closes it at the middleware layer.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="p-6 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="text-[12px] font-mono text-white/50 uppercase tracking-wider font-bold">The Problem</div>
                      </div>
                      <p className="text-[13px] font-mono text-white/40 leading-relaxed mb-4">
                        Over <span className="text-white/80">30% of Solana transactions</span> fail silently during congestion. Developers lose users, revenue, and trust.
                      </p>
                      <div className="space-y-2 pl-3 border-l border-white/[0.08]">
                        {["Transactions get dropped with no feedback", "Users retry manually, wasting fees", "No visibility into why transactions fail", "Single RPC = single point of failure", "Fee spikes cause unexpected drops"].map(item => (
                          <div key={item} className="flex items-start gap-2 text-[11px] font-mono text-white/35">
                            <span className="text-white/20 mt-0.5 flex-shrink-0">×</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-white/50" />
                        <div className="text-[12px] font-mono text-white/50 uppercase tracking-wider font-bold">Sendra's Solution</div>
                      </div>
                      <p className="text-[13px] font-mono text-white/40 leading-relaxed mb-4">
                        An <span className="text-white/80">intelligent middleware</span> that wraps your transaction in a reliability pipeline before it reaches the network.
                      </p>
                      <div className="space-y-2 pl-3 border-l border-white/[0.08]">
                        {["Pre-flight simulation catches reverts early", "Dynamic fee optimization prevents overpay", "Multi-node routing avoids congestion", "Automatic retry with backoff & node switching", "Full execution trace for debugging"].map(item => (
                          <div key={item} className="flex items-start gap-2 text-[11px] font-mono text-white/35">
                            <span className="text-white/30 mt-0.5 flex-shrink-0">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-[12px] font-mono text-white/40 uppercase tracking-wider mb-4 font-bold">Feature Comparison</div>
                    <div className="space-y-0">
                      <div className="grid grid-cols-3 gap-4 text-[10px] font-mono text-white/20 uppercase tracking-wider pb-3 border-b border-white/[0.06]">
                        <span>Feature</span><span className="text-center">Standard RPC</span><span className="text-center">Sendra SDK</span>
                      </div>
                      {[
                        ["Pre-flight Simulation", "✗", "✓"],
                        ["Dynamic Fee Optimization", "✗", "✓"],
                        ["Multi-RPC Routing", "✗", "✓"],
                        ["Automatic Retry", "✗", "✓"],
                        ["Execution Trace / Logs", "✗", "✓"],
                        ["Node Health Monitoring", "✗", "✓"],
                      ].map(([feature, std, sendra]) => (
                        <div key={feature} className="grid grid-cols-3 gap-4 py-2.5 border-b border-white/[0.03] text-[12px] font-mono">
                          <span className="text-white/40">{feature}</span>
                          <span className="text-center text-white/20">{std}</span>
                          <span className="text-center text-white/50">{sendra}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "architecture" && (
              <motion.div key="architecture" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0" style={{ backgroundImage: "url('/hero_bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18 }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.75) 50%, rgba(10,10,15,0.92) 100%)" }} />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-10 py-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Icons.Architecture />
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">System Design</span>
                  </div>
                  <h1 className="text-[28px] font-light text-white mb-2 tracking-tight">Architecture Overview</h1>
                  <p className="text-[13px] font-mono text-white/30 mb-10 leading-relaxed max-w-2xl">
                    Sendra is a client-side middleware that intercepts transactions between your dApp and the Solana RPC layer. Zero backend. Zero custody. Fully non-custodial.
                  </p>

                  <div className="p-6 rounded-xl border border-white/[0.06] mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-[12px] font-mono text-white/40 uppercase tracking-wider mb-5 font-bold">Transaction Pipeline</div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { num: "01", label: "RPC Selection", desc: "Probe & rank endpoints by latency" },
                        { num: "02", label: "Build TX", desc: "Construct payload with fresh blockhash" },
                        { num: "03", label: "Fee Optimization", desc: "Dynamic compute unit pricing" },
                        { num: "04", label: "Simulation", desc: "Pre-flight check against live state" },
                        { num: "05", label: "Sign & Send", desc: "Wallet signature + broadcast" },
                        { num: "06", label: "Confirm", desc: "Monitor until finality" },
                        { num: "↺", label: "Auto-Retry", desc: "Re-route on failure" },
                      ].map(stage => (
                        <div key={stage.label} className="flex-1 min-w-[140px] p-4 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <div className="text-[10px] font-mono text-white/20 mb-1">{stage.num}</div>
                          <div className="text-[12px] font-mono text-white/70 font-bold">{stage.label}</div>
                          <div className="text-[10px] font-mono text-white/25 mt-1">{stage.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="text-[12px] font-mono text-white/40 uppercase tracking-wider mb-4 font-bold">Design Principles</div>
                      <div className="space-y-3 text-[12px] font-mono text-white/35 leading-relaxed">
                        {[
                          ["Non-custodial", "Sendra never holds private keys"],
                          ["Client-side only", "No backend infrastructure needed"],
                          ["Program agnostic", "Works with any Solana program"],
                          ["Zero code changes", "Drop-in replacement for sendTransaction"],
                        ].map(([title, desc]) => (
                          <div key={title} className="flex items-start gap-2">
                            <span className="text-white/20 mt-0.5 flex-shrink-0">◆</span>
                            <span><span className="text-white/60">{title}</span> — {desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="text-[12px] font-mono text-white/40 uppercase tracking-wider mb-4 font-bold">Tech Stack</div>
                      <div className="flex flex-wrap gap-2">
                        {["TypeScript", "Solana Web3.js", "Turborepo", "Next.js", "Node.js", "Framer Motion"].map(tech => (
                          <span key={tech} className="px-3 py-1.5 rounded-lg border border-white/[0.06] text-[11px] font-mono text-white/40" style={{ background: "rgba(255,255,255,0.03)" }}>{tech}</span>
                        ))}
                      </div>
                      <div className="mt-5 space-y-2">
                        {[
                          ["Monorepo", "Turborepo with shared packages"],
                          ["SDK Core", "packages/core — pipeline logic"],
                          ["Frontend", "apps/web — Next.js demo"],
                        ].map(([label, desc]) => (
                          <div key={label} className="flex items-center justify-between text-[11px] font-mono py-1.5 border-b border-white/[0.04] last:border-0">
                            <span className="text-white/50">{label}</span>
                            <span className="text-white/20">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "changelog" && (
              <motion.div key="changelog" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0" style={{ backgroundImage: "url('/hero_bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18 }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.75) 50%, rgba(10,10,15,0.92) 100%)" }} />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-10 py-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Icons.Changelog />
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Release Notes</span>
                  </div>
                  <h1 className="text-[28px] font-light text-white mb-10 tracking-tight">Changelog</h1>

                  <div className="space-y-0">
                    {[
                      {
                        version: "v2.1.0", date: "Apr 16, 2026", tag: "Latest",
                        items: [
                          "SendWithReliability function — full pipeline execution",
                          "Dynamic fee optimization engine with real-time mempool analysis",
                          "Multi-RPC endpoint probing & intelligent routing",
                          "Pre-flight simulation with detailed error capture",
                          "Automatic retry with exponential backoff",
                          "Full execution trace logging for debugging",
                          "Dashboard UI with live pipeline visualization",
                        ],
                      },
                      {
                        version: "v2.0.0", date: "Mar 28, 2026", tag: "Major",
                        items: [
                          "Complete SDK rewrite in TypeScript",
                          "Monorepo architecture with Turborepo",
                          "Versioned transaction support (V0 messages)",
                          "Wallet adapter integration for browser wallets",
                          "Improved error handling and type safety",
                        ],
                      },
                      {
                        version: "v1.0.0", date: "Feb 14, 2026", tag: "Initial",
                        items: [
                          "Basic transaction send with retry logic",
                          "Single RPC endpoint support",
                          "Proof of concept release",
                        ],
                      },
                    ].map((release, ri) => (
                      <div key={release.version} className="relative pl-8">
                        {ri < 2 && <div className="absolute left-[11px] top-8 bottom-0 w-px bg-white/[0.06]" />}
                        <div className={`absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full flex items-center justify-center border ${release.tag === "Latest" ? "border-white/20" :
                          release.tag === "Major" ? "border-white/12" :
                            "border-white/[0.08]"
                          }`} style={{ background: "rgba(255,255,255,0.03)" }}>
                          <div className={`w-2 h-2 rounded-full ${release.tag === "Latest" ? "bg-white/60" :
                            release.tag === "Major" ? "bg-white/30" :
                              "bg-white/15"
                            }`} />
                        </div>

                        <div className="pb-10">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-[16px] font-mono text-white/70 font-bold">{release.version}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider border ${release.tag === "Latest" ? "border-white/15 text-white/50" :
                              release.tag === "Major" ? "border-white/10 text-white/30" :
                                "border-white/[0.06] text-white/20"
                              }`} style={{ background: "rgba(255,255,255,0.03)" }}>{release.tag}</span>
                            <span className="text-[10px] font-mono text-white/15 ml-auto">{release.date}</span>
                          </div>
                          <div className="space-y-1.5">
                            {release.items.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-[12px] font-mono text-white/35">
                                <span className="text-white/15 mt-0.5 flex-shrink-0">+</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}


          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}
      </style>
    </div>
  );
}
