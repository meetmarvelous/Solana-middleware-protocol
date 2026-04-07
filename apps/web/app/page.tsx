"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { CodeSnippetTabs } from "./components/CodeSnippetTabs";
import { ArchitectureDiagram } from "./components/ArchitectureDiagram";
import { MetricsCards } from "./components/MetricsCards";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const Icons = {
  Simulate: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 11C3 6.58 6.58 3 11 3s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8Z" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
      <path d="M7 11l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Optimize: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 16l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <path d="M18 8V6h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  ),
  Route: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="4" cy="11" r="1.5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
      <circle cx="18" cy="16" r="1.5" fill="currentColor" fillOpacity="0.5" />
      <path d="M5.5 11H10l2.5-5H16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      <path d="M5.5 11H10l2.5 5H16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),
  Send: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 11l16-7-6 7 6 7-16-7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeOpacity="0.9" />
      <path d="M13 11H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
    </svg>
  ),
  Retry: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4.5 11A6.5 6.5 0 0 1 17 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M17.5 11A6.5 6.5 0 0 1 5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M15 5.5l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
      <path d="M3 12.5l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  SimulationFeat: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.3" />
      <path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  FeeFeat: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 12.5l3-3.5 2.5 2.5L12 6l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  RouteFeat: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="3" cy="9" r="1.2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="15" cy="4.5" r="1.2" fill="currentColor" />
      <circle cx="15" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.5" />
      <path d="M4.2 9H8l2-4.5H13.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M4.2 9H8l2 4.5H13.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  ),
  RetryFeat: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3.5 9A5.5 5.5 0 0 1 13 5.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M14.5 9A5.5 5.5 0 0 1 5 12.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M11.5 4l2 1.5 1.5-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
      <path d="M2.5 10.5l1.5 2 2-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Logo: () => (
    <img src="/logo.png" alt="Sendra Logo" width="55" height="55" className="rounded-md object-contain" />
  ),
};


const DECODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

function DecoderText({ text, isHovered }: { text: string; isHovered: boolean }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const charsPerTick = Math.max(text.length / 20, 0.2);
    let interval: ReturnType<typeof setInterval>;

    const tick = () => {
      setDisplayText(() => {
        return text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
          })
          .join("");
      });

      if (iteration >= text.length) {
        clearInterval(interval);
      }
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

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  const renderChildren = () => {
    const arr = Array.isArray(children) ? children : [children];
    return arr.map((child, i) => {
      if (typeof child === "string") {
        return <DecoderText key={i} text={child} isHovered={isHovered} />;
      }
      return child;
    });
  };

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative group px-4.5 py-2 rounded-lg bg-white text-black text-[12.5px] font-semibold overflow-hidden"
      style={{
        boxShadow: "0 0 0 1px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* Hover gradient shimmer */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #ffffff 0%, #eef0ff 50%, #ffffff 100%)" }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      {/* Shine sweep effect */}
      <div
        className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-indigo-100/60 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out"
      />
      {/* Soft Glow */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ boxShadow: "0 0 0px rgba(99,102,241,0)" }}
        whileHover={{ boxShadow: "0 0 15px rgba(99,102,241,0.25), 0 0 30px rgba(99,102,241,0.1)" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center gap-1.5 group-hover:text-indigo-950 transition-colors duration-200">
        {renderChildren()}
      </span>
    </motion.button>
  );
}

