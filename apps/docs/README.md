# `apps/docs` — shadcn/ui Docs Clone

A pixel-faithful recreation of [ui.shadcn.com/docs](https://ui.shadcn.com/docs) built with:

- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **next-themes** (dark mode)
- **Radix UI** primitives
- **Turborepo** monorepo compatible

---

## Folder Structure

```
apps/docs/
├── src/
│   ├── app/
│   │   ├── layout.tsx               ← Root layout (ThemeProvider, fonts)
│   │   ├── page.tsx                 ← Redirects / → /docs
│   │   ├── not-found.tsx            ← 404 page
│   │   └── docs/
│   │       ├── layout.tsx           ← Docs shell (header + sidebar grid)
│   │       ├── page.tsx             ← /docs index page
│   │       └── [...slug]/
│   │           └── page.tsx         ← Dynamic /docs/[...slug] page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── docs-header.tsx      ← Sticky navbar (logo, nav, search, theme)
│   │   │   ├── theme-provider.tsx   ← next-themes wrapper
│   │   │   └── theme-toggle.tsx     ← Light/dark/system dropdown
│   │   │
│   │   ├── docs/
│   │   │   ├── sidebar-nav.tsx      ← Desktop collapsible sidebar (keyboard nav)
│   │   │   ├── mobile-sidebar.tsx   ← Mobile Sheet drawer sidebar
│   │   │   ├── table-of-contents.tsx← Sticky TOC with scroll spy
│   │   │   ├── docs-content.tsx     ← HTML/React content renderer + copy buttons
│   │   │   ├── docs-page-layout.tsx ← Per-page layout (content + TOC + pager)
│   │   │   ├── docs-pager.tsx       ← Prev/Next page navigation
│   │   │   ├── search-dialog.tsx    ← ⌘K command palette search
│   │   │   ├── scroll-progress.tsx  ← Top progress bar
│   │   │   ├── copy-button.tsx      ← Code block copy button
│   │   │   ├── callout.tsx          ← Info/warning/danger callout boxes
│   │   │   ├── steps.tsx            ← Numbered steps component
│   │   │   └── component-preview.tsx← Preview + Code tab viewer
│   │   │
│   │   └── ui/                      ← shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       ├── command.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── scroll-area.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       └── tooltip.tsx
│   │
│   ├── hooks/
│   │   ├── use-keyboard-nav.ts      ← Arrow-key sidebar navigation
│   │   ├── use-scroll-spy.ts        ← TOC heading intersection observer
│   │   └── use-mounted.ts           ← SSR hydration guard
│   │
│   ├── lib/
│   │   ├── utils.ts                 ← cn() helper
│   │   ├── docs-config.ts           ← All nav items (mainNav + sidebarNav)
│   │   └── docs.ts                  ← Content loader (stub — plug in your source)
│   │
│   ├── types/
│   │   └── docs.ts                  ← TypeScript interfaces
│   │
│   └── styles/
│       └── globals.css              ← CSS variables, prose overrides, code blocks
│
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── components.json                  ← shadcn/ui config
└── turbo.json
```

---

## Quick Start

### 1. Install dependencies

From your **monorepo root**:

```bash
pnpm install
# or
npm install
# or
yarn install
```

Or from `apps/docs` directly:

```bash
cd apps/docs
npm install
```

### 2. Run the dev server

From monorepo root (recommended):

```bash
turbo dev --filter=docs
```

Or from `apps/docs`:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### 3. Build for production

```bash
turbo build --filter=docs
# or
cd apps/docs && npm run build
```

---

## Plugging In Your Real Content

The content loader lives in `src/lib/docs.ts`. It exports two functions:

### `getDocBySlug(slug: string)`

Replace the stub body with your real content source:

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export function getDocBySlug(slug: string) {
  const filePath = path.join(process.cwd(), "content/docs", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);

  return { slug, frontmatter, content, toc: extractToc(content) };
}
```

```ts
import { allDocs } from "contentlayer/generated";

export function getDocBySlug(slug: string) {
  return allDocs.find((doc) => doc.slugAsParams === slug) ?? null;
}
```

```ts
export async function getDocBySlug(slug: string) {
  const data = await fetchFromCMS(slug);
  return data;
}
```

### `getAdjacentDocs(slug)`

Uses the sidebar nav config to derive prev/next. If your content order differs from the nav, replace with a content-source lookup.

---

## Feature Checklist

| Feature | Status |
|---|---|
| Sticky header with backdrop blur | ✅ |
| Logo + main nav links | ✅ |
| ⌘K search command palette | ✅ |
| GitHub + Twitter icon buttons | ✅ |
| Light / Dark / System theme toggle | ✅ |
| Desktop sidebar (sticky, scrollable) | ✅ |
| Sidebar collapsible groups | ✅ |
| Sidebar active state highlighting | ✅ |
| "New" label badges on nav items | ✅ |
| Mobile sidebar (Sheet drawer) | ✅ |
| Table of contents (right panel) | ✅ |
| TOC scroll spy (active highlight) | ✅ |
| TOC smooth scroll on click | ✅ |
| Scroll progress bar | ✅ |
| Copy button on code blocks | ✅ |
| Prev / Next page pager | ✅ |
| Keyboard nav in sidebar (↑↓ Home End) | ✅ |
| Callout component (info/warn/danger) | ✅ |
| Steps component | ✅ |
| Component preview + code tabs | ✅ |
| Dark mode (next-themes) | ✅ |
| Responsive (mobile/tablet/desktop) | ✅ |
| 404 page | ✅ |
| TypeScript throughout | ✅ |

---

## Monorepo Integration

### Root `package.json` — add docs to workspaces

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Root `turbo.json` — already handled by `apps/docs/turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

### Shared packages

If your monorepo has shared UI or config packages, reference them in `package.json`:

```json
{
  "dependencies": {
    "@your-org/ui": "workspace:*",
    "@your-org/config": "workspace:*"
  }
}
```

Then import from `@your-org/ui` in your components.

---

## Styling System

All colors use CSS custom properties defined in `globals.css`.

| Token | Light | Dark |
|---|---|---|
| `--background` | white | near-black |
| `--foreground` | near-black | near-white |
| `--muted` | light gray | dark gray |
| `--muted-foreground` | medium gray | medium gray |
| `--border` | light gray | dark gray |
| `--primary` | near-black | near-white |

Code blocks use `bg-zinc-950` with `text-zinc-50` for both themes.

---

## Adding shadcn/ui Components

```bash
cd apps/docs
npx shadcn@latest add accordion
npx shadcn@latest add tabs
# etc.
```

Components install to `src/components/ui/`.

---

## Environment Variables

No environment variables required for the UI shell.

If your content source requires them, add to `apps/docs/.env.local`:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_token
```
