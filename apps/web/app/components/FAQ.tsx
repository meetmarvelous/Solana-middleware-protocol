import { Divider } from "@repo/utils";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { faqData } from "@repo/config";

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="relative z-10">
            <Divider />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <h2 className="text-3xl md:text-[42px] font-light text-white text-center mb-16 tracking-tight">
                    Frequently Asked Questions
                </h2>

                <div className="border-t border-white/[0.06]">
                    {faqData.map((item, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <motion.div
                                key={i}
                                initial={false}
                                className="border-b border-white/[0.06]"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    className="w-full flex items-center gap-4 py-5 text-left group"
                                >
                                    {/* Number */}
                                    <span className="text-[13px] font-mono text-white/20 flex-shrink-0 w-16 text-center">
                                        / {String(i + 1).padStart(2, "0")} /
                                    </span>

                                    {/* Question */}
                                    <span className="flex-1 text-[14px] text-white/80 font-medium">
                                        {item.q}
                                    </span>

                                    {/* Toggle icon */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}>
                                        <motion.span
                                            animate={{ rotate: isOpen ? 45 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-white/40 text-[16px] leading-none"
                                        >
                                            +
                                        </motion.span>
                                    </div>
                                </button>

                                {/* Answer */}
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-5 pl-16 pr-12">
                                                <p className="text-[13px] leading-relaxed text-white/35">
                                                    {item.a}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}