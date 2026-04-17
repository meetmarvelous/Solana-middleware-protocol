import { useEffect, useState } from "react";

const DECODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

export function DecoderText({ text, isHovered }: { text: string; isHovered: boolean }) {
    const [displayText, setDisplayText] = useState(text);

    useEffect(() => {
        if (!isHovered) {
            setDisplayText(text);
            return;
        }

        let iteration = 0;
        const charsPerTick = Math.max(text.length / 20, 0.2);
        let interval: ReturnType<typeof setInterval>;

        const tick = () => {
            setDisplayText(() => {
                return text
                    .split("")
                    .map((char, index) => {
                        if (char === " ") return " ";
                        if (index < iteration) return text[index];
                        return DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
                    })
                    .join("");
            });

            if (iteration >= text.length) {
                clearInterval(interval);
            }
            iteration += charsPerTick;
        };

        interval = setInterval(tick, 30);
        return () => clearInterval(interval);
    }, [isHovered, text]);

    return (
        <span className="relative inline-flex flex-col items-center justify-center">
            <span className={isHovered ? "opacity-0 pointer-events-none whitespace-pre" : "whitespace-pre"}>{text}</span>
            {isHovered && (
                <span className="absolute w-full font-mono tracking-tighter flex items-center justify-center whitespace-pre text-[11px] text-center">
                    {displayText}
                </span>
            )}
        </span>
    );
}