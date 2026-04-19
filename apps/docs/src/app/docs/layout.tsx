import { DocsHeader } from "@/components/layout/docs-header";
import { SidebarNav } from "@/components/docs/sidebar-nav";
import { ScrollProgress } from "@/components/docs/scroll-progress";
import { docsConfig } from "@/lib/docs-config";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollProgress />
      <DocsHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="relative h-full overflow-hidden py-6 pr-6 lg:py-8">
            <SidebarNav items={docsConfig.sidebarNav} />
          </div>
        </aside>

        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid">
          {children}
        </main>
      </div>
    </div>
  );
}
