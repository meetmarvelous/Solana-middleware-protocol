"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const mainNodes = [
  { id: "user", label: "Your App", sub: "SDK / REST", accent: "rgba(255,255,255,0.08)" },
  { id: "api", label: "Sendra API", sub: "Entry point", accent: "rgba(99,102,241,0.22)", wide: true },
  { id: "sim", label: "Simulator", sub: "Pre-flight check", accent: "rgba(99,102,241,0.12)" },
  { id: "fee", label: "Fee Optimizer", sub: "Dynamic compute unit", accent: "rgba(99,102,241,0.12)" },
  { id: "router", label: "RPC Router", sub: "Latency-ranked", accent: "rgba(99,102,241,0.12)" },
  { id: "rpc", label: "RPC Node", sub: "Helius / QuickNode", accent: "rgba(52,211,153,0.13)", hasRetry: true },
  { id: "chain", label: "Solana", sub: "On-chain", accent: "rgba(139,92,246,0.18)" },
];

export function ArchitectureDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="w-full">

      {/* ── Mobile: vertical list ── */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {mainNodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -14 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.07, duration: 0.32 }}
            className="flex items-center gap-3"
          >
            <div
              className="px-3 py-2 rounded-lg flex-shrink-0"
              style={{ background: node.accent, border: "1px solid rgba(255,255,255,0.08)", minWidth: "130px" }}
            >
              <div className="text-[11px] font-medium text-white/78">{node.label}</div>
              <div className="text-[9px] font-mono text-white/28">{node.sub}</div>
            </div>
            {/* Retry badge inline on mobile */}
            {node.hasRetry && (
              <div
                className="px-2.5 py-1.5 rounded-lg text-center"
                style={{
                  background: "rgba(251,191,36,0.09)",
                  border: "1px solid rgba(251,191,36,0.22)",
                }}
              >
                <div className="text-[9.5px] font-medium whitespace-nowrap" style={{ color: "rgba(251,191,36,0.85)" }}>
                  ↺ Retry Engine
                </div>
                <div className="text-[8px] font-mono text-white/25">on failure</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Desktop: horizontal flow with per-column wrappers ── */}
      {/*
        Structure:
          [col: node + optional retry below]  [arrow]  [col: node + ...]  ...

        Key: items-start on outer flex so each col is top-aligned.
        Arrow divs have an explicit height matching the node box, so they
        stay vertically centered with the top row only, regardless of
        whether the adjacent column has a retry section below it.
      */}
      <div className="hidden md:flex items-start">
        {mainNodes.map((node, i) => (
          <div key={node.id} className="flex items-start">

            {/* ── Node column ── */}
            <div className="flex flex-col items-center">
              {/* Node box */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.38 }}
                className="px-3.5 py-2.5 rounded-xl text-center"
                style={{
                  background: node.accent,
                  border: "1px solid rgba(255,255,255,0.1)",
                  minWidth: node.wide ? "100px" : "86px",
                }}
              >
                <div className="text-[11.5px] font-medium text-white/82 whitespace-nowrap">{node.label}</div>
                <div className="text-[8.5px] font-mono text-white/28 whitespace-nowrap mt-0.5">{node.sub}</div>
              </motion.div>

              {/* ── Retry Engine — only under RPC Node ── */}
              {node.hasRetry && (
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.65, duration: 0.35 }}
                >
                  {/* Vertical line down from RPC Node */}
                  <div
                    className="w-px"
                    style={{
                      height: "20px",
                      background: "linear-gradient(to bottom, rgba(251,191,36,0.5), rgba(251,191,36,0.2))",
                    }}
                  />

                  {/* Retry Engine box */}
                  <div
                    className="px-3.5 py-2.5 rounded-xl text-center"
                    style={{
                      background: "rgba(251,191,36,0.08)",
                      border: "1px solid rgba(251,191,36,0.22)",
                      minWidth: "110px",
                    }}
                  >
                    <div
                      className="text-[11px] font-medium whitespace-nowrap"
                      style={{ color: "rgba(251,191,36,0.88)" }}
                    >
                      Retry Engine
                    </div>
                    <div className="text-[8.5px] font-mono text-white/28 whitespace-nowrap mt-0.5">
                      Backoff + fallover
                    </div>
                  </div>

                  {/* Label */}
                  <div
                    className="text-[8px] font-mono mt-1 text-center"
                    style={{ color: "rgba(251,191,36,0.4)" }}
                  >
                    ↑ on failure
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Arrow between nodes (not after the last one) ── */}
            {i < mainNodes.length - 1 && (
              <motion.div
                className="flex items-center flex-shrink-0"
                /*
                  Height here must match the node box height so the arrow
                  stays vertically centered with the node row, not the
                  full column height (which varies when retry is present).
                  The node box is ~46px tall (2.5 + text + 0.5 padding).
                  We use a fixed height of 46px.
                */
                style={{ width: "28px", height: "46px", transformOrigin: "left" }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={inView ? { scaleX: 1, opacity: 1 } : {}}
                transition={{ delay: i * 0.08 + 0.18, duration: 0.28 }}
              >
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.14)" }} />
                <svg width="5" height="6" viewBox="0 0 5 6" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M0 1l4 2-4 2V1Z" fill="rgba(255,255,255,0.22)" />
                </svg>
              </motion.div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
