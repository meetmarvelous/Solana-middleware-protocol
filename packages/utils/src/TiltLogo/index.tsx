import { useRef } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion"
import { Icons } from "../Icons";

export function TiltLogo() {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-20, 20], [10, -10]), { stiffness: 250, damping: 28 });
    const rotateY = useSpring(useTransform(x, [-20, 20], [-10, 10]), { stiffness: 250, damping: 28 });

    return (
        <motion.div
            ref={ref}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={e => {
                if (!ref.current) return;
                const r = ref.current.getBoundingClientRect();
                x.set(e.clientX - r.left - r.width / 2);
                y.set(e.clientY - r.top - r.height / 2);
            }}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className="flex items-center cursor-default select-none"
        >
            <Icons.Logo />
            <span className="-ml-3 font-semibold text-[13.5px] tracking-wide text-white/90">Sendra</span>
        </motion.div>
    );
}