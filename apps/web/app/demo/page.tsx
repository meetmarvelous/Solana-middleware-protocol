"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { SendWithReliability } from "@repo/sdk";

// --- Icons ---
const Icons = {
  Logo: () => (
    <img src="/logo.png" alt="Sendra Logo" width={40} height={40} className="rounded-md object-contain" />
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
};

// --- Reusable UI (Ported from landing page) ---
const DECODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
function DecoderText({ text, isHovered }: { text: string; isHovered: boolean }) {
  const [displayText, setDisplayText] = useState(text);
  useEffect(() => {
    if (!isHovered) { setDisplayText(text); return; }
    let iteration = 0;
    const charsPerTick = Math.max(text.length / 20, 0.2);
    let interval: ReturnType<typeof setInterval>;
    const tick = () => {
      setDisplayText(() => text.split("").map((char, index) => {
        if (char === " ") return " ";
        if (index < iteration) return text[index];
        return DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
      }).join(""));
      if (iteration >= text.length) clearInterval(interval);
      iteration += charsPerTick;
    };
    interval = setInterval(tick, 30);
    return () => clearInterval(interval);
  }, [isHovered, text]);
  return (
    <span className="relative inline-flex flex-col items-center justify-center">
      <span className={isHovered ? "opacity-0 pointer-events-none whitespace-pre" : "whitespace-pre"}>{text}</span>
      {isHovered && (
        <span className="absolute w-full font-mono tracking-tighter flex items-center justify-center whitespace-pre text-[11px] text-center">
          {displayText}
        </span>
      )}
    </span>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className="relative group w-full px-6 py-3 rounded-xl bg-white text-black text-[13px] font-bold overflow-hidden disabled:opacity-50 disabled:pointer-events-none"
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.9), 4px 8px 16px rgba(0,0,0,0.4)" }}
    >
      <motion.div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #ffffff 0%, #eef0ff 50%, #ffffff 100%)" }} initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} />
      <div className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-indigo-100/60 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out" />
      <span className="relative z-10 flex items-center justify-center gap-1.5 group-hover:text-indigo-950 transition-colors uppercase tracking-wider">
        {typeof children === "string" ? <DecoderText text={children} isHovered={isHovered} /> : children}
      </span>
    </motion.button>
  );
}

function HeroBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="herogrid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="0.6" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#herogrid)" />
      </svg>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, #070709 100%)" }} />
      <motion.div animate={{ scale: [1, 1.18, 1], opacity: [0.28, 0.42, 0.28] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[620px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.24) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)" }} />
    </div>
  );
}

// --- Demo Components ---
function InputField({ label, value, onChange, placeholder, type = "text", disabled }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] text-white/80 outline-none transition-all focus:border-white/20 focus:bg-white/[0.05] placeholder:text-white/10"
      />
    </div>
  );
}

