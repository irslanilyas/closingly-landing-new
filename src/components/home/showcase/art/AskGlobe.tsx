"use client";

import { useContext, useEffect, useRef } from "react";
import { PlayingContext } from "./scene";
import s from "./AskGlobe.module.css";

/**
 * Ask Closingly's face: two eyes and a smile, nothing else.
 *
 *   follows   the eyes and mouth lean toward the pointer
 *   hover     the eyes close into happy arcs (CSS :hover)
 *   sad       the pointer left through the top of the page, or the tab was hidden;
 *             it droops until the pointer comes back
 *
 * One animation-frame loop eases the lean and stops as soon as it settles.
 */
export function AskGlobe() {
  const root = useRef<HTMLSpanElement>(null);
  const playing = useContext(PlayingContext);

  useEffect(() => {
    const el = root.current;
    if (!playing || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const face = el.querySelector<HTMLElement>("[data-face]")!;

    const target = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    let frame = 0;
    const draw = () => {
      look.x += (target.x - look.x) * 0.2;
      look.y += (target.y - look.y) * 0.2;
      face.style.transform = `translate(${(look.x * 4.5).toFixed(2)}px, ${(look.y * 3.5).toFixed(2)}px)`;
      frame = Math.abs(target.x - look.x) + Math.abs(target.y - look.y) > 0.004 ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (e: PointerEvent) => {
      el.dataset.mood = "idle";
      const box = el.getBoundingClientRect();
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 130);
      target.x = (dx / dist) * reach;
      target.y = (dy / dist) * reach;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    // Leaving through the top edge (toward the address bar or the tabs) makes it sad.
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 8) el.dataset.mood = "sad";
    };
    const onHidden = () => {
      if (document.hidden) el.dataset.mood = "sad";
    };

    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onHidden);
      cancelAnimationFrame(frame);
      el.dataset.mood = "idle";
      face.style.transform = "";
    };
  }, [playing]);

  return (
    <span ref={root} className={s.globe} data-mood="idle" aria-hidden="true">
      <span className={s.pop} data-part="orb">
        <span className={s.face} data-face="">
          {[0, 1].map((i) => (
            <span key={i} className={s.eye}>
              <span className={s.pill} />
              <svg className={s.arc} viewBox="0 0 10 6">
                <path d="M1.2 5C2.4 1.6 7.6 1.6 8.8 5" />
              </svg>
            </span>
          ))}
          <i className={s.tear} />
          <svg className={s.mouth} viewBox="0 0 14 8">
            <path className={s.smile} d="M3 2.4c1.8 2.3 6.2 2.3 8 0" />
            <path className={s.sad} d="M4 6c1.7-2.1 4.3-2.1 6 0" />
          </svg>
        </span>
      </span>
    </span>
  );
}
