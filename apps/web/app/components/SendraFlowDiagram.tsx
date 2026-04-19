"use client";

import { motion } from "framer-motion";

const STEPS = [
  { id: "SELECT_RPC", label: "Select RPC", desc: "Optimal Node Routing" },
  { id: "BUILD_TX", label: "Build TX", desc: "Construct Payload" },
  { id: "OPTIMIZE_FEE", label: "Fee Logic", desc: "Dynamic Priority Fees" },
  { id: "SIMULATE", label: "Simulate", desc: "Pre-flight Check" },
  { id: "SIGN_TX", label: "Sign", desc: "Wallet Signature" },
  { id: "SEND_TX", label: "Broadcast", desc: "Send to Network" },
  { id: "CONFIRM_TX", label: "Monitor", desc: "Confirm Finality" },
];

export interface SendraFlowDiagramProps {
  currentStep: string;
}

export function FlowStepNode({ id, label, desc, isActive, isDone, isFailed }: { id: string; label: string; desc: string; isActive: boolean; isDone: boolean; isFailed: boolean }) {
  const isError = isFailed && id === "CONFIRM_TX";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full max-w-[280px] p-3.5 rounded-xl border flex flex-col gap-1 transition-all duration-300 ${isActive
        ? "bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        : isDone
          ? "bg-white/[0.03] border-white/10"
          : isError
            ? "bg-red-500/10 border-red-500/40"
            : "bg-black/40 border-white/[0.04] opacity-40"
        }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-mono uppercase tracking-widest ${isActive ? "text-indigo-400" : isDone ? "text-emerald-400/80" : isError ? "text-red-400" : "text-white/30"}`}>
          {label}
        </span>
        {isActive && (
          <motion.div
            className="w-2 h-2 rounded-full bg-indigo-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {isDone && !isActive && (
          <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
        )}
        {isError && (
          <div className="w-2 h-2 rounded-full bg-red-400" />
        )}
      </div>
      <span className="text-[13px] font-medium text-white/80">{desc}</span>
    </motion.div>
  );
}

export function VerticalConnector({ active }: { active: boolean }) {
  return (
    <div className="w-[1px] h-6 relative mx-auto my-1">
      <div className="absolute inset-0 bg-white/10" />
      {active && (
        <motion.div
          className="absolute top-0 w-full bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,0.5)]"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}

export default function SendraFlowDiagram({ currentStep }: SendraFlowDiagramProps) {
  const isRetry = currentStep === "RETRY";

  const activeNormalized = isRetry ? "CONFIRM_TX" : currentStep;
  const activeIndex = STEPS.findIndex((s) => s.id === activeNormalized);

  const isFailed = currentStep === "FAIL_TX" || currentStep === "TX_FAILED";

  return (
    <div className="relative w-full flex flex-col items-center py-6 overflow-hidden">

      <div className="flex flex-col relative z-10 w-full items-center">
        {STEPS.map((step, idx) => {
          const isActive = idx === activeIndex || (isRetry && step.id === "CONFIRM_TX");
          const isDone = activeIndex === -1 ? false : idx < activeIndex;

          return (
            <div key={step.id} className="flex flex-col items-center w-[280px]">
              <FlowStepNode
                id={step.id}
                label={step.label}
                desc={step.desc}
                isActive={isActive}
                isDone={isDone}
                isFailed={isFailed}
              />
              {idx < STEPS.length - 1 && (
                <VerticalConnector active={idx < activeIndex || (isRetry && idx >= 2)} />
              )}
            </div>
          );
        })}
      </div>

      <div className={`absolute right-4 md:right-8 top-[38%] bottom-[10%] w-[30px] md:w-[50px] pointer-events-none transition-opacity duration-300 ${isRetry ? "opacity-100" : "opacity-0"}`}>
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <motion.path
            d="M 0,100 C 100,100 100,0 0,0"
            fill="none"
            stroke="rgba(245,158,11,0.6)"
            strokeWidth="3"
            strokeDasharray="6 6"
            animate={isRetry ? { strokeDashoffset: [0, -24] } : {}}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <polygon points="-5,-5 5,0 -5,5" fill="rgba(245,158,11,0.8)" transform="translate(0,0) rotate(-45)" />
        </svg>
      </div>
    </div>
  );
}
