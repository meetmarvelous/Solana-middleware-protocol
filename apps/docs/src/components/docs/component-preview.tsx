"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/docs/copy-button";

interface ComponentPreviewProps {
  children?: React.ReactNode;
  code?: string;
  language?: string;
  className?: string;
  align?: "center" | "start" | "end";
}

export function ComponentPreview({
  children,
  code,
  language = "tsx",
  className,
  align = "center",
}: ComponentPreviewProps) {
  const [activeTab, setActiveTab] = React.useState<"preview" | "code">(
    "preview"
  );

  return (
    <div className={cn("group my-6 overflow-hidden rounded-lg border", className)}>
      <div className="flex items-center border-b bg-muted/50 px-4">
        <button
          onClick={() => setActiveTab("preview")}
          className={cn(
            "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            activeTab === "preview"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Preview
        </button>
        {code && (
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              activeTab === "code"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Code
          </button>
        )}
      </div>

      {activeTab === "preview" && (
        <div
          className={cn(
            "flex min-h-[200px] items-center p-8",
            align === "center" && "justify-center",
            align === "start" && "justify-start",
            align === "end" && "justify-end"
          )}
        >
          {children}
        </div>
      )}

      {activeTab === "code" && code && (
        <div className="relative">
          <pre className="overflow-x-auto rounded-none border-0 bg-zinc-950 p-4 text-sm">
            <code className="text-zinc-50 font-mono text-sm leading-relaxed">
              {code}
            </code>
          </pre>
          <div className="absolute right-2 top-2">
            <CopyButton value={code} />
          </div>
        </div>
      )}
    </div>
  );
}
