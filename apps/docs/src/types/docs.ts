export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavItemWithChildren extends NavItem {
  items?: NavItemWithChildren[];
  dot?: boolean
}

export interface SidebarNavGroup {
  title: string;
  items: NavItemWithChildren[];
}

export interface DocsConfig {
  mainNav: NavItem[];
  sidebarNav: SidebarNavGroup[];
}

export interface TocEntry {
  title: string;
  url: string;
  depth: number;
  items?: TocEntry[];
}

export interface DocFrontmatter {
  title: string;
  description?: string;
  published?: boolean;
  links?: {
    doc?: string;
    api?: string;
  };
  featured?: boolean;
  component?: boolean;
  toc?: boolean;
}

export interface DocPageProps {
  params: {
    slug?: string[];
  };
}

export interface DocsPageData {
  frontmatter: DocFrontmatter;
  content: React.ReactNode;
  toc?: TocEntry[];
  slug: string;
}