// --- Main Page ---
export default function DemoPage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const pushLog = (type: "info" | "success" | "error" | "warn", message: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { type, message, time, id: Math.random() }]);
  };

  const handleSend = async () => {
    if (!connected || !publicKey || !signTransaction) {
      pushLog("error", "Wallet not connected");
      return;
    }
    if (!receiver || !amount) {
      pushLog("error", "Details missing");
      return;
    }

    setLoading(true);
    setResult(null);
    setLogs([]);
    pushLog("info", "🚀 Initializing Sendra reliability layer...");

    try {
      const signer = { publicKey, signTransaction };
      const res = await SendWithReliability(
        { receiver: new PublicKey(receiver), amount: Number(amount) },
        signer,
        { maxRetries: 3 }
      );

      if (res.success) {
        setResult(res);
        pushLog("success", `Landed in slot! Sig: ${res.signature?.slice(0, 8)}...`);
      } else {
        pushLog("error", `Failed: ${res.error}`);
        setResult(res);
      }
    } catch (e: any) {
      pushLog("error", `Fatal: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#070709] text-white overflow-x-hidden selection:bg-indigo-500/30">
      <HeroBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b border-white/[0.03] bg-[#070709]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1 px-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
              <Icons.Back />
            </div>
            <span className="text-[11px] font-mono text-white/30 uppercase tracking-[0.2em] group-hover:text-white/60 transition-all">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Icons.Logo />
            <span className="font-bold text-[14px] tracking-tight">Sendra</span>
            <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400 uppercase tracking-widest">Demo</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Side: Inputs */}
          <div className="lg:col-span-7 space-y-10">
            <div>
              <h1 className="text-[44px] font-light leading-[1.1] mb-4 tracking-tight">
                Execute with <br />
                <span className="text-white/40">full reliability.</span>
              </h1>
              <p className="text-[15px] text-white/30 leading-relaxed max-w-md">
                Send a real transaction on Solana Devnet. Sendra intercepts, optimizes, and guarantees execution.
              </p>
            </div>

            <div className="p-8 rounded-[24px] bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm space-y-8">
              <div className="space-y-6">
                <InputField
                  label="Receiver Address"
                  value={receiver}
                  onChange={setReceiver}
                  placeholder="Enter devnet public key..."
                  disabled={loading}
                />
                <InputField
                  label="Amount (Lamports)"
                  value={amount}
                  onChange={setAmount}
                  placeholder="e.g. 1000000"
                  type="number"
                  disabled={loading}
                />
              </div>

              {!connected ? (
                <PrimaryButton onClick={() => setVisible(true)}>
                  Connect Wallet to Send
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={handleSend} disabled={loading}>
                  {loading ? "Relaying Transaction..." : "Send Transaction →"}
                </PrimaryButton>
              )}
            </div>

            {/* Logs Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Execution Logs</div>
                {logs.length > 0 && (
                  <button onClick={() => setLogs([])} className="text-[10px] font-mono text-white/20 hover:text-white/60">Clear</button>
                )}
              </div>
              <div className="min-h-[200px] p-6 rounded-[20px] bg-black/40 border border-white/[0.04] font-mono text-[11px] space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                {logs.length === 0 && <div className="text-white/10 italic">Awaiting transaction details...</div>}
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4"
                    >
                      <span className="text-white/10 shrink-0">[{log.time}]</span>
                      <span className={log.type === "error" ? "text-red-400" : log.type === "success" ? "text-emerald-400" : log.type === "warn" ? "text-amber-400" : "text-white/40"}>
                        {log.message}
                      </span>
                    </motion.div>
                  )).reverse()}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Side: Status/Result */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-[24px] bg-indigo-500/[0.03] border border-indigo-500/10 backdrop-blur-sm h-full flex flex-col">
              <div className="mb-8">
                <div className="text-[10px] font-mono text-indigo-400/50 uppercase tracking-[0.2em] mb-2">Network Status</div>
                <h3 className="text-xl font-medium">Solana Devnet</h3>
              </div>

              <div className="flex-1 space-y-6">
                {/* Result Card */}
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-2xl border ${result.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${result.success ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {result.success ? <Icons.Check /> : <Icons.Error />}
                        </div>
                        <div className="font-bold tracking-tight">{result.success ? "Transaction Confirmed" : "Execution Failed"}</div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Signature</div>
                          <div className="text-[11px] font-mono text-white/50 break-all">{result.signature || "n/a"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Attempts</div>
                            <div className="text-[14px] font-bold">{result.attempts || 1}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Status</div>
                            <div className={`text-[14px] font-bold ${result.success ? "text-emerald-400" : "text-red-400"}`}>{result.success ? "Success" : "Failed"}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 border border-white/[0.04] rounded-2xl border-dashed">
                      <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white/10">
                        ?
                      </div>
                      <div className="text-[12px] text-white/20 leading-relaxed">
                        Transaction details will appear <br /> here after execution.
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-black/20 border border-white/[0.03]">
                <p className="text-[11px] text-white/20 leading-relaxed">
                  Sendra uses dynamic fee scaling and multi-node routing to ensure your transaction lands even during extreme congestion.
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
    </main>
  );
}
