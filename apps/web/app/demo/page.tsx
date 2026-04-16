"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Connection, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { SendWithReliability } from "@repo/sdk";
import SendraFlowDiagram from "../components/SendraFlowDiagram";

// --- Icons ---
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
};

// --- Main Dashboard Page ---
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
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const pushLog = (type: "info" | "success" | "error" | "warn", message: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { type, message, time, id: Math.random() }]);
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

    setLoading(true);
    setResult(null);
    setLogs([]);
    setSdkLogs([]);
    setIsSendraTx(true);

    pushLog("info", "─── Sendra Reliability Layer Activated ───");
    pushLog("info", "Step 1/6: Initializing Sendra SDK...");
    pushLog("info", "  → This will route your transaction through Sendra's intelligent pipeline");
    pushLog("info", "  → Pipeline: RPC Selection → Build TX → Fee Optimization → Simulate → Sign → Send & Confirm");
    pushLog("info", `  → Sender: ${publicKey.toBase58().slice(0, 8)}...${publicKey.toBase58().slice(-4)}`);
    pushLog("info", `  → Receiver: ${receiver.slice(0, 8)}...${receiver.slice(-4)}`);
    pushLog("info", `  → Amount: ${amount} lamports (${(Number(amount) / 1e9).toFixed(6)} SOL)`);

    try {
      const signer = { publicKey, signTransaction };
      pushLog("info", "Step 2/6: Sending to Sendra SDK — routing begins now...");
      const res = await SendWithReliability(
        { receiver: new PublicKey(receiver), amount: Number(amount) },
        signer,
        { maxRetries: 3 }
      ) as any;

      if (res.success) {
        setResult(res);
        pushLog("success", "═══════════════════════════════════════");
        pushLog("success", `✓ Transaction Confirmed Successfully!`);
        pushLog("success", `  Signature: ${res.signature}`);
        pushLog("success", `  Total attempts: ${res.attempts || 1}`);
        pushLog("success", "═══════════════════════════════════════");
        if (res.logs) setSdkLogs(res.logs);
      } else {
        pushLog("error", `✗ Transaction Failed: ${res.error}`);
        setResult(res);
        if (res.logs) setSdkLogs(res.logs);
      }
    } catch (e: any) {
      pushLog("error", `✗ Fatal Error: ${e.message}`);
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

      const instruction = SystemProgram.transfer({
        fromPubkey: senderAdd,
        toPubkey: receiverAdd,
        lamports: Number(amount)
      });

      const message = new TransactionMessage({
        payerKey: senderAdd,
        instructions: [instruction],
        recentBlockhash: blockhash
      }).compileToV0Message();
      const tx = new VersionedTransaction(message);

      pushLog("info", "Step 3/5: Requesting wallet signature...");
      pushLog("info", "  → Please approve the transaction in your wallet");
      const signedTx = await signTransaction(tx);
      pushLog("success", "  ✓ Transaction signed successfully");

      pushLog("info", "Step 4/5: Broadcasting to network...");
      const signature = await connection.sendTransaction(signedTx);
      pushLog("info", `  → Signature: ${signature.slice(0, 16)}...`);

      pushLog("info", "Step 5/5: Waiting for on-chain confirmation...");
      pushLog("info", "  → Commitment level: confirmed");
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, "confirmed");

      if (confirmation.value.err) {
        throw new Error(confirmation.value.err.toString());
      }

      setResult({ success: true, signature, attempts: 1 });
      pushLog("success", "═══════════════════════════════════════");
      pushLog("success", `✓ Transaction Confirmed!`);
      pushLog("success", `  Signature: ${signature}`);
      pushLog("success", "═══════════════════════════════════════");

    } catch (e: any) {
      pushLog("error", `✗ Failed: ${e.message}`);
      setResult({ success: false, error: e.message, attempts: 1 });
    } finally {
      setLoading(false);
    }
  };

  const walletLabel = useMemo(() => {
    if (!connected || !publicKey) return null;
    const b58 = publicKey.toBase58();
    return `${b58.slice(0, 4)}..${b58.slice(-4)}`;
  }, [connected, publicKey]);

  return (
    <div className="h-screen w-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">

      {/* ══ Top Dashboard Bar ══ */}
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

      {/* ══ Main Dashboard Body ══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="flex-shrink-0 w-[220px] border-r border-white/[0.06] flex flex-col py-4 px-3"
          style={{ background: "rgba(12,12,18,0.6)" }}>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1">
            {[
              { icon: <Icons.Send />, label: "Transaction", active: true },
              { icon: <Icons.Terminal />, label: "Console", active: false },
              { icon: <Icons.Network />, label: "Network", active: false },
              { icon: <Icons.Flow />, label: "Flow Trace", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-mono transition-all cursor-default ${
                  item.active
                    ? "bg-white/[0.06] text-white/80 border border-white/[0.08]"
                    : "text-white/25 hover:text-white/40 hover:bg-white/[0.02]"
                }`}
              >
                <span className={item.active ? "text-indigo-400/80" : "text-white/20"}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          <div className="flex-1" />

          {/* SDK Version */}
          <div className="px-3 py-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] font-mono text-white/15 uppercase tracking-widest mb-1">Sendra SDK</div>
            <div className="text-[11px] font-mono text-white/40">v2.1.0</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top Row: Input Panel + Network Status */}
          <div className="flex-shrink-0 border-b border-white/[0.06]">
            <div className="flex h-full">

              {/* Transaction Input Panel */}
              <div className="flex-1 p-5 border-r border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <Icons.Send />
                  <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Transaction Builder</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  {/* Receiver */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-mono text-white/20 uppercase tracking-[0.15em]">Receiver Address</label>
                    <input
                      type="text"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      placeholder="Enter devnet public key..."
                      disabled={loading}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[12px] text-white/80 font-mono outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.05] placeholder:text-white/10 disabled:opacity-40"
                    />
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-mono text-white/20 uppercase tracking-[0.15em]">Amount (Lamports)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 1000000"
                      disabled={loading}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[12px] text-white/80 font-mono outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.05] placeholder:text-white/10 disabled:opacity-40"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!connected ? (
                      <button
                        onClick={() => setVisible(true)}
                        className="px-4 py-2.5 rounded-lg bg-white text-black text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 transition-all whitespace-nowrap"
                      >
                        Connect Wallet
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleNormalSend}
                          disabled={loading}
                          className="px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-[11px] font-bold border border-white/[0.08] transition-all disabled:opacity-30 uppercase tracking-wider whitespace-nowrap"
                        >
                          Standard TX
                        </button>
                        <button
                          onClick={handleSend}
                          disabled={loading}
                          className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-bold transition-all disabled:opacity-30 uppercase tracking-wider whitespace-nowrap relative overflow-hidden group"
                        >
                          <div className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out" />
                          <span className="relative z-10">
                            {loading ? "Processing..." : "Send via Sendra"}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Network Status Panel */}
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

          {/* Bottom Row: Console Terminal + Result/Flow Panel */}
          <div className="flex-1 flex overflow-hidden">

            {/* ── Console Terminal ── */}
            <div className="flex-1 flex flex-col border-r border-white/[0.06] overflow-hidden">
              {/* Terminal Titlebar */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]"
                style={{ background: "rgba(0,0,0,0.3)" }}>
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
                    <button
                      onClick={() => setLogs([])}
                      className="text-[9px] font-mono text-white/15 hover:text-white/40 transition-colors uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Terminal Body */}
              <div
                ref={terminalRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-[3px]"
                style={{ background: "rgba(5,5,8,0.8)" }}
              >
                {logs.length === 0 && (
                  <div className="flex items-center gap-2 text-white/10">
                    <span className="text-white/6">$</span>
                    <span className="italic">Awaiting transaction... Enter details above and press "Send via Sendra"</span>
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex gap-3 leading-relaxed"
                    >
                      <span className="text-white/[0.08] shrink-0 select-none">[{log.time}]</span>
                      <span className={
                        log.type === "error" ? "text-red-400" :
                        log.type === "success" ? "text-emerald-400" :
                        log.type === "warn" ? "text-amber-400" :
                        "text-white/40"
                      }>
                        {log.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-white/[0.08]">$</span>
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 rounded-full bg-indigo-400/50"
                          animate={{ opacity: [0.2, 0.8, 0.2] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Panel: Result + Trace + Flow ── */}
            <div className="w-[360px] flex flex-col overflow-y-auto custom-scrollbar"
              style={{ background: "rgba(8,8,14,0.5)" }}>

              {/* Transaction Result */}
              <div className="p-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Result</span>
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03]"
                    >
                      <div className="w-6 h-6 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
                      <div>
                        <div className="text-[12px] font-mono text-indigo-400">{isSendraTx ? "Sendra Processing" : "Standard TX"}</div>
                        <div className="text-[10px] font-mono text-white/25 mt-1">{isSendraTx ? "Routing through pipeline..." : "Sending to RPC..."}</div>
                      </div>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-xl border ${result.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}
                    >
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className={`p-1.5 rounded-lg ${result.success ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {result.success ? <Icons.Check /> : <Icons.Error />}
                        </div>
                        <div className="text-[13px] font-bold tracking-tight">{result.success ? "Confirmed" : "Failed"}</div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-[8px] font-mono text-white/15 uppercase tracking-widest mb-0.5">Signature</div>
                          <div className="text-[10px] font-mono text-white/40 break-all">{result.signature || "n/a"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
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
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 rounded-xl border border-white/[0.04] border-dashed">
                      <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white/10 text-[12px] font-mono">
                        ?
                      </div>
                      <div className="text-[11px] text-white/15 font-mono">No transaction yet</div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* SDK Deep Trace */}
              {sdkLogs.length > 0 && (
                <div className="p-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <Icons.Flow />
                    <span className="text-[11px] font-mono text-indigo-400/40 uppercase tracking-widest">Execution Trace</span>
                  </div>
                  <div className="space-y-2">
                    {sdkLogs.map((log, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04] font-mono text-[10px] flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold tracking-wider ${
                            log.step.includes("RETRY") || log.step.includes("FAIL") ? "text-amber-400" :
                            log.step.includes("SUCCESS") || log.step.includes("CONFIRM") ? "text-emerald-400" :
                            "text-indigo-400"
                          }`}>[{log.step}]</span>
                          {log.attempt !== undefined && (
                            <span className="text-white/15 text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.06]">
                              Attempt {log.attempt}
                            </span>
                          )}
                        </div>
                        <span className="text-white/50">{log.message}</span>
                        {log.step === "RETRY" && (
                          <span className="text-amber-400/60 text-[9px]">Reason: {log.message}</span>
                        )}
                        {log.rpc && (
                          <span className="text-white/20 text-[9px] truncate break-all">RPC: {log.rpc}</span>
                        )}
                        {log.fee && (
                          <span className="text-white/20 text-[9px]">Fee: {log.fee}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flow Diagram */}
              {isSendraTx && sdkLogs.length > 0 && (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icons.Flow />
                    <span className="text-[11px] font-mono text-indigo-400/40 uppercase tracking-widest">Pipeline Flow</span>
                  </div>
                  <SendraFlowDiagram currentStep={sdkLogs.length > 0 ? sdkLogs[sdkLogs.length - 1].step : "IDLE"} />
                </div>
              )}

              {/* Info footer */}
              <div className="mt-auto p-5 border-t border-white/[0.04]">
                <p className="text-[10px] font-mono text-white/12 leading-relaxed">
                  Sendra uses dynamic fee scaling, multi-node routing, and pre-flight simulation to ensure your transaction lands even during extreme congestion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
