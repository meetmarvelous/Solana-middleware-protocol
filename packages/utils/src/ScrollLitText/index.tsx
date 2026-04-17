import { useScroll } from "framer-motion";
import { useRef } from "react";
import { ScrollWord } from "../ScrollWord";

export function ScrollLitText() {
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