function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const content = useMemo(() => {
    if (!connected) return "Connect wallet";
    if (!base58) return "Connected";
    return base58.slice(0, 4) + '..' + base58.slice(-4);
  }, [connected, base58]);

  return (
    <PrimaryButton onClick={connected ? () => disconnect() : () => setVisible(true)}>
      {content}
    </PrimaryButton>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative group px-4.5 py-2 rounded-lg text-[12.5px] text-white/40 overflow-hidden"
    >
      {/* Animated border/glow */}
      <motion.span
        className="absolute inset-0 rounded-lg"
        style={{ border: "1px solid rgba(255,255,255,0.09)" }}
        whileHover={{
          border: "1px solid rgba(255,255,255,0.2)",
          backgroundColor: "rgba(255,255,255,0.04)",
          boxShadow: "0 0 14px rgba(255,255,255,0.05), inset 0 0 10px rgba(255,255,255,0.02)",
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      {/* Shine sweep effect */}
      <div
        className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out"
      />
      <span className="relative z-10 flex items-center gap-1.5 group-hover:text-white/90 transition-colors duration-200">
        {children}
      </span>
    </motion.button>
  );
}

function TiltLogo() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-20, 20], [10, -10]), { stiffness: 250, damping: 28 });
  const rotateY = useSpring(useTransform(x, [-20, 20], [-10, 10]), { stiffness: 250, damping: 28 });

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set(e.clientX - r.left - r.width / 2);
        y.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="flex items-center cursor-default select-none"
    >
      <Icons.Logo />
      <span className="-ml-3 font-semibold text-[13.5px] tracking-wide text-white/90">Sendra</span>
    </motion.div>
  );
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid — slightly more visible */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="herogrid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#herogrid)" />
      </svg>

      {/* Radial vignette to fade grid edges */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, #070709 100%)" }}
      />

      {/* Main glow orb — stronger, wider */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.28, 0.42, 0.28] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[620px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.24) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)" }}
      />
      {/* Secondary orb for colour variation */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)" }}
      />
      {/* Side glows */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.16, 0.08], x: [0, 28, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[5%] right-[-12%] w-[500px] h-[420px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.16) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.12, 0.06], x: [0, -18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-[15%] left-[-12%] w-[420px] h-[320px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
      />

      {/* Light streaks — more visible */}
      <motion.div
        animate={{ opacity: [0, 0.12, 0], scaleX: [0.6, 1.2, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[40%] left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 5%, rgba(99,102,241,0.6) 50%, transparent 95%)" }}
      />
      <motion.div
        animate={{ opacity: [0, 0.06, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-[58%] left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 10%, rgba(139,92,246,0.4) 50%, transparent 90%)" }}
      />
      <motion.div
        animate={{ opacity: [0, 0.05, 0], scaleX: [0.5, 1, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        className="absolute top-[25%] left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.25) 40%, rgba(139,92,246,0.25) 60%, transparent)" }}
      />

      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-64"
        style={{ background: "linear-gradient(to bottom, transparent, #070709)" }}
      />
    </div>
  );
}

function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Very subtle base gradient — avoids flat black */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(15,15,24,1) 0%, #070709 60%)" }}
      />
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.02]">
        <defs>
          <pattern id="pg" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pg)" />
      </svg>
      {/* Subtle bottom-centre accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full opacity-[0.035]"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,1) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px mx-6 md:mx-auto md:max-w-5xl"
      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
    />
  );
}

function ScrollLitText() {
  const ref = useRef<HTMLDivElement>(null);



  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start -10%"],
  });

  const words = "Most transactions fail silently. Users retry. Developers guess. Traditional infrastructure leaves execution unpredictable. Sendra fixes execution at the protocol layer ensuring transactions land reliably, every time.".split(" ");
  const n = words.length;

  return (
    <section ref={ref} className="relative py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] border border-white/[0.06] px-3 py-1.5 rounded-full">
          The problem
        </div>
      </div>
      <div className="flex flex-wrap gap-x-[14px] gap-y-3 justify-center mb-16">
        {words.map((word, i) => {

          const BAND_START = 0.0;
          const BAND_END = 1.0;
          const span = BAND_END - BAND_START;
          const wStart = BAND_START + (i / n) * span;
          const wEnd = Math.min(wStart + (span / n) * 2.0, 1.0);
          return (
            <ScrollWord key={i} word={word} progress={scrollYProgress} start={wStart} end={wEnd} />
          );
        })}
      </div>

      {/* ── Problem vs Solution Divider and Grid ── */}
      <div className="w-full h-px bg-white/[0.04] mb-12" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-0 lg:px-4">
        {/* Left: Problem */}
        <div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 border border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </div>
          <p className="text-[19px] leading-relaxed text-white/40 font-light tracking-wide pr-4">
            The gap in Solana infrastructure is that developers <span className="text-white/90">lose control over transactions</span> after sending them. Transactions get dropped suddenly due to fee spikes or network congestion, breaking the user experience.
          </p>
        </div>

        {/* Right: Solution */}
        <div className="relative">
          {/* Subtle vertical divider on desktop */}
          <div className="hidden md:block absolute -left-12 top-0 bottom-0 w-px bg-white/[0.04]" />

          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 border border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="text-[19px] leading-relaxed text-white/40 font-light tracking-wide pr-4">
            Sendra serves as a dedicated reliability layer to <span className="text-white/90">guarantee execution and return full control to developers</span>. It dynamically optimizes fees, routes past congested nodes, and handles retries automatically.
          </p>
        </div>
      </div>
    </section>
  );
}

function ScrollWord({ word, progress, start, end }: {
  word: string; progress: any; start: number; end: number;
}) {
  const range = Math.max(end - start, 0.001);


  const opacity = useTransform(progress, [start, end], [0.15, 1]);


  const color = useTransform(progress, [start, end], ["#383844", "#ece8ff"]);


  const combinedFilter = useTransform(progress, (v: number) => {
    const t = Math.max(0, Math.min(1, (v - start) / range));
    const blur = ((1 - t) * 5).toFixed(2);
    const gAlpha = (t * 0.32).toFixed(2);
    const gSize = (t * 10).toFixed(1);

    return t > 0.3
      ? `blur(${blur}px) drop-shadow(0 0 ${gSize}px rgba(139,92,246,${gAlpha}))`
      : `blur(${blur}px)`;
  });

  return (
    <motion.span
      style={{ opacity, color, filter: combinedFilter }}
      className="text-[28px] md:text-[44px] font-light tracking-tight leading-tight"
    >
      {word}
    </motion.span>
  );
}

const pipelineIcons: React.FC[] = [Icons.Simulate, Icons.Optimize, Icons.Route, Icons.Send, Icons.Retry];

function PipelineStep({ label, desc, index }: { label: string; desc: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = pipelineIcons[index] as React.FC;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(99,102,241,0.13), 0 0 0 1px rgba(139,92,246,0.18)" }}
      transition={{ duration: 0.48, delay: index * 0.09, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl cursor-default"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.052) 0%, rgba(255,255,255,0.012) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Top glow edge — always subtly visible, brighter on hover */}
      <div className="absolute top-0 left-6 right-6 h-px rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.18), transparent)" }}
      />
      <motion.div
        className="absolute top-0 left-4 right-4 h-px rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)" }}
        initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.28 }}
      />

      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.12, y: -2 }}
        transition={{ duration: 0.22 }}
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white/55 group-hover:text-white/95 transition-colors duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <Icon />
      </motion.div>

      <div className="text-center">
        <div className="text-[9px] text-white/20 font-mono uppercase tracking-[0.18em] mb-1.5">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="text-white font-medium text-[13px]">{label}</div>
        <div className="text-white/35 text-[11px] mt-1 leading-relaxed">{desc}</div>
      </div>

      {/* Hover ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.35 }}
        style={{ boxShadow: "inset 0 0 32px rgba(99,102,241,0.09)" }}
      />
    </motion.div>
  );
}

const featureIcons: React.FC[] = [Icons.SimulationFeat, Icons.FeeFeat, Icons.RouteFeat, Icons.RetryFeat];

function FeatureCard({ title, desc, tag, index }: { title: string; desc: string; tag: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = featureIcons[index] as React.FC;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -3, boxShadow: "0 20px 56px rgba(99,102,241,0.11), 0 0 0 1px rgba(139,92,246,0.16)" }}
      transition={{ duration: 0.42, delay: index * 0.08 }}
      className="group relative p-7 rounded-2xl overflow-hidden cursor-default"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.012) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Always-visible top glow edge */}
      <div className="absolute top-0 left-8 right-8 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.14), transparent)" }}
      />
      <motion.div
        className="absolute top-0 left-4 right-4 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.55), transparent)" }}
        initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.28 }}
      />

      <div className="flex items-start gap-3.5 mb-5">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white/50 group-hover:text-white/90 transition-colors duration-300"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <Icon />
        </div>
        <div className="text-[9px] font-mono text-white/22 uppercase tracking-[0.18em] mt-2">{tag}</div>
      </div>
      <h3 className="text-white font-semibold text-[15px] mb-2">{title}</h3>
      <p className="text-white/38 text-[13px] leading-relaxed">{desc}</p>

      {/* Bottom line on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }}
        initial={{ opacity: 0, scaleX: 0.4 }}
        whileHover={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
      {/* Corner glow */}
      <motion.div
        className="absolute -top-6 -right-6 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)" }}
        initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.35 }}
      />
    </motion.div>
  );
}


