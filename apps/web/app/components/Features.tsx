"use client";

import { Divider } from "@repo/utils";
import { motion } from "framer-motion";

function ArchNode({ label, x, y, w = 140, accent = false }: { label: string; x: number; y: number; w?: number; accent?: boolean }) {
    return (
        <g>
            <rect
                x={x} y={y} width={w} height={38} rx={8}
                fill={accent ? "rgba(232,115,74,0.12)" : "rgba(255,255,255,0.05)"}
                stroke={accent ? "rgba(232,115,74,0.4)" : "rgba(255,255,255,0.12)"}
                strokeWidth={1}
            />
            <text
                x={x + w / 2} y={y + 23}
                textAnchor="middle"
                fill={accent ? "#E8734A" : "rgba(255,255,255,0.7)"}
                fontSize={11}
                fontFamily="monospace"
            >
                {label}
            </text>
        </g>
    );
}

function ConnLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
    return (
        <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
            strokeDasharray="4 3"
        />
    );
}

function ArchitectureDiagram() {
    return (
        <svg viewBox="0 0 600 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <ConnLine x1={300} y1={48} x2={300} y2={72} />
            <ConnLine x1={300} y1={110} x2={180} y2={145} />
            <ConnLine x1={300} y1={110} x2={300} y2={145} />
            <ConnLine x1={300} y1={110} x2={420} y2={145} />
            <ConnLine x1={180} y1={183} x2={120} y2={218} />
            <ConnLine x1={180} y1={183} x2={240} y2={218} />
            <ConnLine x1={300} y1={183} x2={360} y2={218} />
            <ConnLine x1={420} y1={183} x2={480} y2={218} />
            <ConnLine x1={120} y1={256} x2={180} y2={290} />
            <ConnLine x1={240} y1={256} x2={180} y2={290} />
            <ConnLine x1={360} y1={256} x2={420} y2={290} />
            <ConnLine x1={480} y1={256} x2={420} y2={290} />
            <ConnLine x1={300} y1={328} x2={300} y2={348} />

            <ArchNode label="@repo/sdk" x={230} y={20} accent />

            <ArchNode label="@repo/core" x={230} y={72} accent />

            <ArchNode label="@repo/logger" x={110} y={145} />
            <ArchNode label="@repo/fee-optimizer" x={250} y={145} w={100} />
            <ArchNode label="@repo/retry-engine" x={370} y={145} w={120} />

            <ArchNode label="@repo/simulator" x={50} y={218} />
            <ArchNode label="@repo/router" x={200} y={218} w={100} />
            <ArchNode label="@repo/tx-builder" x={320} y={218} w={110} />
            <ArchNode label="@repo/rpc-client" x={450} y={218} w={110} />

            <ArchNode label="@repo/types" x={110} y={290} />
            <ArchNode label="@repo/config" x={350} y={290} />

            <ArchNode label="@solana/web3.js" x={230} y={348} w={140} accent />

            <circle cx={300} cy={200} r={160} fill="url(#glow)" opacity={0.15} />
            <defs>
                <radialGradient id="glow">
                    <stop offset="0%" stopColor="#E8734A" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>
        </svg>
    );
}

function PulsingDot() {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#4ade80", display: "inline-block",
                }}
            />
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(74,222,128,0.8)" }}>LIVE</span>
        </span>
    );
}

function FeatureCard({ title, desc, icon, delay = 0 }: { title: string; desc: string; icon: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: "linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 100%)",
                borderRadius: 16,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div style={{
                width: 44, height: 44, borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>{title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.4)", margin: 0 }}>{desc}</p>
        </motion.div>
    );
}

const icons = {
    bolt: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8734A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    ),
    shield: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8734A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    code: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8734A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
    ),
};

