import { AnimatePresence, useInView, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { demoLogs } from "@repo/config";

export function DemoTerminal() {
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