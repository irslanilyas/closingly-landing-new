"use client";

import { useEffect, useRef } from "react";
import { Picture } from "@/components/ui/Picture";
import { Gloss } from "./Bits";
import { EASE, revealWords, useScene, wordsOf, type Scene } from "./scene";
import { ART_SIZES } from "./shared";
import { Words } from "./Words";
import a from "./art.module.css";
import s from "./AskArt.module.css";

const POINTS = [
  {
    lead: "Budget is worth clarifying.",
    rest: " Alex has viewed Investment twice, but hasn’t replied. Views alone don’t confirm a concern.",
    source: "Proposal activity · 17 min ago",
  },
  {
    lead: "The launch date matters.",
    rest: " On the discovery call, Alex asked to launch in six weeks.",
    source: "Discovery call · 18:42",
  },
  {
    lead: "There’s a new scope question.",
    rest: " Alex asked about a customer portal. The proposal covers a 5-page website with CMS.",
    source: "Client request · Yesterday",
  },
];

const IN = { opacity: 1, transform: "none" };
const SPRING = "cubic-bezier(0.34, 1.4, 0.64, 1)";

/** A question about a deal, answered point by point from that deal's own sources. */
async function story(scene: Scene) {
  const { part, parts, play } = scene;
  const [panel, orb, halo, question, head, intro] = [part("panel"), part("orb"), part("halo"), part("question"), part("head"), part("intro")];

  play(panel, [{ opacity: 0, transform: "translate(-50%, 20px) scale(0.985)" }, { opacity: 1, transform: "translate(-50%, 0)" }], {
    duration: 1100,
    delay: 100,
  });
  // The globe grows into place with its light.
  play(halo, [{ opacity: 0, transform: "scale(0.4)" }, IN], { duration: 1400, delay: 350 });
  play(orb, [{ opacity: 0, transform: "scale(0.35)" }, IN], { duration: 1100, delay: 400, easing: SPRING });
  play(question, [{ opacity: 0, transform: "translateX(18px)" }, IN], { duration: 900, delay: 900 });
  play(head, [{ opacity: 0, transform: "translateY(6px)" }, IN], { duration: 800, delay: 1500 });
  await revealWords(scene, wordsOf(intro), { gap: 45, start: 1750 });
  parts("point").forEach((point, i) =>
    play(point, [{ opacity: 0, transform: "translateY(14px)" }, IN], { duration: 900, delay: 150 + i * 420, easing: EASE.out }),
  );
}

/**
 * The globe's eyes follow the pointer anywhere on the page. With no pointer
 * (a phone), they glance between the question and the answer instead. One
 * animation-frame loop, eased toward its target, transforms only.
 */
function useEyes(eyes: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = eyes.current;
    if (!active || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const RANGE = 3.2;
    let target = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    let frame = 0;
    let lastMove = 0;

    const tick = () => {
      now.x += (target.x - now.x) * 0.14;
      now.y += (target.y - now.y) * 0.14;
      el.style.transform = `translate(${now.x.toFixed(2)}px, ${now.y.toFixed(2)}px)`;
      frame = Math.abs(target.x - now.x) + Math.abs(target.y - now.y) > 0.02 ? requestAnimationFrame(tick) : 0;
    };
    const aim = (x: number, y: number) => {
      target = { x, y };
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      lastMove = performance.now();
      const box = el.getBoundingClientRect();
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, distance / 220);
      aim((dx / distance) * RANGE * reach, (dy / distance) * RANGE * 0.8 * reach);
    };

    // Without a pointer, the globe reads the conversation: question, answer, you.
    const glances = [
      { x: 3, y: 1.6 },
      { x: -1, y: 2.4 },
      { x: 0, y: 0 },
      { x: 2.4, y: -0.6 },
    ];
    let glance = 0;
    const idle = window.setInterval(() => {
      if (performance.now() - lastMove < 2500) return;
      aim(glances[glance].x, glances[glance].y);
      glance = (glance + 1) % glances.length;
    }, 1800);

    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      clearInterval(idle);
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [eyes, active]);
}

export function AskArt() {
  const root = useRef<HTMLDivElement>(null);
  const eyes = useRef<HTMLSpanElement>(null);
  const playing = useScene(root, story);
  useEyes(eyes, playing);
  return (
    <div ref={root} className={`${a.root} ${s.root}`}>
      <Picture name="showcaseAsk" sizes={ART_SIZES} className={a.bg} />
      <div className={s.panel} data-part="panel">
        <div className={s.top}>
          <span className={s.orb}>
            <span className={s.halo} data-part="halo" aria-hidden="true">
              <span />
            </span>
            <span className={s.avatar} data-part="orb">
              <Picture name="askAvatar" sizes="46px" />
              <span className={s.eyes} ref={eyes} aria-hidden="true">
                <i />
                <i />
              </span>
            </span>
          </span>
          <span className={s.topText}>
            <b>Ask Closingly</b>
            <span>Your deals, in context.</span>
          </span>
        </div>
        <div className={s.thread}>
          <p className={s.question} data-part="question">
            What’s holding up the Acme deal?
          </p>
          <div className={s.answerHead} data-part="head">
            <Gloss size={19.986} />
            <b>Closingly</b>
            <span className={s.sources}>Using 3 deal sources</span>
          </div>
          <p className={s.intro} data-part="intro">
            <Words text="Alex hasn’t raised an objection yet. Here’s what the deal context tells us:" />
          </p>
          <ol className={s.points}>
            {POINTS.map((p, i) => (
              <li key={p.source} data-part="point">
                <span className={s.number}>{i + 1}</span>
                <span className={s.pointText}>
                  <span>
                    <b>{p.lead}</b>
                    {p.rest}
                  </span>
                  <span className={s.pointSource}>{p.source}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
