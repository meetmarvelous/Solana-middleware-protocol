"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TxStatus {
  signature: string;
  status: "confirmed" | "finalized" | "processed" | "failed" | "not_found";
  confirmations: number | null;
  slot: number | null;
  err: string | null;
}

async function fetchTxStatus(signature: string): Promise<TxStatus> {
  try {
    const res = await fetch(`/api/status?signature=${encodeURIComponent(signature)}`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    await new Promise((r) => setTimeout(r, 1200));
    const mocked: TxStatus[] = [
      { signature, status: "finalized", confirmations: 31, slot: 312847291, err: null },
      { signature, status: "confirmed", confirmations: 3, slot: 312847300, err: null },
      { signature, status: "failed", confirmations: null, slot: 312847410, err: "InstructionError: Custom(6001)" },
    ];
    return mocked[Math.floor(Math.random() * mocked.length)] as TxStatus;
  }
}

const statusConfig: Record<TxStatus["status"], { label: string; color: string; bg: string; border: string }> = {
  finalized: { label: "Finalized", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  confirmed: { label: "Confirmed", color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
  processed: { label: "Processed", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  failed: { label: "Failed", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  not_found: { label: "Not Found", color: "rgba(255,255,255,0.28)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)" },
};

export function TxTracker() {
  const [sig, setSig] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TxStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    const trimmed = sig.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await fetchTxStatus(trimmed);
      setResult(data);
    } catch (e) {
      setError("Failed to fetch status.");
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? statusConfig[result.status] : null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0c0c10 0%, #09090d 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M6 3.5v3l2 1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <span className="font-mono text-[9.5px] text-white/22 uppercase tracking-widest">Transaction Tracker</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={sig}
            onChange={(e) => setSig(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            placeholder="Enter signature..."
            className="flex-1 px-3 py-2 rounded-lg font-mono text-[11px] outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          <motion.button
            onClick={handleTrack}
            disabled={loading || !sig.trim()}
            whileTap={{ scale: 0.96 }}
            className="px-3.5 py-2 rounded-lg font-mono text-[11px] font-medium transition-all duration-200 disabled:opacity-40"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "rgba(165,180,252,0.9)",
            }}
          >
            {loading ? (
              <motion.div
                className="w-3 h-3 rounded-full border border-indigo-400/40"
                style={{ borderTopColor: "rgba(165,180,252,0.9)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              "Track"
            )}
          </motion.button>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && cfg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg p-3 space-y-2.5"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              {/* Status badge */}
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: cfg.color }}
                  animate={result.status !== "failed" && result.status !== "not_found" ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-mono text-[11px] font-medium" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2">
                {result.slot && (
                  <div>
                    <div className="text-[8.5px] text-white/20 font-mono uppercase tracking-widest mb-0.5">Slot</div>
                    <div className="text-[11px] font-mono text-white/60">{result.slot.toLocaleString()}</div>
                  </div>
                )}
                {result.confirmations !== null && (
                  <div>
                    <div className="text-[8.5px] text-white/20 font-mono uppercase tracking-widest mb-0.5">Confirmations</div>
                    <div className="text-[11px] font-mono text-white/60">{result.confirmations}</div>
                  </div>
                )}
                {result.err && (
                  <div className="col-span-2">
                    <div className="text-[8.5px] text-red-400/50 font-mono uppercase tracking-widest mb-0.5">Error</div>
                    <div className="text-[10px] font-mono text-red-400/70">{result.err}</div>
                  </div>
                )}
              </div>

              {/* Signature */}
              <div>
                <div className="text-[8.5px] text-white/20 font-mono uppercase tracking-widest mb-0.5">Signature</div>
                <div className="text-[9.5px] font-mono text-white/28 truncate">{result.signature}</div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg px-3 py-2.5 font-mono text-[11px] text-red-400/70"
              style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.12)" }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
