import { docsConfig } from "@/lib/docs-config";
import type { DocFrontmatter, TocEntry } from "@/types/docs";
import fs from "fs";
import path from "path";

interface DocData {
  frontmatter: DocFrontmatter;
  content: string;
  toc: TocEntry[];
  slug: string;
}

function markdownToHtml(markdown: string): string {
  let html = markdown;

  const codeBlocks: string[] = [];
  html = html.replace(/```(typescript|tsx|bash|env|json|rust|python|go)?\n([\s\S]*?)```/gm, (_, lang, code) => {
    const placeholder = `CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}`;
    const escapedCode = code.trim().replace(/'/g, "&apos;");

    if (lang === 'bash') {
      const isMulti = code.trim().startsWith("[multi]");
      const commandMap = isMulti
        ? {
          pnpm: code.trim().split("\n")[1] || "",
          npm: code.trim().split("\n")[2] || "",
          yarn: code.trim().split("\n")[3] || "",
          bun: code.trim().split("\n")[4] || ""
        }
        : { pnpm: code.trim() };

      codeBlocks.push(`@@@COMMAND_BLOCK:${JSON.stringify(commandMap)}@@@`);
    } else {
      codeBlocks.push(`@@@CODE_BLOCK:${lang || 'text'}:${Buffer.from(code.trim()).toString('base64')}@@@`);
    }
    return placeholder;
  });

  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/^##\s+(.+)$/gm, (_, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `<h2 id="${id}">${title}</h2>`;
  });
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");

  const lines = html.split('\n');
  const resultLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listMatch = line.match(/^(\s*)\-\s+(.+)$/);

    if (listMatch) {
      if (!inList) {
        resultLines.push('<ul>');
        inList = true;
      }

      let itemContent = listMatch[2];


      while (i + 1 < lines.length &&
        lines[i + 1].trim() !== "" &&
        !lines[i + 1].match(/^(\s*)\-\s+/) &&
        !lines[i + 1].startsWith('#')) {
        itemContent += ' ' + lines[i + 1].trim();
        i++;
      }

      resultLines.push(`<li>${itemContent}</li>`);
    } else {
      if (inList && line.trim() === "") {
        resultLines.push('</ul>');
        inList = false;
      }
      resultLines.push(line);
    }
  }
  if (inList) resultLines.push('</ul>');
  html = resultLines.join('\n');

  html = html.replace(/^\>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  html = html.split(/\n\n+/).map(block => {
    block = block.trim();
    if (!block) return "";


    if (block.startsWith("<h") ||
      block.startsWith("<ul") ||
      block.startsWith("<pre") ||
      block.startsWith("<blockquote") ||
      block.startsWith("CODE_BLOCK_PLACEHOLDER")) {
      return block;
    }

    return `<p>${block.replace(/\n/g, " ")}</p>`;
  }).join("\n\n");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  codeBlocks.forEach((block, i) => {
    html = html.replace(`CODE_BLOCK_PLACEHOLDER_${i}`, block);
  });

  return html;
}

export function getDocBySlug(slug: string): DocData | null {
  const allItems = docsConfig.sidebarNav.flatMap((group) => group.items);

  const navItem = allItems.find((item) => {
    const itemSlug = item.href?.replace(/^\/docs\/?/, "") ?? "";
    return itemSlug === slug || (slug === "" && (item.href === "/docs" || itemSlug === "getting-started"));
  });

  if (!navItem) return null;

  const filePathSlug = slug === "" ? "getting-started" : slug;
  const contentPath = path.join(process.cwd(), "content", `${filePathSlug}.md`);

  let rawContent = "";
  try {
    rawContent = fs.readFileSync(contentPath, "utf-8");
  } catch (error) {
    rawContent = `<h1>${navItem.title}</h1><p>Content for ${navItem.title} is coming soon.</p>`;
  }

  const toc: TocEntry[] = [];
  const headingRegex = /^##\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(rawContent)) !== null) {
    const title = match[1];
    const url = `#${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    toc.push({ title, url, depth: 2 });
  }

  const htmlContent = markdownToHtml(rawContent);

  return {
    slug,
    frontmatter: {
      title: navItem.title,
      description: `Detailed infrastructure guide for Sendra ${navItem.title}`,
      published: true,
      toc: true,
    },
    toc: toc.length > 0 ? toc : [{ title: "Overview", url: "#overview", depth: 2 }],
    content: htmlContent,
  };
}

export function getAdjacentDocs(currentSlug: string): {
  prev: { title: string; href: string } | undefined;
  next: { title: string; href: string } | undefined;
} {
  const allItems = docsConfig.sidebarNav.flatMap((group) => group.items);
  const itemsWithHref = allItems.filter((item) => item.href);

  const currentIndex = itemsWithHref.findIndex((item) => {
    const itemSlug = item.href?.replace(/^\/docs\/?/, "") ?? "";
    return (itemSlug === currentSlug) || (currentSlug === "" && item.href === "/docs");
  });

  if (currentIndex === -1) return { prev: undefined, next: undefined };

  const prevItem = currentIndex > 0 ? itemsWithHref[currentIndex - 1] : undefined;
  const nextItem =
    currentIndex < itemsWithHref.length - 1
      ? itemsWithHref[currentIndex + 1]
      : undefined;

  return {
    prev: prevItem?.href ? { title: prevItem.title, href: prevItem.href } : undefined,
    next: nextItem?.href ? { title: nextItem.title, href: nextItem.href } : undefined,
  };
}
