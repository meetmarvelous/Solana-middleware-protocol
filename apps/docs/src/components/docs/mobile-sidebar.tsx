"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SidebarNavGroup, NavItemWithChildren } from "@/types/docs";

interface MobileSidebarProps {
  items: SidebarNavGroup[];
}

export function MobileSidebar({ items }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[300px] sm:w-[340px]">
        <SheetHeader className="px-6">
          <SheetTitle className="text-left">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="h-6 w-6"
              >
                <rect width="256" height="256" fill="none" />
                <line
                  x1="208"
                  y1="128"
                  x2="128"
                  y2="208"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                />
                <line
                  x1="192"
                  y1="40"
                  x2="40"
                  y2="192"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                />
              </svg>
              <span className="font-bold">shadcn/ui</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-3 px-6">
            {items.map((group, groupIdx) => (
              <div key={groupIdx} className="flex flex-col space-y-2 pt-4">
                <h4 className="font-semibold text-sm">{group.title}</h4>
                <div className="grid grid-flow-row auto-rows-max text-sm">
                  {group.items.map((item, itemIdx) => (
                    <MobileSidebarItem
                      key={itemIdx}
                      item={item}
                      pathname={pathname}
                      onSelect={() => setOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileSidebarItemProps {
  item: NavItemWithChildren;
  pathname: string | null;
  onSelect: () => void;
  depth?: number;
}

function MobileSidebarItem({
  item,
  pathname,
  onSelect,
  depth = 0,
}: MobileSidebarItemProps) {
  const isActive = item.href === pathname;

  if (!item.href) {
    return (
      <span
        className={cn(
          "py-1 text-muted-foreground opacity-60",
          depth > 0 && "pl-4"
        )}
      >
        {item.title}
      </span>
    );
  }

  return (
    <>
      <Link
        href={item.href}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center py-1 text-sm transition-colors",
          depth > 0 && "pl-4",
          isActive
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {item.title}
        {item.label && (
          <span
            className={cn(
              "ml-2 rounded-md px-1.5 py-0.5 text-xs leading-none",
              item.label === "New"
                ? "bg-[#adfa1d] text-[#000000]"
                : "bg-muted text-muted-foreground"
            )}
          >
            {item.label}
          </span>
        )}
      </Link>
      {item.items?.map((sub, subIdx) => (
        <MobileSidebarItem
          key={subIdx}
          item={sub}
          pathname={pathname}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </>
  );
}
