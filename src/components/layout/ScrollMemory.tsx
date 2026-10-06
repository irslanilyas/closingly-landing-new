"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

const KEY = "closingly:scroll";

function read(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

let popped = false;
let firstPage = true;

/**
 * Back and forward land exactly where the reader left the page, in one jump.
 * The browser's own restoration runs before the page has rendered its full
 * height (and the page scrolls smoothly), so it would start at the top and
 * glide down. This restores after the page's own layout effects, before paint.
 */
export function ScrollMemory() {
  const path = usePathname();

  useEffect(() => {
    history.scrollRestoration = "manual";
    const onPop = () => {
      popped = true;
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    const type = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
    const restore = popped || (firstPage && (type === "reload" || type === "back_forward"));
    popped = false;
    firstPage = false;
    const y = read()[path];
    if (restore && y) window.scrollTo({ top: y, behavior: "instant" });
  }, [path]);

  // Positions are noted on every scroll and written out shortly after, and once more on
  // the way out: the last noted position is the one the reader saw, before any clamping.
  useEffect(() => {
    const positions = read();
    let timer = 0;
    const write = () => {
      clearTimeout(timer);
      timer = 0;
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ ...read(), [path]: positions[path] ?? 0 }));
      } catch {}
    };
    const onScroll = () => {
      positions[path] = Math.round(scrollY);
      if (!timer) timer = window.setTimeout(write, 200);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pagehide", write);
    return () => {
      if (timer) write();
      removeEventListener("scroll", onScroll);
      removeEventListener("pagehide", write);
    };
  }, [path]);

  return null;
}
