"use client";

import { useRef } from "react";
import { Picture } from "@/components/ui/Picture";
import { Cursor, Gloss, Sparkle, Thinking } from "./Bits";
import { EASE, revealWords, useScene, wordsOf, type Scene } from "./scene";
import { ART_SIZES } from "./shared";
import { Words } from "./Words";
import a from "./art.module.css";
import s from "./FollowUpArt.module.css";

const VARIATIONS = [
  "Hi Alex, I saw you had another look at the website proposal. Happy to walk through the investment and how we can shape the project around your priorities. Would a quick chat this week help?",
  "Hi Alex, a quick thought on the investment. If the budget feels tight, we could launch the core pages first and add the rest next month. Want me to send over a phased version?",
];

const IN = { opacity: 1, transform: "none" };
const OUT = { opacity: 0 };

/**
 * A signal in the deal, then the follow-up Closingly drafts from it, written out
 * the way Ask Closingly writes in the app. The pointer asks for another
 * variation, Closingly thinks, writes the second, and the two alternate.
 */
async function story(scene: Scene) {
  const { part, parts, play, wait, clear } = scene;
  const [card, icon, kicker, actions] = [part("card"), part("icon"), part("kicker"), part("actions")];
  const [thinking, cursor, button, ripple] = [part("thinking"), part("cursor"), part("button"), part("ripple")];
  const drafts = parts("draft");
  const counts = parts("count");

  const think = async (ms: number) => {
    clear([thinking]);
    play(thinking, [{ opacity: 0, transform: "translateY(4px)" }, IN], { duration: 300 });
    await wait(ms);
    await play(thinking, [IN, { opacity: 0, transform: "translateY(-4px)" }], { duration: 220, easing: EASE.inOut });
  };

  const write = async (i: number) => {
    const draft = drafts[i];
    const words = wordsOf(draft);
    clear([draft, ...words, ...counts]);
    play(draft, [IN, IN], { duration: 1 });
    play(counts[1 - i], [OUT, OUT], { duration: 1 });
    play(counts[i], [{ opacity: 0, transform: "translateY(4px)" }, IN], { duration: 500 });
    await revealWords(scene, words, { gap: 24 });
  };

  const erase = (i: number) => {
    clear([drafts[i]]);
    return play(drafts[i], [{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(3px)" }], {
      duration: 320,
      easing: EASE.inOut,
    });
  };

  // The pointer glides in on a slight arc, presses, and drifts off.
  const press = async () => {
    clear([cursor, button, ripple]);
    await play(
      cursor,
      [
        { opacity: 0, translate: "120px 90px", scale: "1" },
        { opacity: 1, translate: "46px 34px", scale: "1", offset: 0.45 },
        { opacity: 1, translate: "0 0", scale: "1" },
      ],
      { duration: 850, easing: EASE.inOut },
    );
    await wait(90);
    play(button, [{ scale: "1" }, { scale: "0.965" }, { scale: "1" }], { duration: 380, easing: EASE.inOut, fill: "none" });
    play(ripple, [{ opacity: 0.55, transform: "scale(0)" }, { opacity: 0, transform: "scale(1)" }], { duration: 700, fill: "none" });
    await play(cursor, [{ opacity: 1, translate: "0 0", scale: "1" }, { opacity: 1, translate: "0 0", scale: "0.86" }, { opacity: 1, translate: "0 0", scale: "1" }], {
      duration: 300,
      easing: EASE.inOut,
    });
    play(cursor, [{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "34px 46px" }], { duration: 600, delay: 120, easing: EASE.inOut });
  };

  // 1. The signal arrives with the card.
  play(card, [{ opacity: 0, transform: "translateY(20px) scale(0.985)" }, IN], { duration: 800, delay: 80 });
  play(icon, [{ opacity: 0, transform: "rotate(-70deg) scale(0.8)" }, IN], { duration: 800, delay: 200 });
  play(kicker, [OUT, { opacity: 1 }], { duration: 500, delay: 400 });
  play(drafts[0], [OUT, OUT], { duration: 1 });
  play(actions, [{ opacity: 0, transform: "translateY(10px)" }, IN], { duration: 600, delay: 550 });
  await wait(550);

  // 2. Then the two variations take turns, for as long as the panel is open.
  for (let i = 0; ; i = 1 - i) {
    await think(750);
    await write(i);
    await wait(1300);
    await press();
    await erase(i);
  }
}

export function FollowUpArt() {
  const root = useRef<HTMLDivElement>(null);
  useScene(root, story);
  return (
    <div ref={root} className={a.root}>
      <Picture name="showcaseFollowUp" sizes={ART_SIZES} className={a.bg} />
      <div className={s.card} data-part="card">
        <div className={s.head}>
          <Gloss size={52.587} part="icon" />
          <span className={s.headText}>
            <b>Client reviewed Investment twice</b>
            <span>Your deal context, working for you.</span>
          </span>
        </div>
        <p className={s.kicker} data-part="kicker">
          <Sparkle />
          SUGGESTED NEXT MOVE
          <span className={`${a.layers} ${s.counts}`}>
            <span data-part="count">1 of 2</span>
            <span className={a.hidden} data-part="count">
              2 of 2
            </span>
          </span>
        </p>
        <div className={`${a.layers} ${s.draft}`}>
          <Thinking className={`${s.thinking} ${a.hidden}`} />
          {VARIATIONS.map((text, i) => (
            <p key={i} className={`${s.write} ${i ? a.hidden : ""}`} data-part="draft">
              <Words text={text} />
            </p>
          ))}
        </div>
        <div className={s.actions} data-part="actions">
          <span className={s.secondary}>
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
            <img src="/icons/copy.svg" alt="" width={27} height={27} loading="lazy" />
            Copy text
          </span>
          <span className={`${a.action} ${s.primary}`} data-part="button">
            <span className={s.ripple} data-part="ripple" />
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
            <img src="/icons/ai-draft.svg" alt="" width={27} height={27} loading="lazy" />
            Generate another variation
          </span>
          <Cursor className={s.cursor} />
        </div>
      </div>
    </div>
  );
}