export default function Features() {
    return (
        <>
            <section className="relative z-10">
                <Divider />
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 24px" }}>
                    <div style={{ marginBottom: 56 }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.2)",
                            textTransform: "uppercase", letterSpacing: "0.2em",
                            border: "1px solid rgba(255,255,255,0.06)",
                            padding: "6px 12px", borderRadius: 9999, marginBottom: 16,
                        }}>
                            Features
                        </div>
                        <h2 style={{ fontSize: 40, fontWeight: 300, color: "#fff", lineHeight: 1.15, margin: 0 }}>
                            Infrastructure built for<br />reliable execution
                        </h2>
                        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", marginTop: 16, maxWidth: 560, lineHeight: 1.7 }}>
                            Sendra&apos;s modular architecture gives you full control over every stage of the transaction lifecycle — from simulation to confirmation.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 20 }} className="lg:!grid-cols-[2fr_1fr]">

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            style={{
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16,
                                overflow: "hidden",
                                background: "linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.005) 100%)",
                                position: "relative",
                            }}
                        >
                            <div style={{ padding: "28px 28px 0" }}>
                                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>
                                    Modular Architecture
                                </h3>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 460, lineHeight: 1.7 }}>
                                    Every component is a separate package — swap, extend, or replace any layer without touching the rest. Built as a true monorepo with clean dependency boundaries.
                                </p>
                            </div>
                            <div style={{ padding: "20px 16px 0", position: "relative" }}>
                                <div style={{
                                    position: "absolute", inset: 0,
                                    background: "radial-gradient(ellipse at 50% 80%, rgba(232,115,74,0.06) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }} />
                                <ArchitectureDiagram />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            style={{
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16,
                                overflow: "hidden",
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{
                                position: "absolute", inset: 0,
                                backgroundImage: "url(/hero_bg.jpg)",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "brightness(0.3) saturate(0.6)",
                            }} />
                            <div style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(180deg, rgba(6,6,10,0.85) 0%, rgba(6,6,10,0.5) 50%, rgba(6,6,10,0.9) 100%)",
                            }} />

                            <div style={{ position: "relative", zIndex: 1, padding: "28px 28px 0", flex: "0 0 auto" }}>
                                <div style={{ marginBottom: 16 }}>
                                    <PulsingDot />
                                </div>
                                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>
                                    Real-time Data Sync
                                </h3>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.7 }}>
                                    Every transaction streams status updates in real-time. No stale snapshots. No manual refreshing.
                                </p>
                            </div>

                            <div style={{
                                position: "relative", zIndex: 1, flex: 1,
                                padding: "24px 28px 28px",
                                display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 6,
                            }}>
                                {[
                                    { status: "confirmed", sig: "5Kx9...mR3q", time: "1.2s" },
                                    { status: "simulated", sig: "8Tn2...vB7k", time: "0.4s" },
                                    { status: "optimized", sig: "3Wp5...nL1m", time: "0.8s" },
                                    { status: "confirmed", sig: "9Ry4...jP2a", time: "1.1s" },
                                    { status: "retried", sig: "2Dm8...cQ5f", time: "2.3s" },
                                ].map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            fontSize: 11, fontFamily: "monospace",
                                            padding: "6px 10px", borderRadius: 6,
                                            background: "rgba(255,255,255,0.03)",
                                            border: "1px solid rgba(255,255,255,0.05)",
                                        }}
                                    >
                                        <span style={{
                                            width: 6, height: 6, borderRadius: "50%",
                                            background: log.status === "confirmed" ? "#4ade80"
                                                : log.status === "retried" ? "#facc15"
                                                    : "rgba(255,255,255,0.3)",
                                        }} />
                                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{log.sig}</span>
                                        <span style={{
                                            color: log.status === "confirmed" ? "rgba(74,222,128,0.7)"
                                                : log.status === "retried" ? "rgba(250,204,21,0.7)"
                                                    : "rgba(255,255,255,0.3)",
                                            textTransform: "uppercase", fontSize: 9, letterSpacing: "0.05em",
                                        }}>
                                            {log.status}
                                        </span>
                                        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)" }}>{log.time}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="md:!grid-cols-3">
                        <FeatureCard
                            title="Smart Fee Optimization"
                            desc="Dynamically adjusts priority fees based on real-time network congestion. Never overpay, never get dropped."
                            icon={icons.bolt}
                            delay={0}
                        />
                        <FeatureCard
                            title="Simulation Before Send"
                            desc="Every transaction is simulated before submission. Catch failures before they cost you compute units and time."
                            icon={icons.shield}
                            delay={0.1}
                        />
                        <FeatureCard
                            title="Drop-in SDK"
                            desc="Three lines of code to integrate. Works with any Solana project — no infrastructure changes, no vendor lock-in."
                            icon={icons.code}
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
