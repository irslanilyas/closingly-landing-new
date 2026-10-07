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
 *   happy      the pointer is close
 *   woohoo     the pointer keeps circling it: the orb spins and it cheers "wooo!"
 *   dizzy      the mouse was shaken hard: spiral eyes, a wobble, birds round its head, no tracking
 *   searching  coming round from dizzy: frightened, looking left and right for the pointer
 *   sad        the pointer left the page (toward the address bar, or another tab)
 *   sleepy     nobody has moved for a while
 *   surprised  woken up
 *
 * Moods are a data attribute styled in CSS; one animation-frame loop eases the
 * look direction and stops as soon as it settles. Transforms and opacity only.
 */
type Mood = "idle" | "happy" | "woohoo" | "dizzy" | "searching" | "sad" | "sleepy" | "surprised";

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

/** Dizzy takes real shaking: this much travel, with this many turns, inside the window. */
const SHAKE = { window: 800, travel: 1500, turns: 5 };
/** Circling: this many turns of the pointer around the globe, within this many globe widths of it. */
const CIRCLE = { turns: 1.25, reach: 3.4 };

export function AskGlobe() {
  const root = useRef<HTMLSpanElement>(null);
  const playing = useContext(PlayingContext);

  useEffect(() => {
    const el = root.current;
    if (!playing || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const q = <T extends Element>(sel: string) => [...el.querySelectorAll<T>(sel)];
    const [face] = q<HTMLElement>("[data-face]");
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
    const clearLater = () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };

    // ── Moods ──
    let mood: Mood = "idle";
    let moodTimer = 0;
    let near = false;
    const pointer = { x: 0, y: 0, known: false };
    const setMood = (next: Mood, ms = 0) => {
      clearTimeout(moodTimer);
      mood = next;
      el.dataset.mood = next;
      if (ms) moodTimer = window.setTimeout(() => setMood(near ? "happy" : "idle"), ms);
    };
    /** While dizzy or coming round, it does not follow the pointer. */
    const dazed = () => mood === "dizzy" || mood === "searching";

    // ── Looking ──
    const target = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    let frame = 0;
    const draw = () => {
      look.x += (target.x - look.x) * 0.2;
      look.y += (target.y - look.y) * 0.2;
      const { x, y } = look;
      // The face slides across the sphere and foreshortens toward its edge.
      face.style.transform = `translate(${(x * 5).toFixed(2)}px, ${(y * 4).toFixed(2)}px) scale(${(1 - Math.abs(x) * 0.14).toFixed(3)}, ${(1 - Math.abs(y) * 0.1).toFixed(3)})`;
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
    const center = () => {
      const box = el.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2, size: box.width };
    };
    const aimAtPointer = () => {
      if (!pointer.known) return aim(0, 0);
      const c = center();
      const dx = pointer.x - c.x;
      const dy = pointer.y - c.y;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 130);
      aim((dx / dist) * reach, (dy / dist) * reach);
    };

    // Dizzy, then it comes round: frightened, it looks left and right, finds the pointer and cheers up.
    const getDizzy = () => {
      clearLater();
      setMood("dizzy");
      aim(0, 0.1);
      later(() => {
        setMood("searching");
        aim(-0.95, 0.1);
        later(() => aim(0.95, 0.05), 420);
        later(() => aim(-0.5, -0.2), 820);
        later(() => {
          aimAtPointer();
          setMood("happy", 1100);
        }, 1150);
      }, 2700);
    };

    // ── The pointer ──
    let lastMove = performance.now();
    let last = { x: 0, y: 0, t: 0 };
    const shake: { t: number; d: number; turn: boolean }[] = [];
    let travel = 0;
    let turns = 0;
    let lastDx = 0;
    let lastDy = 0;
    let dizzyCooldown = 0;
    let sweep = 0;
    let lastAngle: number | null = null;
    let lastCircleMove = 0;

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.known = true;
      lastMove = now;
      if (mood === "sad") setMood("happy", 900);
      if (mood === "sleepy") setMood("surprised", 700);
      if (dazed()) {
        last = { x: e.clientX, y: e.clientY, t: now };
        return;
      }

      const c = center();
      const dx = e.clientX - c.x;
      const dy = e.clientY - c.y;
      const dist = Math.hypot(dx, dy) || 1;
      aimAtPointer();

      // Circling close around it: the orb spins and it cheers.
      let circling = false;
      if (dist < c.size * CIRCLE.reach) {
        const angle = Math.atan2(dy, dx);
        if (lastAngle !== null && now - lastCircleMove < 500) {
          let step = angle - lastAngle;
          if (step > Math.PI) step -= Math.PI * 2;
          if (step < -Math.PI) step += Math.PI * 2;
          // A reversal starts the count again: only steady circling counts.
          sweep = sweep === 0 || Math.sign(step) === Math.sign(sweep) ? sweep + step : step;
        } else sweep = 0;
        lastAngle = angle;
        lastCircleMove = now;
        circling = Math.abs(sweep) > Math.PI * 2 * CIRCLE.turns;
        if (circling) {
          el.dataset.spin = sweep > 0 ? "cw" : "ccw";
          setMood("woohoo", 650);
        }
      } else {
        sweep = 0;
        lastAngle = null;
      }

      // Hard shaking makes it dizzy: lots of travel with many turns, inside well under a second.
      if (e.pointerType === "mouse" && last.t && !circling) {
        const stepX = e.clientX - last.x;
        const stepY = e.clientY - last.y;
        const d = Math.hypot(stepX, stepY);
        const turnX = Math.abs(stepX) > 6 && lastDx !== 0 && Math.sign(stepX) !== Math.sign(lastDx);
        const turnY = Math.abs(stepY) > 6 && lastDy !== 0 && Math.sign(stepY) !== Math.sign(lastDy);
        if (Math.abs(stepX) > 6) lastDx = stepX;
        if (Math.abs(stepY) > 6) lastDy = stepY;
        const turn = turnX || turnY;
        shake.push({ t: now, d, turn });
        travel += d;
        if (turn) turns++;
        while (shake.length && now - shake[0].t > SHAKE.window) {
          const old = shake.shift()!;
          travel -= old.d;
          if (old.turn) turns--;
        }
        if (travel > SHAKE.travel && turns >= SHAKE.turns && now > dizzyCooldown) {
          shake.length = 0;
          travel = 0;
          turns = 0;
          dizzyCooldown = now + 7000;
          last = { x: e.clientX, y: e.clientY, t: now };
          getDizzy();
          return;
        }
      }
      last = { x: e.clientX, y: e.clientY, t: now };

      const wasNear = near;
      near = dist < c.size * 1.3;
      if (mood === "idle" && near) setMood("happy");
      else if (mood === "happy" && wasNear && !near) setMood("idle");
    };

    // Leaving the page makes it sad: the pointer heading for the address bar, or another tab.
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget || dazed()) return;
      if (e.clientY <= 8) setMood("sad");
    };
    const onHidden = () => {
      if (document.hidden && !dazed()) setMood("sad");
    };

    // ── Blinks, glances, sleep ──
    let blinkTimer = 0;
    const blink = () => {
      if (mood === "idle" || mood === "surprised" || mood === "sad") {
        el.dataset.blink = "";
        later(() => delete el.dataset.blink, 130);
        if (Math.random() < 0.25) {
          later(() => (el.dataset.blink = ""), 260);
          later(() => delete el.dataset.blink, 390);
        }
      }
      blinkTimer = window.setTimeout(blink, 2200 + Math.random() * 3200);
    };
    blinkTimer = window.setTimeout(blink, 3200);
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
    const wink = window.setTimeout(() => {
      el.dataset.wink = "";
      window.setTimeout(() => delete el.dataset.wink, 380);
    }, 1700);

    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onHidden);
      clearInterval(tick);
      clearTimeout(moodTimer);
      clearTimeout(blinkTimer);
      clearTimeout(wink);
      clearLater();
      cancelAnimationFrame(frame);
      el.dataset.mood = "idle";
      delete el.dataset.blink;
      delete el.dataset.wink;
      delete el.dataset.spin;
      [face, texture, spec, lean, glow].forEach((node) => (node.style.transform = ""));
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
                <span className={s.pill} />
                <svg className={s.arc} viewBox="0 0 10 6">
                  <path d="M1.2 5C2.4 1.6 7.6 1.6 8.8 5" />
                </svg>
                <svg className={s.spiral} viewBox="0 0 12 12">
                  <path d="M6 6.2c0-.6.8-.7 1-.2.3.8-.6 1.5-1.4 1.3C4.3 7 4.2 5.3 5.2 4.6c1.4-.9 3.3.1 3.4 1.8.1 2.2-2.2 3.4-4 2.6C2.4 8.1 2.1 5.4 3.4 3.8 5 1.9 8.6 2.1 9.9 4.4" />
                </svg>
              </span>
            ))}
            <i className={s.tear} />
            <span className={s.cheeks}>
              <i />
              <i />
            </span>
            <svg className={s.mouth} viewBox="0 0 14 8">
              <path className={s.smile} d="M3.5 2.6c1.6 2 5.4 2 7 0" />
              <path className={s.grin} d="M3 2.2h8c-.4 3.4-7.6 3.4-8 0Z" />
              <ellipse className={s.cheer} cx="7" cy="4.2" rx="2.6" ry="2.9" />
              <path className={s.frown} d="M3 5.6c.9-.9 1.8-.9 2.7 0s1.8.9 2.7 0 1.8-.9 2.6 0" />
              <path className={s.sad} d="M4 6c1.7-2.1 4.3-2.1 6 0" />
              <ellipse className={s.oh} cx="7" cy="4" rx="1.6" ry="1.9" />
            </svg>
          </span>
        </span>
      </span>
      <span className={s.birds}>
        <span className={s.orbit}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={s.bird} style={{ "--at": `${i * 120}deg` } as React.CSSProperties}>
              <svg viewBox="0 0 12 10">
                <circle cx="5.5" cy="5.5" r="3.6" fill="#ffd23f" />
                <path d="M9 5.1l2.6.7-2.6.8Z" fill="#ff8a1f" />
                <circle cx="6.7" cy="4.6" r=".75" fill="#2b1205" />
                <path d="M2.6 4.6c.9-.3 2-.2 2.6.6" fill="none" stroke="#e8a900" strokeWidth=".9" strokeLinecap="round" />
              </svg>
            </span>
          ))}
        </span>
      </span>
      <span className={s.cheers}>
        <i>wooo!</i>
        <i>wooo!</i>
      </span>
      <span className={s.zzz}>
        <i>z</i>
        <i>z</i>
      </span>
    </span>
  );
}
