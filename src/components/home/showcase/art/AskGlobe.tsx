"use client";

import { useContext, useEffect, useRef } from "react";
import { Picture } from "@/components/ui/Picture";
import { PlayingContext } from "./scene";
import s from "./AskGlobe.module.css";

/**
 * Ask Closingly's globe: a shaded orb with the app's light and dust around it,
 * and a face that reacts to the visitor.
 *
 *   idle       eyes follow the pointer (or glance around on touch screens), blinking now and then
 *   happy      the pointer is close: happy eyes and a blush
 *   boop       clicked or tapped: it squashes, giggles and floats a few hearts
 *   dizzy      the mouse moved too fast: spiral eyes, a wobble and birds circling its head
 *   sleepy     nobody has moved for a while: droopy eyes and floating z's
 *   surprised  woken up: wide eyes for a moment
 *
 * Moods are a data attribute styled in CSS; one animation-frame loop eases the
 * look direction and stops as soon as it settles. Transforms and opacity only.
 */
type Mood = "idle" | "happy" | "boop" | "dizzy" | "sleepy" | "surprised";

const DUST = Array.from({ length: 9 }, (_, i) => {
  const angle = (i / 9) * Math.PI * 2 + (i % 3) * 0.35;
  const radius = 44 + (i % 3) * 6;
  return { left: 50 + radius * Math.cos(angle), top: 50 + radius * Math.sin(angle), size: i % 4 === 0 ? 5 : 3, delay: -i * 0.7 };
});

const GLANCES = [
  { x: 0.9, y: 0.5 },
  { x: -0.2, y: 0.8 },
  { x: 0, y: 0 },
  { x: 0.6, y: -0.3 },
];

