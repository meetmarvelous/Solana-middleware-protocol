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
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-sm mb-8"
                        style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(0, 0, 0, 0.2)" }}
                    >
                        <span className="text-[8px] font-medium text-white/70 tracking-wide leading-none uppercase">Built for</span>
                        <motion.img
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                            src="/solanaLogo.svg"
                            alt="Solana Logo"
                            className="h-[14px] w-auto relative top-[1px]"
                        />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="text-[60px] md:text-[84px] font-semibold leading-[1.05] tracking-tight max-w-5xl mx-auto mb-6 text-white"
                    >
                        Transactions that don't fail
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.17 }}
                        className="text-white/60 text-[13px] md:text-[17px] max-w-[780px] mx-auto leading-[1.6] mb-10 font-medium"
                    >
                        <span className="text-[15px] font-medium text-white tracking-wide leading-none uppercase">Sendra ensures Solana transactions land reliably across varying network conditions. </span><br />
                        It is the execution layer that sits between your app and the blockchain network,
                        optimizing fees, routing RPCs, and retrying until your transaction succeeds.
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.27 }}
                        className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-20"
                    >
                        <Link href={process.env.NEXT_PUBLIC_PACKAGE_URL || "https://www.npmjs.com/package/sendra-tx"}>
                            <PrimaryButton size="md">TRY SDK</PrimaryButton>
                        </Link>
                        <Link href="https://mail.google.com/mail/?view=cm&fs=1&to=sarthakkarodework@gmail.com&su=booking%20sendra" target="_blank" rel="noopener noreferrer"><GhostButton size="md">BOOK A DEMO</GhostButton></Link>
                    </motion.div>

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