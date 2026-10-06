"use client";

import { useRef } from "react";
import { Picture } from "@/components/ui/Picture";
import { Dots, Orbit } from "./Bits";
import { EASE, useScene, type Scene } from "./scene";
import { ART_SIZES } from "./shared";
import a from "./art.module.css";
import s from "./ProposalArt.module.css";

/**
 * The call transcript arrives, Closingly reads it, and the proposal pages take
 * shape behind it. Then the draft is ready, the scene rests, and it plays again.
 */
async function story(scene: Scene) {
  const { part, parts, play, wait, reset } = scene;
  const card = part("card");
  const working = part("working");
  const glow = part("glow");
  const progress = part("progress");
  const [busy, ready] = [part("busy"), part("ready")];
  const [front, back] = [part("front"), part("back")];

  for (;;) {
    reset();

    // 1. The transcript lands.
    play(card, [{ opacity: 0, transform: "translate(-50%, -14px) scale(0.98)" }, { opacity: 1, transform: "translate(-50%, 0)" }], {
      duration: 1000,
      delay: 100,
    });
    // 2. Closingly starts reading it; its light warms up slowly rather than switching on.
    play(working, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 900, delay: 550 });
    play(glow, [{ opacity: 0, transform: "scale(0.92)" }, { opacity: 1, transform: "scale(1)" }], {
      duration: 1600,
      delay: 900,
      easing: EASE.inOut,
    });
    // 3. The pages form behind it.
    play(front, [{ opacity: 0, translate: "-28px 22px", rotate: "-2deg" }, { opacity: 1, translate: "0 0", rotate: "0deg" }], {
      duration: 1600,
      delay: 1200,
    });
    play(back, [{ opacity: 0, translate: "28px 26px" }, { opacity: 1, translate: "0 0" }], { duration: 1600, delay: 1500 });
    await play(progress, [{ transform: "scaleX(0)" }, { transform: "scaleX(0.82)", offset: 0.75 }, { transform: "scaleX(1)" }], {
      duration: 3400,
      delay: 1000,
      easing: EASE.inOut,
    });

    // 4. The draft is ready.
    play(busy, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 400, easing: EASE.inOut });
    play(ready, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 600, delay: 180 });
    play(progress, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 });
    parts("float").forEach((el, i) =>
      play(el, [{ translate: "0 0" }, { translate: "0 -5px" }], {
        duration: 2600,
        delay: i * 500,
        iterations: 2,
        direction: "alternate",
        easing: EASE.inOut,
        fill: "none",
      }),
    );
    await wait(5600);

    // 5. Everything steps back, and the story starts again.
    await Promise.all(
      [card, working, front, back].map((el) => play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: EASE.inOut })),
    );
    await wait(300);
  }
}

export function ProposalArt() {
  const root = useRef<HTMLDivElement>(null);
  useScene(root, story);
  return (
    <div ref={root} className={a.root}>
      <Picture name="showcaseProposal" sizes={ART_SIZES} className={a.bg} />
      <span className={s.pageBack} data-part="back">
        <span className={s.fill} data-part="float">
          <Picture name="proposalPageBack" sizes="310px" className={s.fill} />
        </span>
      </span>
      <span className={s.pageFront} data-part="front">
        <span className={s.fill} data-part="float">
          <Picture name="proposalPageFront" sizes="358px" className={s.fill} />
        </span>
      </span>
      <div className={s.card} data-part="card">
        <div className={s.source}>
          <span className={s.logo}>
            <Picture name="logoAcme" sizes="55px" className={s.fill} />
          </span>
          <span className={s.sourceText}>
            <b>Call Transcript · Acme Corp,</b>
            <span>New website · 6 weeks · $12,000</span>
          </span>
        </div>
        <div className={`${a.working} ${s.working}`} data-part="working">
          <span className={s.glow} data-part="glow" aria-hidden="true" />
          <Orbit size={28.392} />
          <span className={a.layers}>
            <span data-part="busy">
              Getting your proposal ready
              <Dots />
            </span>
            <span className={a.hidden} data-part="ready">
              Proposal drafted · 6 sections
            </span>
          </span>
          <span className={s.progress} data-part="progress" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
