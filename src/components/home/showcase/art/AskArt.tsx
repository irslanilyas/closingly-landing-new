"use client";

import { useRef } from "react";
import { Picture } from "@/components/ui/Picture";
import { AskGlobe } from "./AskGlobe";
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
  const { part, parts, play, hide } = scene;
  const [panel, orb, question, head, intro] = [part("panel"), part("orb"), part("question"), part("head"), part("intro")];

  // The sourced points wait for the intro line; they never show before it is written.
  hide(parts("point"));
  play(panel, [{ opacity: 0, transform: "translate(-50%, 20px) scale(0.985)" }, { opacity: 1, transform: "translate(-50%, 0)" }], {
    duration: 1100,
    delay: 100,
  });
  // The face pops into place.
  play(orb, [{ opacity: 0, transform: "scale(0.35)" }, IN], { duration: 1100, delay: 400, easing: SPRING });
  play(question, [{ opacity: 0, transform: "translateX(18px)" }, IN], { duration: 900, delay: 900 });
  play(head, [{ opacity: 0, transform: "translateY(6px)" }, IN], { duration: 800, delay: 1500 });
  await revealWords(scene, wordsOf(intro), { gap: 45, start: 1750 });
  parts("point").forEach((point, i) =>
    play(point, [{ opacity: 0, transform: "translateY(14px)" }, IN], { duration: 900, delay: 150 + i * 420, easing: EASE.out }),
  );
}

export function AskArt() {
  const root = useRef<HTMLDivElement>(null);
  useScene(root, story);
  return (
    <div ref={root} className={`${a.root} ${s.root}`}>
      <Picture name="showcaseAsk" sizes={ART_SIZES} className={a.bg} />
      <div className={s.panel} data-part="panel">
        <div className={s.top}>
          <AskGlobe />
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
