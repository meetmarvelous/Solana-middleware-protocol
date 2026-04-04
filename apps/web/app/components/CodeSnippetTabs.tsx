"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

// ─── Copy Icon ────────────────────────────────────────────────────────────────
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
    <path d="M3 10H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Snippet Data ─────────────────────────────────────────────────────────────
type TabKey = "curl" | "typescript" | "python" | "rust";

interface Tab {
  key: TabKey;
  label: string;
  lang: string;
  dot: string;
  code: string;
}

const TABS: Tab[] = [
  {
    key: "rust",
    label: "Rust",
    lang: "rust",
    dot: "#dea584",
    code: ` use reqwest::Client;
 use serde_json::json;

 #[tokio::main]
 async fn send_tx() -> Result<(), reqwest::Error> {
     let client = Client::new();

     let body = json!({
         "transaction": "BASE64_SERIALIZED_TX",
         "options": {
             "maxRetries": 3
         }
     });

     let res = client
         .post("https://api.sendra.dev/tx")
         .header("Content-Type", "application/json")
         .json(&body)
         .send()
         .await?;

     let data: serde_json::Value = res.json().await?;
     println!("Tx Status: {:?}", data);

     Ok(())
 }`,
  },
  {
    key: "typescript",
    label: "TypeScript",
    lang: "typescript",
    dot: "#3178c6",
    code: ` const sendTx = async () => {
   const res = await fetch("https://api.sendra.dev/tx", {
     method: "POST",
     headers: {
       "Content-Type": "application/json"
     },
     body: JSON.stringify({
       transaction: serializedTx,
       options: {
         maxRetries: 3
       }
     })
   });

   const data = await res.json();
   console.log("Tx Status:", data);
 };`,
  },
  {
    key: "python",
    label: "Python",
    lang: "python",
    dot: "#3572A5",
    code: ` import requests

 url = "https://api.sendra.dev/tx"

 payload = {
     "transaction": "BASE64_SERIALIZED_TX",
     "options": {
         "maxRetries": 3
     }
 }

 res = requests.post(url, json=payload)
 print(res.json())`,
  },
  {
    key: "curl",
    label: "cURL",
    lang: "bash",
    dot: "#89e051",
    code: ` curl -X POST https://api.sendra.dev/tx \\
   -H "Content-Type: application/json" \\
   -d '{
     "transaction": "BASE64_SERIALIZED_TX",
     "options": { "maxRetries": 3 }
   }'`,
  },
];

// ─── Custom syntax highlighting theme (matches dark UI) ───────────────────────
const customTheme = {
  ...atomOneDark,
  hljs: {
    ...atomOneDark.hljs,
    background: "transparent",
    color: "#c9d1d9",
    fontSize: "12.5px",
    lineHeight: "1.75",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace",
  },
};

// ─── CodeSnippetTabs ──────────────────────────────────────────────────────────
export function CodeSnippetTabs() {
  const [active, setActive] = useState<TabKey>("curl");
  const [copied, setCopied] = useState(false);

  const activeTab = TABS.find((t) => t.key === active)!;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeTab.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab.code]);

  return (
    <div className="relative w-full">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl -z-10 pointer-events-none"
        style={{ boxShadow: "0 0 80px rgba(99,102,241,0.13), 0 32px 64px rgba(0,0,0,0.5)" }}
      />

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d0d12 0%, #0a0a0f 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* ── Window chrome ── */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]"
          style={{ background: "rgba(255,255,255,0.018)" }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/75" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/75" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/75" />
          </div>
          <span className="font-mono text-[9.5px] text-white/20 tracking-widest uppercase">
            Sendra API
          </span>
          {/* Copy button */}
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[9.5px] transition-colors duration-200"
            style={{
              color: copied ? "#4ade80" : "rgba(255,255,255,0.28)",
              background: copied ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${copied ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <CheckIcon />
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <CopyIcon />
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── Language tabs ── */}
        <div
          className="flex items-center gap-0 px-3 pt-2 border-b border-white/[0.04]"
          style={{ background: "rgba(0,0,0,0.15)" }}
        >
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className="relative px-3.5 py-2 font-mono text-[10.5px] transition-colors duration-200 outline-none"
                style={{ color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)" }}
              >
                <span className="flex items-center gap-1.5">
                  {/* Language dot */}
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity duration-200"
                    style={{
                      background: tab.dot,
                      opacity: isActive ? 1 : 0.35,
                    }}
                  />
                  {tab.label}
                </span>
                {/* Active underline */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

        </div>

        {/* ── Code block ── */}
        <div className="relative overflow-hidden">
          {/* Top glow edge */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)" }}
          />

          {/* Line number gutter */}
          <div
            className="absolute top-0 bottom-0 left-0 w-10"
            style={{ background: "rgba(0,0,0,0.18)", borderRight: "1px solid rgba(255,255,255,0.03)" }}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="min-h-[260px]"
            >
              <SyntaxHighlighter
                language={activeTab.lang}
                style={customTheme}
                showLineNumbers
                lineNumberStyle={{
                  display: "inline-block",
                  color: "rgba(255,255,255,0.18)",
                  fontSize: "10px",
                  minWidth: "40px",
                  paddingRight: "12px",
                  paddingLeft: "4px",
                  textAlign: "right",
                  userSelect: "none",
                }}
                customStyle={{
                  margin: 0,
                  padding: "20px 20px 24px 0",
                  background: "transparent",
                  overflow: "auto",
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace",
                  },
                }}
              >
                {activeTab.code}
              </SyntaxHighlighter>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-t border-white/[0.04]"
          style={{ background: "rgba(0,0,0,0.25)" }}
        >
          <span className="font-mono text-[8.5px] text-white/16 tracking-widest uppercase">
            POST /api/tx · api.sendra.dev
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="font-mono text-[8.5px] text-white/16">maxRetries: 3</span>
            <span
              className="px-1.5 py-0.5 rounded font-mono text-[7.5px] text-indigo-300/50 tracking-wide"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)" }}
            >
              JSON
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