function ProductVizBox() {
  const ref = useRef(null);
  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: copy */}
          <div>
            <div className="text-[10px] font-mono text-white/22 uppercase tracking-[0.2em] mb-4">
              Execution Layer
            </div>
            <h2 className="text-3xl md:text-[40px] font-light text-white mb-5 leading-[1.1]">
              Every transaction,<br />
              <span className="text-white/45">handled with precision.</span>
            </h2>
            <p className="text-white/32 text-[14px] leading-relaxed mb-9">
              Sendra intercepts your transaction before it hits the network. It simulates, optimizes, routes — and if anything goes wrong, retries. Automatically. Every time.
            </p>
            <div className="space-y-3">
              {[
                "Zero code changes to your app",
                "Sub-100ms overhead per transaction",
                "Works with any Solana SDK",
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-[13px] text-white/35">
                  <div className="w-1 h-1 rounded-full bg-indigo-400/55 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: code snippet */}
          <div className="relative">
            <CodeSnippetTabs />
          </div>
        </div>
      </div>
    </section>
  );
}

const demoLogs = [
  { type: "info", text: "Initializing transaction simulation...", delay: 0 },
  { type: "success", text: "Simulation passed — no revert detected", delay: 900 },
  { type: "info", text: "Computing optimal compute unit price...", delay: 1700 },
  { type: "success", text: "Fee optimized: 0.000031 SOL (saved 42%)", delay: 2600 },
  { type: "info", text: "Selecting best RPC endpoint (latency scan)...", delay: 3400 },
  { type: "success", text: "Routed to primary: ny1.helius-rpc.com (12ms)", delay: 4200 },
  { type: "info", text: "Sending transaction...", delay: 5000 },
  { type: "warn", text: "Attempt 1 timed out — switching RPC node", delay: 5900 },
  { type: "info", text: "Retrying via fallback: fra1.helius-rpc.com...", delay: 6700 },
  { type: "success", text: "✓ Confirmed in slot 312,847,291 (1.2s)", delay: 7600 },
];

