"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface Metric {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: React.ReactElement;
}

const metrics: Metric[] = [
  {
    label: "Avg Latency",
    value: "87ms",
    sub: "end-to-end median",
    accent: "rgba(99,102,241,1)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.4" />
        <path d="M8 4.5v4l2.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Retry Rate",
    value: "6.2%",
    sub: "across all txns",
    accent: "rgba(251,191,36,1)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8A5 5 0 0 1 11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
        <path d="M13 8A5 5 0 0 1 5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M10 2.5l1.5 1.5 1.5-1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
        <path d="M3 9.5l1.5 1.5 1.5-1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Success Rate",
    value: "99.97%",
    sub: "delivery guarantee",
    accent: "rgba(52,211,153,1)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Fee Savings",
    value: "42%",
    sub: "vs base priority fee",
    accent: "rgba(167,139,250,1)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 11l3-3 2 2 3-4 2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

interface MetricCardProps {
  metric: Metric;
  index: number;
  compact?: boolean;
}

function MetricCard({ metric, index, compact }: MetricCardProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -2 }}
      className={`relative rounded-xl overflow-hidden group cursor-default ${compact ? "p-4" : "p-5"}`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${metric.accent}22, transparent)` }}
      />
      <motion.div
        className="absolute top-0 left-4 right-4 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${metric.accent}66, transparent)` }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      />

      <div
        className={`${compact ? "w-7 h-7" : "w-8 h-8"} rounded-lg flex items-center justify-center mb-3 transition-colors duration-300`}
        style={{
          background: `${metric.accent}12`,
          border: `1px solid ${metric.accent}20`,
          color: metric.accent,
        }}
      >
        {metric.icon}
      </div>

      <div
        className={`${compact ? "text-xl" : "text-2xl"} font-light tabular-nums mb-0.5`}
        style={{ color: "rgba(255,255,255,0.88)" }}
      >
        {metric.value}
      </div>

      <div className="text-[11px] font-medium text-white/55">{metric.label}</div>

      {!compact && (
        <div className="text-[9.5px] font-mono text-white/20 mt-0.5 uppercase tracking-widest">{metric.sub}</div>
      )}

      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ boxShadow: `inset 0 0 24px ${metric.accent}08` }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

interface MetricsCardsProps {
  compact?: boolean;
  liveLatency?: number | null;
  liveRetries?: number | null;
}

export function MetricsCards({ compact, liveLatency, liveRetries }: MetricsCardsProps) {
  const displayMetrics = metrics.map((m, i) => {
    if (i === 0 && liveLatency != null)
      return { ...m, value: `${liveLatency}ms` };
    if (i === 1 && liveRetries != null)
      return { ...m, value: String(liveRetries) };
    return m;
  });

  return (
    <div className={`grid ${compact ? "grid-cols-2 gap-2.5" : "grid-cols-2 md:grid-cols-4 gap-3"}`}>
      {displayMetrics.map((m, i) => (
        <MetricCard key={m.label} metric={m} index={i} compact={compact} />
      ))}
    </div>
  );
}
