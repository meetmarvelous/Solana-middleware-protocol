"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CommandBox } from "@/components/docs/command-box";
import { CodeSnippet } from "@/components/docs/code-snippet";
import { CodeSnippetTabs } from "@/components/docs/code-snippet-tabs";
import type { DocFrontmatter } from "@/types/docs";

interface DocsContentProps {
  content: string;
  frontmatter?: DocFrontmatter;
  className?: string;
}

export function DocsContent({
  content,
  frontmatter,
  className,
}: DocsContentProps) {

  const parts = React.useMemo(() => {
    if (typeof content !== "string") return [content];

    return content.split(/(@@@[A-Z_]+:.*?@@@)/g).filter(Boolean);
  }, [content]);

  const renderPart = (part: string, index: number) => {

    if (part.startsWith("@@@COMMAND_BLOCK:")) {
      try {
        const data = part.replace("@@@COMMAND_BLOCK:", "").replace("@@@", "");
        const commands = JSON.parse(data);
        return <CommandBox key={index} command={commands} />;
      } catch (e) {
        console.error("Failed to parse command block", e);
        return null;
      }
    }


    if (part.startsWith("@@@CODE_BLOCK:")) {
      try {
        const data = part.replace("@@@CODE_BLOCK:", "").replace("@@@", "");
        const [lang, base64Code] = data.split(":");
        const code = atob(base64Code);
        return <CodeSnippet key={index} code={code} language={lang} />;
      } catch (e) {
        console.error("Failed to parse code block", e);
        return null;
      }
    }


    if (part.startsWith("@@@CODE_TABS@@@")) {
      return <CodeSnippetTabs key={index} />;
    }


    return (
      <div
        key={index}
        dangerouslySetInnerHTML={{ __html: part }}
      />
    );
  };

  return (
    <div className={cn("docs-content", className)}>
      {frontmatter && (
        <div className="mb-6 space-y-2">
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight text-white dark:text-white">
            {frontmatter.title}
          </h1>
          {frontmatter.description && (
            <p className="text-base text-zinc-500 max-w-[700px] leading-relaxed">
              {frontmatter.description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {parts.map((part, i) => renderPart(part as string, i))}
      </div>
    </div>
  );
}
