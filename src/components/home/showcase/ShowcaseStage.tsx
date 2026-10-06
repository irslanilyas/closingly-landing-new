"use client";

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { PlayingContext } from "./art/scene";
import styles from "./Showcase.module.css";

export type Feature = {
  id: string;
  label: string;
  copy: ReactNode;
  art: ReactNode;
  /** The illustration is dozens of decorative fragments; this describes it once. */
  artLabel: string;
};

/** Art designed at this size; below 1001px it is zoomed to fit. */
const ART_WIDTH = 637;
const ART_HEIGHT = 519;
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Six features on one sticky stage. The heading, tab bar and active panel stay
 * pinned while the page scrolls one stretch per feature, so scrolling stays
 * native for every input: trackpad, wheel, touch, keyboard and screen reader.
 */
export function ShowcaseStage({ heading, features }: { heading: ReactNode; features: Feature[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [seen, setSeen] = useState(false);
  // The panel fading out keeps its story running until it is gone, so it never snaps.
  const [leaving, setLeaving] = useState(-1);
  const leaveTimer = useRef(0);

  // Scroll geometry, kept out of React state: it changes on every resize.
  const geo = useRef({ step: 360, start: 0, enabled: true });
  const activeRef = useRef(0);
  const pending = useRef({ index: -1, timer: 0 });

  const select = useCallback((index: number) => {
    if (index === activeRef.current) return;
    setDirection(index < activeRef.current ? -1 : 1);
    setLeaving(activeRef.current);
    clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setLeaving(-1), 600);
    activeRef.current = index;
    setActive(index);
  }, []);

  // Highlight and progress follow the active tab; the tab bar scrolls it into view on small screens.
  const placeBars = useCallback((index: number, centre: boolean) => {
    const tab = tabRefs.current[index];
    const scroller = scrollerRef.current;
    if (!tab || !scroller) return;
    // Both bars are 100px wide in CSS and scaled here, so they glide on the compositor.
    highlightRef.current!.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth / 100})`;
    progressRef.current!.style.transform = `scaleX(${(tab.offsetLeft + tab.offsetWidth) / 100})`;
    if (centre && scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollTo({
        left: tab.offsetLeft - (scroller.clientWidth - tab.offsetWidth) / 2,
        behavior: reduceMotion() ? "auto" : "smooth",
      });
    }
  }, []);

  useLayoutEffect(() => placeBars(active, true), [active, placeBars]);

  // Numbers in the active panel count up as its story plays.
  useLayoutEffect(() => {
    const panel = panelRefs.current[active];
    if (!seen || !panel || reduceMotion()) return;
    const frames: number[] = [];
    panel.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const delay = Number(el.dataset.countDelay ?? 0);
      const duration = Number(el.dataset.countDuration ?? 900);
      const format = (n: number) => `${el.dataset.prefix ?? ""}${Math.round(n).toLocaleString("en-US")}`;
      el.textContent = format(0);
      let t0 = 0;
      const tick = (now: number) => {
        t0 ||= now + delay;
        const t = Math.min(1, Math.max(0, (now - t0) / duration));
        el.textContent = format(target * (1 - (1 - t) ** 3));
        if (t < 1) frames.push(requestAnimationFrame(tick));
      };
      frames.push(requestAnimationFrame(tick));
    });
    return () => {
      frames.forEach(cancelAnimationFrame);
      panel.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        el.textContent = `${el.dataset.prefix ?? ""}${Number(el.dataset.count).toLocaleString("en-US")}`;
      });
    };
  }, [active, seen]);

  // A layout effect: the showcase reaches its full height before the first paint,
  // so a restored scroll position lands where the reader left it.
  useLayoutEffect(() => {
    const root = rootRef.current!;
    const stage = stageRef.current!;
    const scroller = scrollerRef.current!;
    const host = panelsRef.current!;
    const panels = panelRefs.current.filter(Boolean) as HTMLElement[];
    const glide = pending.current;
    let frame = 0;

    const update = () => {
      frame = 0;
      const { step, start, enabled } = geo.current;
      if (!enabled) return;
      if (pending.current.index !== -1) {
        // A tab glide is under way: settle once the page has been still for a moment.
        clearTimeout(pending.current.timer);
        pending.current.timer = window.setTimeout(settle, 140);
        return;
      }
      const index = Math.max(0, Math.min(panels.length - 1, Math.floor((scrollY - start) / step)));
      select(index);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const settle = () => {
      clearTimeout(pending.current.timer);
      pending.current.index = -1;
      queue();
    };

    // The viewport height without the browser's collapsing toolbars: stable while
    // Safari and Chrome slide their address bars in and out during a scroll.
    let lastWidth = 0;
    let lastHeight = 0;
    const size = () => {
      const viewHeight = document.documentElement.clientHeight;
      lastWidth = innerWidth;
      lastHeight = viewHeight;
      // Each feature gets about half a screen of scroll: enough to read on a
      // trackpad flick, short enough that a mouse wheel isn't a chore.
      const step = Math.round(Math.min(520, Math.max(360, viewHeight * 0.55)));
      const compact = innerWidth <= 1000;
      const enabled = !(compact && viewHeight < 600);
      host.dataset.measuring = "";
      const scale = root.getBoundingClientRect().width / root.offsetWidth || 1;
      const copies = panels.map((p) => p.querySelector<HTMLElement>("[data-copy]")!);
      const copyHeight = Math.max(...copies.map((c) => c.getBoundingClientRect().height / scale));
      const headingHeight = stage.firstElementChild!.getBoundingClientRect().height / scale;
      const tabsHeight = scroller.getBoundingClientRect().height / scale;
      const fitWidth = root.clientWidth / ART_WIDTH;
      const artScale = !compact
        ? 1
        : enabled
          ? Math.min(fitWidth, Math.max(120, viewHeight / scale - headingHeight - tabsHeight - copyHeight) / ART_HEIGHT)
          : fitWidth;
      root.style.setProperty("--art-zoom", compact ? String(artScale) : "1");
      host.style.height = `${compact ? copyHeight + ART_HEIGHT * artScale : ART_HEIGHT}px`;
      delete host.dataset.measuring;
      const stageHeight = stage.getBoundingClientRect().height;
      root.style.height = `${(stageHeight + (enabled ? step * panels.length : 0)) / scale}px`;
      geo.current = { step, start: root.getBoundingClientRect().top + scrollY, enabled };
      placeBars(activeRef.current, false);
      queue();
    };

    let resizeFrame = 0;
    const onResize = () => {
      if (innerWidth === lastWidth && document.documentElement.clientHeight === lastHeight) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(size);
    };
    // The reader's own input always wins over a tab glide in progress.
    const onInput = () => {
      if (pending.current.index !== -1) settle();
    };
    const onKey = (e: KeyboardEvent) => {
      if (pending.current.index !== -1 && !e.defaultPrevented && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) settle();
    };

    // The story plays the first time the showcase comes into view, not off screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        // Hidden panels never lazy-load on their own; fetch their art now so a tab switch never shows a gap.
        host.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = "eager"));
        io.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );

    size();
    document.fonts.ready.then(() => requestAnimationFrame(size));
    io.observe(host);
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("wheel", onInput, { passive: true });
    addEventListener("touchstart", onInput, { passive: true });
    addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      clearTimeout(glide.timer);
      removeEventListener("scroll", queue);
      removeEventListener("resize", onResize);
      removeEventListener("wheel", onInput);
      removeEventListener("touchstart", onInput);
      removeEventListener("keydown", onKey);
    };
  }, [select, placeBars]);

  // A tab glides the page to that feature's own stretch of the showcase, so the
  // panel on screen and the scroll position never disagree.
  const jump = (index: number, focus = false) => {
    if (focus) tabRefs.current[index]?.focus({ preventScroll: true });
    select(index);
    track("select_content", { content_type: "feature", content_id: features[index].label });
    const { start, step, enabled } = geo.current;
    if (!enabled) return;
    pending.current.index = index;
    clearTimeout(pending.current.timer);
    pending.current.timer = window.setTimeout(() => {
      pending.current.index = -1;
    }, 1200);
    scrollTo({ top: Math.ceil(start + index * step) + 2 });
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const n = features.length;
    const next = { ArrowRight: (i + 1) % n, ArrowLeft: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    jump(next, true);
  };

  return (
    <div ref={rootRef} className={styles.showcase} data-seen={seen ? "" : undefined}>
      <div ref={stageRef} className={styles.stage}>
        {heading}
        <div ref={scrollerRef} className={styles.tabs}>
          <div className={styles.track} role="tablist" aria-label="Workspace features">
            <span ref={highlightRef} className={styles.highlight} aria-hidden="true" />
            <span ref={progressRef} className={styles.progress} aria-hidden="true" />
            {features.map((f, i) => (
              <button
                key={f.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`feature-tab-${i}`}
                aria-controls={f.id}
                aria-selected={i === active}
                tabIndex={i === active ? 0 : -1}
                onClick={() => jump(i)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div ref={panelsRef} className={styles.panels} style={{ "--dir": direction } as React.CSSProperties}>
          {features.map((f, i) => (
            <section
              key={f.id}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              id={f.id}
              className={styles.panel}
              role="tabpanel"
              aria-labelledby={`feature-tab-${i}`}
              data-active={i === active ? "" : undefined}
              data-leaving={i === leaving ? "" : undefined}
              aria-hidden={i !== active}
              inert={i !== active}
            >
              <div className={styles.copy} data-copy="">
                {f.copy}
              </div>
              <div className={styles.art} role="img" aria-label={f.artLabel}>
                <div className={styles.canvas}>
                  <PlayingContext.Provider value={seen && (i === active || i === leaving)}>{f.art}</PlayingContext.Provider>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
