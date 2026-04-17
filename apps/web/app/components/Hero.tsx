"use client"

import { motion } from "framer-motion";
import { CodeSnippetTabs } from "./CodeSnippetTabs";
import Link from "next/link";
import { PrimaryButton, GhostButton } from "@repo/ui/button";

export default function Hero({ heroRef, heroY, heroOpacity }: { heroRef: any, heroY: any, heroOpacity: any }) {
    return (
        <>
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
                            <PrimaryButton>START FOR FREE</PrimaryButton>
                        </Link>
                        <GhostButton>BOOK A DEMO</GhostButton>
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
        </>
    )
}