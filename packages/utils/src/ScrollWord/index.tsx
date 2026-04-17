import { useTransform, motion } from "framer-motion";

export function ScrollWord({ word, progress, start, end }: {
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