function DemoTerminal() {
  const [visible, setVisible] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const restart = useCallback(() => {
    setVisible([]); setRunning(false);
    setTimeout(() => {
      setRunning(true);
      demoLogs.forEach((log, i) => setTimeout(() => setVisible(v => [...v, i]), log.delay));
    }, 80);
  }, []);

  useEffect(() => {
    if (!inView || running) return;
    setRunning(true);
    demoLogs.forEach((log, i) => setTimeout(() => setVisible(v => [...v, i]), log.delay));
  }, [inView]);

  const colorMap: Record<string, string> = {
    info: "text-white/42", success: "text-emerald-400", warn: "text-amber-400", error: "text-red-400",
  };
  const dotMap: Record<string, string> = {
    info: "bg-white/14", success: "bg-emerald-400", warn: "bg-amber-400", error: "bg-red-400",
  };

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[10px] font-mono text-white/22 uppercase tracking-[0.2em] mb-3">Live Demo</div>
          <h2 className="text-3xl md:text-[40px] font-light text-white">Watch a transaction land</h2>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0c0c10 0%, #09090d 100%)",
            border: "1px solid rgba(255,255,255,0.065)",
            boxShadow: "0 0 80px rgba(99,102,241,0.07), 0 40px 80px rgba(0,0,0,0.5)",
          }}>
          {/* Titlebar */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.045]"
            style={{ background: "rgba(255,255,255,0.018)" }}>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/75" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/75" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/75" />
            <span className="ml-3 font-mono text-[9.5px] text-white/16">sendra — transaction relay</span>
          </div>

          {/* Stats */}
          <div className="flex gap-8 px-5 py-2.5 border-b border-white/[0.04]"
            style={{ background: "rgba(0,0,0,0.22)" }}>
            {[
              ["Attempts", visible.some(i => demoLogs[i]?.text.includes("Retry")) ? "2" : "1", "text-white/42"],
              ["Status",
                visible.some(i => demoLogs[i]?.text.includes("Confirmed")) ? "Confirmed" : visible.length > 0 ? "Relaying…" : "Idle",
                visible.some(i => demoLogs[i]?.text.includes("Confirmed")) ? "text-emerald-400" : "text-white/42"],
              ["Slot", visible.some(i => demoLogs[i]?.text.includes("Confirmed")) ? "312,847,291" : "—", "text-white/42"],
            ].map(([label, val, cls]) => (
              <div key={label as string}>
                <div className="text-[8px] text-white/18 uppercase tracking-widest font-mono">{label}</div>
                <div className={`text-[11px] font-mono font-medium mt-0.5 ${cls}`}>{val}</div>
              </div>
            ))}
          </div>

          {/* Logs */}
          <div className="p-5 font-mono text-[11px] space-y-2 min-h-[260px]">
            <AnimatePresence>
              {visible.map(i => {
                const log = demoLogs[i];
                if (!log) return null;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -7 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.24 }} className="flex items-start gap-2.5">
                    <span className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[log.type]}`} />
                    <span className={colorMap[log.type]}>{log.text}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {running && visible.length < demoLogs.length && (
              <div className="flex gap-1 pl-4 pt-0.5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1 h-1 rounded-full bg-white/14"
                    animate={{ opacity: [0.14, 0.6, 0.14] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between"
            style={{ background: "rgba(0,0,0,0.12)" }}>
            <span className="font-mono text-[9px] text-white/14">powered by sendra relay engine v2.1</span>
            <button onClick={restart}
              className="font-mono text-[9px] text-white/22 hover:text-white/52 transition-colors duration-200">
              restart ↺
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPrimaryButton({ children }: { children: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative group px-6 py-3 bg-white text-black font-semibold text-[13px] tracking-wide rounded hover:bg-white/90 transition-colors uppercase overflow-hidden"
    >
      <div className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out" />
      <span className="relative z-10 flex items-center justify-center">
        <DecoderText text={children} isHovered={isHovered} />
      </span>
    </motion.button>
  );
}

function HeroGhostButton({ children }: { children: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative group px-6 py-3 bg-white/5 text-white/90 font-semibold text-[13px] tracking-wide rounded hover:bg-white/10 border border-white/10 transition-colors uppercase overflow-hidden"
    >
      <div className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out" />
      <span className="relative z-10 flex items-center justify-center">
        <DecoderText text={children} isHovered={isHovered} />
      </span>
    </motion.button>
  );
}

export default function SendraPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, -55]);
  const heroOpacity = useTransform(heroScroll, [0, 0.65], [1, 0]);

  const pipeline = [
    { label: "Simulate", desc: "Pre-flight execution check" },
    { label: "Optimize", desc: "Dynamic fee computation" },
    { label: "Route", desc: "Fastest RPC selection" },
    { label: "Send", desc: "Submit with full context" },
    { label: "Retry", desc: "Automatic smart failover" },
  ];

  const features = [
    { tag: "Core / 01", title: "Simulation Engine", desc: "Every transaction is pre-flighted against live chain state. Reverts are caught before they cost you a fee." },
    { tag: "Core / 02", title: "Fee Optimization", desc: "Dynamic priority fees based on mempool density. Never overpay, never get dropped from the queue." },
    { tag: "Core / 03", title: "Smart RPC Routing", desc: "Continuous latency probing across a global RPC mesh. Your transaction always takes the fastest route." },
    { tag: "Core / 04", title: "Retry Engine", desc: "Exponential backoff with intelligent node switching. Stalled transactions get another shot, automatically." },
  ];

  return (
    <main className="relative min-h-screen text-white overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #06060a 0%, #080810 25%, #07070c 55%, #060608 100%)" }}>
      <PageBackground />

      <header className="sticky top-0 z-50 w-full"
        style={{
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          borderBottom: "1px solid rgba(255,255,255,0.045)",
          background: "rgba(7,7,9,0.82)",
        }}>
        <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex flex-1">
            <TiltLogo />
          </div>
          <div className="hidden md:flex items-center justify-center gap-8 text-[13px] text-white/32">
            {([["#how", "How it works"], ["#features", "Features"], ["#arch", "Architecture"], ["/demo", "Demo →"]] as [string, string][]).map(([href, label]) => (
              href.startsWith("/") ? (
                <Link key={href} href={href}
                  className="relative hover:text-white/72 transition-colors duration-200 group">
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/28 group-hover:w-full transition-all duration-300" />
                </Link>
              ) : (
                <a key={href} href={href}
                  className="relative hover:text-white/72 transition-colors duration-200 group">
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/28 group-hover:w-full transition-all duration-300" />
                </a>
              )
            ))}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <GhostButton>Read docs</GhostButton>
            <Link href="/demo"><PrimaryButton>Try Demo</PrimaryButton></Link>
            <WalletButton />
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative z-10 w-full pt-[108px] px-[56px] pb-0 shadow-2xl" style={{ clipPath: 'inset(0 0 5% 0 round 0px 0px 40px 40px)' }}>
        <div
          className="absolute top-0 left-0 right-0 h-[95%] z-[-1] pointer-events-none opacity-90 overflow-hidden rounded-b-[40px]"
          style={{
            backgroundImage: "url('/hero_bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-[1313px] mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md mb-8"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="w-4 h-4 rounded bg-[#6366f1] flex items-center justify-center font-bold text-white text-[10px]"
            >
              S
            </motion.span>
            <span className="text-[12px] font-sans text-white/70 tracking-wide">Built for <strong className="text-white/90 font-semibold">Solana</strong></span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-[60px] md:text-[84px] font-semibold leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6 text-white"
          >
            Transactions that don't fail.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.17 }}
            className="text-white/60 text-[18px] md:text-[20px] max-w-[700px] mx-auto leading-relaxed mb-10"
          >
            Sendra ensures every Solana transaction lands — with simulation, smart routing, and automatic retries.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.27 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-20"
          >
            <Link href="/demo">
              <HeroPrimaryButton>START FOR FREE</HeroPrimaryButton>
            </Link>
            <HeroGhostButton>BOOK A DEMO</HeroGhostButton>
          </motion.div>

          {/* New Code Snippet in Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full text-left"
          >
            <CodeSnippetTabs />
          </motion.div>

        </motion.div>
      </section>

      {/* ── Scroll-lit ── */}
      <section className="relative z-10">
        <Divider />
        <ScrollLitText />
      </section>



      {/* ── How it works ── */}
      <section id="how" className="relative z-10">
        <Divider />
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-3">Pipeline</div>
            <h2 className="text-3xl md:text-[40px] font-light text-white leading-tight">How Sendra works</h2>
          </div>
          <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3">
            {pipeline.map((step, i) => (
              <div key={step.label} className="relative">
                <PipelineStep {...step} index={i} />
                {i < pipeline.length - 1 && (
                  <div className="hidden md:flex absolute top-[44%] -right-2 z-10 items-center">
                    <div className="w-2 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
                    <svg width="5" height="5" viewBox="0 0 5 5" fill="none" style={{ opacity: 0.2 }}>
                      <path d="M0 2.5L4 0.5V4.5L0 2.5Z" fill="white" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mt-10 text-[12px] text-white/18 font-mono italic tracking-wide">
            "We don't just send transactions — we ensure they land."
          </motion.p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10">
        <Divider />
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-3">Capabilities</div>
            <h2 className="text-3xl md:text-[40px] font-light text-white leading-tight">Built on four pillars</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture Diagram ── */}
      <section id="arch" className="relative z-10">
        <Divider />
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-3">System Design</div>
            <h2 className="text-3xl md:text-[40px] font-light text-white leading-tight">Architecture</h2>
            <p className="text-white/28 text-[14px] mt-3 max-w-md mx-auto">
              User → Sendra API → Simulator → Fee Optimizer → Router → RPC → Blockchain
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 md:p-8 overflow-x-auto"
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <ArchitectureDiagram />
          </motion.div>
        </div>
      </section>

      {/* ── Metrics ── */}
      <section className="relative z-10">
        <Divider />
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-3">Performance</div>
            <h2 className="text-3xl md:text-[40px] font-light text-white leading-tight">Built for reliability</h2>
          </div>
          <MetricsCards />
        </div>
      </section>

      {/* ── Demo ── */}
      <section id="demo" className="relative z-10">
        <Divider />
        <DemoTerminal />
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 overflow-hidden">
        <Divider />
        {/* Radial glow behind CTA */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[600px] h-[400px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(ellipse, rgba(99,102,241,1) 0%, transparent 70%)" }}
          />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
              style={{ border: "1px solid rgba(99,102,241,0.18)", background: "rgba(99,102,241,0.06)" }}>
              <span className="text-[10px] font-mono text-indigo-300/60 tracking-[0.16em] uppercase">Open beta</span>
            </div>
            <h2 className="text-4xl md:text-[50px] font-extralight text-white mb-5 leading-tight tracking-tight">
              Ready to stop losing<br />transactions?
            </h2>
            <p className="text-white/32 mb-10 text-[15px] leading-relaxed">
              Integrate Sendra in minutes. Drop-in SDK, zero infrastructure changes.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center">
              <Link href="/demo">
                <PrimaryButton>
                  Try Demo
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </PrimaryButton>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <GhostButton>View on GitHub</GhostButton>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10">
        <Divider />
        <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 justify-center md:justify-start">
            <TiltLogo />
          </div>
          <p className="text-[11px] text-white/16 font-mono tracking-wide text-center">Built for Solana builders.</p>
          <div className="flex flex-1 justify-center md:justify-end gap-6 text-[11px] text-white/20">
            {["Docs", "GitHub", "Twitter"].map(link => (
              <a key={link} href="#"
                className="relative hover:text-white/52 transition-colors duration-200 group">
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/22 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
