"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
    <path d="M3 10H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type TabKey = "Go" | "typescript" | "python" | "rust";

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
    code: `use sendra_sdk::{SendWithReliability, SendraParams, SendraOptions, Signer as SendraSigner};
use solana_sdk::{signature::{Keypair, Signer}, pubkey::Pubkey};
use solana_transaction::versioned::VersionedTransaction;

#[tokio::main]
async fn main() {
    let keypair = Keypair::new();
    let params = SendraParams {
        from: keypair.pubkey(),
        to: "DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa"
            .parse::<Pubkey>()
            .unwrap(),
        amount: 1000,
    };
    let signer = SendraSigner {
        public_key: keypair.pubkey(),
        sign_transaction: move |mut tx: VersionedTransaction| -> VersionedTransaction {
            tx.sign(&[&keypair]);
            tx
        },
    };
    let options = SendraOptions {
        max_retries: 3,
    };
    SendWithReliability(params, signer, options).await;
};`,
  },
  {
    key: "typescript",
    label: "TypeScript",
    lang: "typescript",
    dot: "#3178c6",
    code: `import { SendWithReliability } from "@sendra/sdk";
import { Keypair } from "@solana/web3.js";

const signer = Keypair.generate();

await SendWithReliability(
  {
    from: signer.publicKey,
    to: "DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa",
    amount: 1000,
  },
  {
    publicKey: signer.publicKey,
    signTransaction: async (tx) => {
      tx.sign([signer]);
      return tx;
    },
  },
  { maxRetries: 3 }
);`,
  },
  {
    key: "python",
    label: "Python",
    lang: "python",
    dot: "#3572A5",
    code: `from sendra_sdk import SendWithReliability, SendraParams, SendraOptions, Signer
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import VersionedTransaction

keypair = Keypair()

params = SendraParams(
    from_=keypair.pubkey(),
    to=Pubkey.from_string("DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa"),
    amount=1000
)
def sign_transaction(tx: VersionedTransaction) -> VersionedTransaction:
    tx = VersionedTransaction(tx.message, [keypair])
    return tx
signer = Signer(
    public_key=keypair.pubkey(),
    sign_transaction=sign_transaction
)
options = SendraOptions(max_retries=3)
SendWithReliability(params, signer, options)`,
  },
  {
    key: "Go",
    label: "Go",
    lang: "go",
    dot: "#89e051",
    code: `package main
import (
	sendra "github.com/sendra/sdk"
	"github.com/gagliardetto/solana-go"
)

func main() {
	keypair := solana.NewWallet()
	params := sendra.SendraParams{
		From:   keypair.PublicKey(),
		To:     solana.MustPublicKeyFromBase58("DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa"),
		Amount: 1000,
	}
	signer := sendra.Signer{
		PublicKey: keypair.PublicKey(),
		SignTransaction: func(tx *solana.VersionedTransaction) *solana.VersionedTransaction {
        _ = tx.Sign(func(solana.PublicKey) *solana.PrivateKey {
          return &keypair.PrivateKey
        })
        return tx
    },
	}
	options := sendra.SendraOptions{
		MaxRetries: 3,
	}
	sendra.SendWithReliability(params, signer, options)
}`,
  },
];

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

export function CodeSnippetTabs() {
  const [active, setActive] = useState<TabKey>("rust");
  const [copied, setCopied] = useState(false);

  const activeTab = TABS.find((t) => t.key === active)!;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeTab.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab.code]);

  return (
    <div className="relative w-full my-12">
      <div
        className="absolute inset-0 rounded-2xl -z-10 pointer-events-none"
        style={{ boxShadow: "0 0 80px rgba(99,102,241,0.13), 0 32px 64px rgba(0,0,0,0.5)" }}
      />

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#000000",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="font-mono text-[10px] text-white/40 tracking-tight">
              sdk/integration.ts
            </span>
          </div>

          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 p-1.5 rounded-md transition-colors duration-200 hover:bg-white/[0.05] text-white/40 hover:text-white/70"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="text-emerald-400"
                >
                  <CheckIcon />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  <CopyIcon />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

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
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity duration-200"
                    style={{
                      background: tab.dot,
                      opacity: isActive ? 1 : 0.35,
                    }}
                  />
                  {tab.label}
                </span>
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

        <div className="flex flex-col md:flex-row relative">

          <div
            className="absolute top-0 left-0 right-0 h-px z-10"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)" }}
          />

          <div className="relative overflow-hidden w-full md:w-[60%] border-r border-white/[0.04]">
            <div
              className="absolute top-0 bottom-0 left-0 w-10"
              style={{ background: "rgba(0,0,0,0.12)", borderRight: "1px solid rgba(255,255,255,0.03)" }}
            />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="h-[600px] overflow-hidden"
              >
                <SyntaxHighlighter
                  language={activeTab.lang}
                  style={customTheme}
                  showLineNumbers={true}
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

          <div className="w-full md:w-[40%] p-8 bg-transparent border-l border-white/[0.02] text-[#6b7280] font-mono text-[12px] leading-relaxed h-[600px] overflow-hidden">
            <div className="mb-6">
              <span className="text-[#a5b4fc]"># Sendra</span>
              <br />
              <br />
              # Sendra intercepts your transactions before they hit the network.
              <br />
              # It simulates, optimizes, routes — and if anything goes wrong, retries.
              <br />
              # Automatically. Every time.
              <br />
              <br />
              <br />
              <span className="text-[#a5b4fc]"># Integration & Features</span>
              <br />
              <br />
              - Zero code changes to your app
              <br />
              # - Sub-100ms overhead per transaction
              <br />
              # - Works with any Solana SDK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
