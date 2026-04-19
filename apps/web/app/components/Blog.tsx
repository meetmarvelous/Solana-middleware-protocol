import { Divider } from "@repo/utils";
import { motion } from "framer-motion";

export default function Blog() {
    return (
        <>
            <section className="relative z-10">
                <Divider />
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 lg:gap-16">
                        <div>
                            <div className="inline-block px-3 py-1 rounded border border-white/[0.08] text-[11px] font-mono text-white/30 tracking-wider mb-6">
                                Our Blog
                            </div>
                            <h2 className="text-3xl md:text-[38px] font-light text-white leading-[1.15]">
                                Insights from the<br />Solana infrastructure<br />frontlines
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    tag: "Engineering",
                                    title: "How Sendra achieves 99.8% transaction success rate",
                                    desc: "A deep dive into our simulation engine, fee optimizer, and smart retry system that ensures every Solana transaction lands.",
                                    date: "Apr 10, 2026",
                                },
                                {
                                    tag: "Announcement",
                                    title: "Sendra SDK v2.1 — Open Beta Launch",
                                    desc: "We're opening Sendra to all Solana developers. Drop-in SDK, zero infra changes, and full transaction lifecycle control.",
                                    date: "Mar 28, 2026",
                                },
                            ].map((post, i) => (
                                <motion.div
                                    key={post.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer"
                                    style={{
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        background: "linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 100%)",
                                    }}
                                >
                                    <div className="relative w-full h-52 overflow-hidden">
                                        <img
                                            src="/hero_bg.jpg"
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            style={{ filter: "brightness(0.55) saturate(0.8)" }}
                                        />
                                        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
                                    </div>

                                    <div className="flex flex-col flex-1 p-6">
                                        <div className="inline-block self-start px-2.5 py-1 rounded border border-white/[0.08] text-[10px] font-mono text-white/35 tracking-wider mb-4">
                                            {post.tag}
                                        </div>
                                        <h3 className="text-[16px] font-semibold text-white mb-2.5 leading-snug group-hover:text-white/90 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-[12.5px] leading-relaxed text-white/35 mb-5 flex-1">
                                            {post.desc}
                                        </p>
                                        <span className="text-[11px] font-mono text-white/20 tracking-wide">
                                            {post.date}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}