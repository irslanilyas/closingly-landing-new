"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The page's ambient motion, in one observer pass:
 *   [data-reveal]        rises into place the first time it scrolls into view
 *   [data-motion]        gets data-paused while off screen, so loops stop costing frames
 *   [data-inview-play]   videos play only while on screen
 * Content below the fold is hidden only once this has run, so nothing depends on it to be seen.
 * It runs again on every page the visitor moves to, so coming back to a page brings its videos back to life.
 */
export function PageMotion() {
  const path = usePathname();
  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observers: IntersectionObserver[] = [];

    if (!still) {
      const reveal = new IntersectionObserver(
        (entries) => {
          for (const { target, isIntersecting } of entries) {
            if (!isIntersecting) continue;
            target.removeAttribute("data-pending");
            target.setAttribute("data-revealed", "");
            reveal.unobserve(target);
          }
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
      observers.push(reveal);
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        // Anything already on screen stays put; only what is still ahead waits to rise.
        if (el.getBoundingClientRect().top < innerHeight) {
          el.setAttribute("data-revealed", "");
          return;
        }
        el.setAttribute("data-pending", "");
        reveal.observe(el);
      });
    }

    const visibility = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (target instanceof HTMLVideoElement) {
            if (isIntersecting && !still) target.play().catch(() => {});
            else target.pause();
          } else {
            target.toggleAttribute("data-paused", !isIntersecting);
          }
        }
      },
      { rootMargin: "200px" },
    );
    observers.push(visibility);
    document.querySelectorAll("[data-motion], video[data-inview-play]").forEach((el) => visibility.observe(el));

    return () => observers.forEach((o) => o.disconnect());
  }, [path]);

  return null;
}
