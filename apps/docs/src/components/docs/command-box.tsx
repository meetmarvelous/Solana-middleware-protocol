"use client";

import * as React from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandBoxProps {
  command: {
    pnpm?: string;
    npm?: string;
    yarn?: string;
    bun?: string;
  } | string;
}

export function CommandBox({ command }: CommandBoxProps) {
  const [activeTab, setActiveTab] = React.useState<"pnpm" | "npm" | "yarn" | "bun">("pnpm");
  const [copied, setCopied] = React.useState(false);

  const isMulti = typeof command !== "string" && (command.npm || command.yarn || command.bun);
  const currentCommand = isMulti ? (command as any)[activeTab] : (typeof command === "string" ? command : command.pnpm);

  const handleCopy = () => {
    if (!currentCommand) return;
    navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 w-full overflow-hidden rounded-xl border border-white/2 bg-transparent shadow-xl">
      <div className="flex items-center justify-between border-b border-white/2 px-3 py-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-white/5">
            <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          {isMulti ? (
            <div className="flex gap-1">
              {(["pnpm", "npm", "yarn", "bun"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
                    activeTab === tab
                      ? "bg-white text-black"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">Terminal</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="rounded-md p-1.5 text-zinc-500 transition-all hover:bg-white/5 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="p-5">
        <code className="text-[13px] font-mono whitespace-pre-wrap break-words !bg-transparent !p-0 block text-zinc-300">
          <span className="text-zinc-500 mr-2">$</span>
          {currentCommand}
        </code>
      </div>
    </div>
  );
}
