"use client";

import { useEffect } from "react";

/** The illustrations are drawn at this size and scaled with their card. */
const STAGE_WIDTH = 419;
/** Where the dragged deal's centre rests, in stage pixels. */
const REST = { x: 220.2, y: 197.1 };
/** The Proposal Sent column starts here; over it, the card squares up and is drawn into the slot. */
const SENT_X = 274.83;
const SLOT = { x: 392.6 - REST.x, y: 174.1 - REST.y };
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const SETTLE = 0.02;

type Spring = { x: number; y: number };

/**
 * Sizes every "How it works" illustration to its card exactly (CSS can only
 * approximate the ratio on some Safari versions), and makes two of them answer
 * the mouse:
 *   [data-tilt]  the new deal tilts toward the pointer under a moving highlight,
 *                and the room behind it shifts the other way
 *   [data-drag]  the deal being moved follows the pointer like a held card,
 *                swings with its speed, and squares up over Proposal Sent
 * Only with a real hover pointer and motion allowed; transforms and opacity
 * only, one animation-frame loop per card that stops as soon as it settles.
 */
export function ArtControl() {
  // The art is drawn 419px wide and scaled as one layer to its card's width.
  useEffect(() => {
    const arts = [...document.querySelectorAll<HTMLElement>("#how-it-works [role=img]")];
    const fit = new ResizeObserver(() =>
      arts.forEach((art) => art.style.setProperty("--fit", String(Math.min(1, art.parentElement!.clientWidth / STAGE_WIDTH)))),
    );
    arts.forEach((art) => fit.observe(art.parentElement!));
    return () => fit.disconnect();
  }, []);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups = [
      ...[...document.querySelectorAll<HTMLElement>("[data-tilt]")].map(tilt),
      ...[...document.querySelectorAll<HTMLElement>("[data-drag]")].map(drag),
    ];
    return () => cleanups.forEach((stop) => stop());
  }, []);
  return null;
}

/** Eases `now` toward `target` once per frame and calls `draw` until both meet. */
function follower(draw: (now: Spring) => void, ease = 0.12) {
  const now = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let frame = 0;
  const tick = () => {
    now.x += (target.x - now.x) * ease;
    now.y += (target.y - now.y) * ease;
    draw(now);
    frame = Math.abs(target.x - now.x) + Math.abs(target.y - now.y) > SETTLE ? requestAnimationFrame(tick) : 0;
  };
  return {
    now,
    aim(x: number, y: number) {
      target.x = x;
      target.y = y;
      if (!frame) frame = requestAnimationFrame(tick);
    },
    stop: () => cancelAnimationFrame(frame),
  };
}

function listen(el: HTMLElement, move: (e: PointerEvent) => void, leave: () => void) {
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

function tilt(art: HTMLElement) {
  const card = art.querySelector<HTMLElement>("[data-tilt-card]")!;
  const glare = art.querySelector<HTMLElement>("[data-tilt-glare]")!;
  const room = art.querySelector<HTMLElement>("[data-tilt-room]")!;
  const spring = follower(({ x, y }) => {
    card.style.transform = `translate(-50%, -50%) perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
    glare.style.transform = `translate(${(x * 35).toFixed(1)}%, ${(y * 35).toFixed(1)}%)`;
    room.style.transform = `translate(${(-x * 8).toFixed(1)}px, ${(-y * 8).toFixed(1)}px) scale(1.04)`;
  });
  const unlisten = listen(
    art,
    (e) => {
      const box = art.getBoundingClientRect();
      art.dataset.hover = "";
      spring.aim(((e.clientX - box.left) / box.width) * 2 - 1, ((e.clientY - box.top) / box.height) * 2 - 1);
    },
    () => {
      delete art.dataset.hover;
      spring.aim(0, 0);
    },
  );
  return () => {
    unlisten();
    spring.stop();
  };
}

function drag(art: HTMLElement) {
  const card = art.querySelector<HTMLElement>("[data-drag-card]")!;
  let last = 0;
  let swing = 0;
  const spring = follower(({ x, y }) => {
    // The card swings with its own speed, and squares up over the column it would land in.
    const speed = x - last;
    last = x;
    swing += (Math.max(-10, Math.min(10, speed * 1.6)) - swing) * 0.2;
    const landing = REST.x + x > SENT_X ? -11.04 * Math.min(1, (REST.x + x - SENT_X) / 60) : 0;
    card.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    card.style.rotate = `${(swing + landing).toFixed(2)}deg`;
  }, 0.14);
  const unlisten = listen(
    art,
    (e) => {
      const box = art.getBoundingClientRect();
      const scale = box.width / STAGE_WIDTH;
      const x = clamp((e.clientX - box.left) / scale - REST.x, -110, SLOT.x);
      const y = clamp((e.clientY - box.top) / scale - REST.y, -90, 190);
      const landing = REST.x + x > SENT_X;
      art.toggleAttribute("data-landing", landing);
      // Over the column, the slot pulls the card in like a magnet.
      spring.aim(landing ? x + (SLOT.x - x) * 0.6 : x, landing ? y + (SLOT.y - y) * 0.6 : y);
    },
    () => {
      art.removeAttribute("data-landing");
      spring.aim(0, 0);
    },
  );
  return () => {
    unlisten();
    spring.stop();
  };
}
