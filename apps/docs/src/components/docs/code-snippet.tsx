"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

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

interface CodeSnippetProps {
  code: string;
  language: string;
}

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

export function CodeSnippet({ code, language }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="relative w-full my-8">
      <div
        className="absolute inset-0 rounded-2xl -z-10 pointer-events-none"
        style={{ boxShadow: "0 0 80px rgba(99,102,241,0.08), 0 32px 64px rgba(0,0,0,0.3)" }}
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
              {language === 'typescript' ? 'example.ts' : language === 'rust' ? 'main.rs' : language === 'python' ? 'app.py' : language === 'go' ? 'main.go' : 'code.txt'}
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

        <div className="relative overflow-hidden w-full">
          <div
            className="absolute top-0 bottom-0 left-0 w-10"
            style={{ background: "rgba(0,0,0,0.12)", borderRight: "1px solid rgba(255,255,255,0.03)" }}
          />

          <div className="min-h-[100px] overflow-hidden">
            <SyntaxHighlighter
              language={language}
              style={customTheme}
              showLineNumbers={true}
              lineNumberStyle={{
                display: "inline-block",
                color: "rgba(255,255,255,0.12)",
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
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
