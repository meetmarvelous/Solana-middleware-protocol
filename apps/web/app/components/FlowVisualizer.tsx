"use client";

import { motion, AnimatePresence } from "framer-motion";

export type StepStatus = "idle" | "running" | "success" | "error";

export interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const stepIcons: Record<string, React.ReactElement> = {
  simulate: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7C2 4.24 4.24 2 7 2s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5Z" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.5" />
      <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  optimize: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 10l2.5-2.5 2 2 2.5-3.5 2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  route: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="2.5" cy="7" r="1" fill="currentColor" fillOpacity="0.6" />
      <circle cx="11.5" cy="3.5" r="1" fill="currentColor" />
      <circle cx="11.5" cy="10.5" r="1" fill="currentColor" fillOpacity="0.5" />
      <path d="M3.5 7H7l2-3.5H10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M3.5 7H7l2 3.5H10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  ),
  send: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l10-4.5-4 4.5 4 4.5L2 7Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  ),
  monitor: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="2.5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.6" />
      <path d="M5 11.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M4 7l1.5-2 1.5 1 1.5-2L10 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  retry: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7A4 4 0 0 1 10.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M11 7A4 4 0 0 1 3.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 3l1.5 1.5 1.5-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
      <path d="M2 8.5l1.5 1.5 1.5-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function StatusDot({ status }: { status: StepStatus }) {
  if (status === "running") {
    return (
      <div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(99,102,241,0.6)" }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
      </div>
    );
  }
  if (status === "success") {
    return (
      <div className="w-4 h-4 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
        <CheckIcon />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="w-4 h-4 rounded-full bg-red-400/15 border border-red-400/40 flex items-center justify-center flex-shrink-0 text-red-400">
        <ErrorIcon />
      </div>
    );
  }
  return (
    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }} />
  );
}

interface FlowVisualizerProps {
  steps: PipelineStep[];
}

export function FlowVisualizer({ steps }: FlowVisualizerProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0c0c10 0%, #09090d 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
        <span className="font-mono text-[9.5px] text-white/22 uppercase tracking-widest">Pipeline Execution</span>
      </div>

      <div className="p-4 space-y-1.5">
        {steps.map((step, i) => {
          const isActive = step.status === "running";
          const isDone = step.status === "success" || step.status === "error";
          const iconEl = stepIcons[step.id] || stepIcons.simulate;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300"
              style={{
                background: isActive
                  ? "rgba(99,102,241,0.07)"
                  : isDone && step.status === "success"
                    ? "rgba(52,211,153,0.04)"
                    : step.status === "error"
                      ? "rgba(239,68,68,0.04)"
                      : "transparent",
                border: isActive
                  ? "1px solid rgba(99,102,241,0.2)"
                  : isDone && step.status === "success"
                    ? "1px solid rgba(52,211,153,0.12)"
                    : step.status === "error"
                      ? "1px solid rgba(239,68,68,0.12)"
                      : "1px solid transparent",
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                style={{
                  background: isActive
                    ? "rgba(99,102,241,0.15)"
                    : step.status === "success"
                      ? "rgba(52,211,153,0.1)"
                      : step.status === "error"
                        ? "rgba(239,68,68,0.1)"
                        : "rgba(255,255,255,0.04)",
                  color: isActive
                    ? "rgba(165,180,252,0.9)"
                    : step.status === "success"
                      ? "rgba(52,211,153,0.9)"
                      : step.status === "error"
                        ? "rgba(239,68,68,0.9)"
                        : "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {iconEl}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-[11.5px] font-medium transition-colors duration-300"
                  style={{
                    color: isActive
                      ? "rgba(255,255,255,0.9)"
                      : isDone
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(255,255,255,0.25)",
                  }}
                >
                  {step.label}
                </div>
                <div className="text-[10px] font-mono truncate" style={{ color: "rgba(255,255,255,0.2)" }}>
                  {step.description}
                </div>
              </div>

              <StatusDot status={step.status} />

              {isActive && (
                <motion.div
                  className="absolute left-0 top-2 bottom-2 w-px rounded-full"
                  style={{ background: "rgba(99,102,241,0.7)" }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