export function AskGlobe() {
  const root = useRef<HTMLSpanElement>(null);
  const playing = useContext(PlayingContext);

  useEffect(() => {
    const el = root.current;
    if (!playing || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const q = <T extends Element>(sel: string) => [...el.querySelectorAll<T>(sel)];
    const [face] = q<HTMLElement>("[data-face]");
    const pupils = q<HTMLElement>("[data-pupil]");
    const [texture] = q<HTMLElement>("[data-texture]");
    const [spec] = q<HTMLElement>("[data-spec]");
    const [lean] = q<HTMLElement>("[data-lean]");
    const [glow] = q<HTMLElement>("[data-glow]");

    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    // ── Moods ──
    let mood: Mood = "idle";
    let moodTimer = 0;
    const setMood = (next: Mood, ms = 0) => {
      clearTimeout(moodTimer);
      if (next === mood && (next === "boop" || next === "dizzy")) {
        // Same mood again: restart its CSS animations.
        el.dataset.mood = "idle";
        void el.offsetWidth;
      }
      mood = next;
      el.dataset.mood = next;
      if (ms) moodTimer = window.setTimeout(() => setMood(near ? "happy" : "idle"), ms);
    };
    const busy = () => mood === "dizzy" || mood === "boop" || mood === "surprised";

    // ── Looking ──
    const target = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    let frame = 0;
    const draw = () => {
      look.x += (target.x - look.x) * 0.24;
      look.y += (target.y - look.y) * 0.24;
      const { x, y } = look;
      // The face slides across the sphere and foreshortens toward its edge.
      face.style.transform = `translate(${(x * 5).toFixed(2)}px, ${(y * 4).toFixed(2)}px) scale(${(1 - Math.abs(x) * 0.14).toFixed(3)}, ${(1 - Math.abs(y) * 0.1).toFixed(3)})`;
      const pupil = `translate(${(x * 1.9).toFixed(2)}px, ${(y * 1.7).toFixed(2)}px)`;
      pupils.forEach((p) => (p.style.transform = pupil));
      texture.style.transform = `rotate(${(x * 18).toFixed(2)}deg)`;
      spec.style.transform = `translate(${(-x * 3.5).toFixed(2)}px, ${(-y * 3).toFixed(2)}px)`;
      lean.style.transform = `translate(${(x * 1.6).toFixed(2)}px, ${(y * 1.4).toFixed(2)}px)`;
      glow.style.transform = `translate(${(-x * 6).toFixed(2)}px, ${(-y * 6).toFixed(2)}px)`;
      frame = Math.abs(target.x - x) + Math.abs(target.y - y) > 0.004 ? requestAnimationFrame(draw) : 0;
    };
    const aim = (x: number, y: number) => {
      target.x = Math.max(-1, Math.min(1, x));
      target.y = Math.max(-1, Math.min(1, y));
      if (!frame) frame = requestAnimationFrame(draw);
    };

    // ── The pointer ──
    let near = false;
    let lastMove = performance.now();
    let last = { x: 0, y: 0, t: 0 };
    // Shaking or circling, not one quick sweep: lots of travel and at least two
    // changes of direction inside under a second.
    const trail: { t: number; d: number; turn: boolean }[] = [];
    let travel = 0;
    let turns = 0;
    let lastDx = 0;
    let dizzyCooldown = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // Sensitive: full reach within about two globe widths.
      const reach = Math.min(1, dist / 110);
      aim((dx / dist) * reach, (dy / dist) * reach);

      if (mood === "sleepy") {
        setMood("surprised", 700);
      }
      lastMove = now;

      // Shaking the mouse makes it dizzy.
      if (e.pointerType === "mouse" && last.t) {
        const stepX = e.clientX - last.x;
        const d = Math.hypot(stepX, e.clientY - last.y);
        const turn = Math.abs(stepX) > 4 && lastDx !== 0 && Math.sign(stepX) !== Math.sign(lastDx);
        if (Math.abs(stepX) > 4) lastDx = stepX;
        trail.push({ t: now, d, turn });
        travel += d;
        if (turn) turns++;
        while (trail.length && now - trail[0].t > 900) {
          const old = trail.shift()!;
          travel -= old.d;
          if (old.turn) turns--;
        }
        if (travel > 1800 && turns >= 2 && now > dizzyCooldown && mood !== "dizzy") {
          trail.length = 0;
          travel = 0;
          turns = 0;
          dizzyCooldown = now + 6000;
          setMood("dizzy", 2800);
        }
      }
      last = { x: e.clientX, y: e.clientY, t: now };

      const wasNear = near;
      near = dist < box.width * 1.3;
      if (!busy()) {
        if (near && mood !== "happy") setMood("happy");
        else if (!near && wasNear && mood === "happy") setMood("idle");
      }
    };
    const onBoop = (e: PointerEvent) => {
      e.preventDefault();
      lastMove = performance.now();
      if (mood !== "dizzy") setMood("boop", 1200);
    };

    // ── Blinks, glances, sleep ──
    const blink = () => {
      if (mood === "idle" || mood === "surprised") {
        el.dataset.blink = "";
        later(() => delete el.dataset.blink, 130);
        if (Math.random() < 0.25) {
          later(() => (el.dataset.blink = ""), 260);
          later(() => delete el.dataset.blink, 390);
        }
      }
      later(blink, 2200 + Math.random() * 3200);
    };
    let glance = 0;
    const tick = window.setInterval(() => {
      const quiet = performance.now() - lastMove;
      if (quiet > 9000 && mood === "idle") {
        setMood("sleepy");
        aim(0, 0.35);
      } else if (quiet > 2500 && mood === "idle") {
        aim(GLANCES[glance].x, GLANCES[glance].y);
        glance = (glance + 1) % GLANCES.length;
      }
    }, 1900);

    // Hello: a wink once it has landed.
    later(() => {
      el.dataset.wink = "";
      later(() => delete el.dataset.wink, 380);
    }, 1700);
    later(blink, 3200);

    addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onBoop);
    return () => {
      removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onBoop);
      clearInterval(tick);
      clearTimeout(moodTimer);
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
      el.dataset.mood = "idle";
      delete el.dataset.blink;
      delete el.dataset.wink;
      [face, texture, spec, lean, glow, ...pupils].forEach((node) => (node.style.transform = ""));
    };
  }, [playing]);

  return (
    <span ref={root} className={s.globe} data-mood="idle" aria-hidden="true">
      <span className={s.field}>
        <span className={s.ring}>
          {DUST.map((d, i) => (
            <i
              key={i}
              style={
                {
                  left: `${d.left}%`,
                  top: `${d.top}%`,
                  width: d.size,
                  height: d.size,
                  "--delay": `${d.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      </span>
      <span className={s.halo} data-part="halo">
        <span data-glow="" />
      </span>
      <span className={s.body} data-part="orb">
        <span className={s.lean} data-lean="">
          <span className={s.texture} data-texture="">
            <Picture name="askAvatar" sizes="58px" />
          </span>
          <span className={s.shade} />
          <span className={s.spec} data-spec="" />
          <span className={s.face} data-face="">
            {[0, 1].map((i) => (
              <span key={i} className={s.eye}>
                <span className={s.sclera}>
                  <i data-pupil="" />
                </span>
                <svg className={s.arc} viewBox="0 0 10 6">
                  <path d="M1.2 5C2.4 1.6 7.6 1.6 8.8 5" />
                </svg>
                <svg className={s.spiral} viewBox="0 0 12 12">
                  <path d="M6 6.2c0-.6.8-.7 1-.2.3.8-.6 1.5-1.4 1.3C4.3 7 4.2 5.3 5.2 4.6c1.4-.9 3.3.1 3.4 1.8.1 2.2-2.2 3.4-4 2.6C2.4 8.1 2.1 5.4 3.4 3.8 5 1.9 8.6 2.1 9.9 4.4" />
                </svg>
              </span>
            ))}
            <span className={s.cheeks}>
              <i />
              <i />
            </span>
            <svg className={s.mouth} viewBox="0 0 14 8">
              <path className={s.smile} d="M3.5 2.6c1.6 2 5.4 2 7 0" />
              <path className={s.grin} d="M3 2.2h8c-.4 3.4-7.6 3.4-8 0Z" />
              <path className={s.frown} d="M3 5.6c.9-.9 1.8-.9 2.7 0s1.8.9 2.7 0 1.8-.9 2.6 0" />
              <ellipse className={s.oh} cx="7" cy="4" rx="1.6" ry="1.9" />
            </svg>
          </span>
        </span>
      </span>
      <span className={s.birds}>
        <span className={s.orbit}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={s.bird} style={{ "--at": `${i * 120}deg` } as React.CSSProperties}>
              <svg viewBox="0 0 14 12">
                <ellipse cx="6.5" cy="7" rx="4.6" ry="3.8" fill="#ffc83d" stroke="#b9770a" strokeWidth=".8" />
                <path className={s.wing} d="M4.2 6.4c1.3-2.6 3.8-2.4 4.4-.4" fill="#ffb21e" stroke="#b9770a" strokeWidth=".7" />
                <circle cx="9" cy="5.8" r=".8" fill="#2b1205" />
                <path d="M10.6 6.6l2.6.4-2.4 1.1Z" fill="#ff7a1a" />
              </svg>
            </span>
          ))}
        </span>
      </span>
      <span className={s.zzz}>
        <i>z</i>
        <i>z</i>
      </span>
      <span className={s.hearts}>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
