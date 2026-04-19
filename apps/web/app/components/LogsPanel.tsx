"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LogEntry {
  id: string;
  type: "info" | "success" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
  detail?: string;
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const typeStyle: Record<LogEntry["type"], { prefix: string; color: string }> = {
  info: { prefix: "~", color: "rgba(255,255,255,0.38)" },
  success: { prefix: "✓", color: "#34d399" },
  warn: { prefix: "!", color: "#fbbf24" },
  error: { prefix: "✗", color: "#f87171" },
  debug: { prefix: "%", color: "rgba(167,139,250,0.5)" },
};

interface LogsPanelProps {
  logs: LogEntry[];
  onClear?: () => void;
}

export function LogsPanel({ logs, onClear }: LogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg, #0b0b0f 0%, #080809 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        height: "100%",
        minHeight: "280px",
      }}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2 flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}
      >
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff5f57]/70" />
          <div className="w-2 h-2 rounded-full bg-[#ffbd2e]/70" />
          <div className="w-2 h-2 rounded-full bg-[#28c840]/70" />
        </div>
        <span className="ml-1 font-mono text-[9.5px] text-white/22 uppercase tracking-widest flex-1">
          sendra — debug console
        </span>
        {onClear && logs.length > 0 && (
          <button
            onClick={onClear}
            className="font-mono text-[8.5px] text-white/18 hover:text-white/40 transition-colors duration-200"
          >
            clear
          </button>
        )}
        <div className="flex gap-0.5 ml-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-white/12"
              animate={logs.length > 0 ? { opacity: [0.12, 0.5, 0.12] } : {}}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-[11px]"
        style={{ scrollbarWidth: "thin" }}
      >
        {logs.length === 0 ? (
          <div className="text-white/14 text-[11px] font-mono pt-1">
            <span style={{ color: "rgba(99,102,241,0.5)" }}>$</span> awaiting transaction...
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="inline-block w-1.5 h-3 ml-0.5 rounded-sm"
              style={{ background: "rgba(99,102,241,0.4)", verticalAlign: "middle" }}
            />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => {
              const s = typeStyle[log.type];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2.5"
                >
                  <span className="text-white/18 flex-shrink-0 tabular-nums" style={{ minWidth: "52px" }}>
                    {log.timestamp}
                  </span>
                  <span className="flex-shrink-0" style={{ color: s.color }}>
                    {s.prefix}
                  </span>
                  <span style={{ color: s.color }}>{log.message}</span>
                  {log.detail && (
                    <span className="ml-auto text-white/18 text-[9.5px] truncate max-w-[120px]">{log.detail}</span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export { getTimestamp };
