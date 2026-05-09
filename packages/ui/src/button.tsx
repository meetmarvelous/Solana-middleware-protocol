"use client";

import { ReactNode, useState } from "react";
import { motion } from "framer-motion"
import { DecoderText } from "@repo/utils";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName?: string;
  size: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-3 text-[13px]",
  lg: "px-8 py-4 text-[15px]",
};

export const Button = ({ children, className, appName, size }: ButtonProps) => {
  return (
    <button
      className={`${sizeClasses[size]} ${className || ""}`}
      onClick={() => appName && alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
};

export function PrimaryButton({ children, size, className = "" }: { children: string; size: ButtonSize; className?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={`relative group ${sizeClasses[size]} bg-white text-black font-semibold tracking-wide rounded hover:bg-white/90 transition-colors uppercase overflow-hidden ${className}`}
    >
      <div className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out" />
      <span className="relative z-10 flex items-center justify-center whitespace-nowrap">
        <DecoderText text={children} isHovered={isHovered} />
      </span>
    </motion.button>
  );
}

export function GhostButton({ children, size, className = "" }: { children: string; size: ButtonSize; className?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={`relative group ${sizeClasses[size]} bg-white/5 text-white/90 font-semibold tracking-wide rounded hover:bg-white/10 border border-white/10 transition-colors uppercase overflow-hidden ${className}`}
    >
      <div className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-[150%] transition-all duration-700 ease-in-out" />
      <span className="relative z-10 flex items-center justify-center whitespace-nowrap">
        <DecoderText text={children} isHovered={isHovered} />
      </span>
    </motion.button>
  );
}