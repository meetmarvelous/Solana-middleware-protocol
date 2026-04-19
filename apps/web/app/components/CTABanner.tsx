import { Divider } from "@repo/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CTABanner() {
    return (
        <>
            <section className="relative z-10">
                <Divider />
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-2xl overflow-hidden"
                        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                        <div className="absolute inset-0">
                            <img
                                src="/hero_bg.jpg"
                                alt=""
                                className="w-full h-full object-cover"
                                style={{ filter: "blur(30px) brightness(0.5) saturate(0.7)" }}
                            />
                            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 md:py-28">
                            <h2 className="text-3xl md:text-[42px] font-light text-white mb-8 leading-tight tracking-tight">
                                Ready to stop losing transactions?
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Link href="/demo">
                                    <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-7 py-3 bg-white text-black font-semibold text-[12px] tracking-[0.12em] uppercase rounded hover:bg-white/90 transition-colors"
                                    >
                                        Start Building
                                    </motion.button>
                                </Link>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-7 py-3 text-white/80 font-semibold text-[12px] tracking-[0.12em] uppercase rounded transition-colors hover:text-white"
                                    style={{
                                        background: "rgba(255,255,255,0.08)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                    }}
                                >
                                    Book a Call
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}