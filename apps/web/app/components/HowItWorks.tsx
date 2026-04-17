import { Divider } from "@repo/utils";
import { motion } from "framer-motion";
import { pipeline } from "@repo/config";

export default function () {
    return (
        <>
            <section id="how" className="relative z-10">
                <Divider />
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="text-center mb-14">
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-3">Pipeline</div>
                        <h2 className="text-3xl md:text-[40px] font-light text-white leading-tight">How Sendra works</h2>
                    </div>

                    {/* ── Main bordered container ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.008) 100%)",
                        }}
                    >
                        {/* ── Video ── */}
                        <div className="relative w-full" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                            <video
                                className="w-full block"
                                autoPlay
                                loop
                                muted
                                playsInline
                            >
                                <source src="/working.MP4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        {/* ── Steps rows (2 rows × 3 columns) ── */}
                        {[pipeline.slice(0, 3), pipeline.slice(3, 6)].map((row, rowIdx) => (
                            <div key={rowIdx} className="flex flex-col sm:flex-row"
                                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                {row.map((step, colIdx) => {
                                    const globalIdx = rowIdx * 3 + colIdx;
                                    const isLastCol = colIdx === row.length - 1;
                                    return (
                                        <motion.div
                                            key={step.label}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.35, delay: globalIdx * 0.06 }}
                                            className="flex-1 px-6 py-5"
                                            style={{
                                                borderRight: isLastCol ? "none" : "1px solid rgba(255,255,255,0.06)",
                                            }}
                                        >
                                            {/* Number + Title inline */}
                                            <div className="flex items-baseline gap-3 mb-1.5">
                                                <span className="text-[14px] font-semibold" style={{ color: "#E8734A" }}>
                                                    {String(globalIdx + 1).padStart(2, "0")}
                                                </span>
                                                <span className="text-[14px] font-semibold text-white">
                                                    {step.label}
                                                </span>
                                            </div>
                                            {/* Description */}
                                            <p className="text-[12.5px] leading-relaxed text-white/40 pl-[29px]">
                                                {step.desc}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center mt-10 text-[12px] text-white/18 font-mono italic tracking-wide">
                        "We don't just send transactions — we ensure they land."
                    </motion.p>
                </div>
            </section>
        </>
    )
}