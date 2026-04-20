"use client";

import * as React from "react";

export function useScrollSpy(
  selector: string,
  options?: IntersectionObserverInit
): string {
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (elements.length === 0) return;

    const ids = Array.from(elements)
      .filter((el) => el.id)
      .map((el) => el.id);

    const visibleMap: Record<string, boolean> = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleMap[entry.target.id] = entry.isIntersecting;
        });

        const firstVisible = ids.find((id) => visibleMap[id]);
        if (firstVisible) {
          setActiveId(firstVisible);
        }
      },
      {
        rootMargin: options?.rootMargin ?? "0% 0% -70% 0%",
        threshold: options?.threshold ?? 0,
        ...options,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, options?.rootMargin]);

  return activeId;
}
