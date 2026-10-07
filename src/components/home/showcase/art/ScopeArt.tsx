"use client";

import { useRef } from "react";
import { Picture } from "@/components/ui/Picture";
import { Cursor, Gloss, Orbit, Sparkle, Thinking } from "./Bits";
import { EASE, revealWords, useScene, wordsOf, type Scene } from "./scene";
import { ART_SIZES } from "./shared";
import { Words } from "./Words";
import a from "./art.module.css";
import s from "./ScopeArt.module.css";

const DRAFT =
  "Hi Alex, happy to add a contact page. It sits outside the 5-page scope we agreed, so here is what it adds before we start:";

const IN = { opacity: 1, transform: "none" };
const OUT = { opacity: 0 };
/** Where the check card sits; the verdict rises to the same line. */
const TOP = 48.37;

/**
 * The new request is read against what was agreed, flagged as out of scope, and
 * the pointer asks for the draft. The verdict rises, Closingly writes the change
 * note with its line items, it rests, and the story starts over.
 */
async function story(scene: Scene) {
  const { part, parts, play, wait, reset, hide } = scene;
  const [check, scan, thread, verdict, verdictIcon] = [part("check"), part("scan"), part("thread"), part("verdict"), part("verdict-icon")];
  const items = parts("item");
  const [button, label, busy, done, cursor] = [part("button"), part("label"), part("busy"), part("done"), part("cursor")];
  const [draft, draftHead, text, lines, total] = [part("draft"), part("draft-head"), part("text"), parts("line"), part("total")];

  for (;;) {
    reset();
    // Laid out from the verdict's real height, so the draft always sits just under it.
    const lift = verdict.offsetTop - TOP;
    draft.style.top = `${TOP + verdict.offsetHeight + 12}px`;
    hide([draft, ...wordsOf(text), ...lines, total]);

    // 1. The request is read against the agreed scope.
    play(check, [{ opacity: 0, transform: "translateY(12px) scale(0.985)" }, { opacity: 0.8, transform: "none" }], { duration: 700, delay: 80 });
    play(scan, [{ transform: "translateX(-100%)" }, { transform: "translateX(100%)" }], {
      duration: 1000,
      delay: 350,
      iterations: 2,
      easing: EASE.inOut,
      fill: "none",
    });
    play(thread, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 900, delay: 400, easing: EASE.inOut });
    items.forEach((item, i) =>
      play(item, [{ opacity: 0, transform: "translateX(-14px)" }, IN], { duration: 650, delay: 550 + i * 380 }),
    );

    // 2. The verdict, with the way forward.
    play(verdict, [{ opacity: 0, transform: "translateY(22px) scale(0.985)" }, IN], { duration: 800, delay: 1450 });
    play(verdictIcon, [{ opacity: 0, transform: "rotate(-70deg) scale(0.8)" }, IN], { duration: 750, delay: 1650 });
    await wait(2400);

    // 3. The pointer asks for the draft.
    await play(
      cursor,
      [
        { opacity: 0, translate: "110px 96px", scale: "1" },
        { opacity: 1, translate: "40px 38px", scale: "1", offset: 0.45 },
        { opacity: 1, translate: "0 0", scale: "1" },
      ],
      { duration: 850, easing: EASE.inOut },
    );
    await wait(90);
    play(button, [{ scale: "1" }, { scale: "0.965" }, { scale: "1" }], { duration: 380, easing: EASE.inOut, fill: "none" });
    await play(cursor, [{ opacity: 1, translate: "0 0", scale: "1" }, { opacity: 1, translate: "0 0", scale: "0.86" }, { opacity: 1, translate: "0 0", scale: "1" }], {
      duration: 300,
      easing: EASE.inOut,
    });
    play(cursor, [{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "30px 44px" }], { duration: 600, delay: 100, easing: EASE.inOut });
    play(label, [IN, { opacity: 0, transform: "translateY(-6px)" }], { duration: 350, easing: EASE.inOut });
    play(busy, [{ opacity: 0, transform: "translateY(6px)" }, IN], { duration: 450, delay: 150 });

    // 4. The check steps back, the verdict rises, and the draft opens under it.
    await wait(300);
    play(check, [{ opacity: 0.8, transform: "none" }, { opacity: 0, transform: "translateY(-18px) scale(0.98)" }], { duration: 500, easing: EASE.inOut });
    await play(verdict, [IN, { opacity: 1, transform: `translateY(${-lift}px)` }], { duration: 750, delay: 100, easing: EASE.inOut });
    play(draft, [{ opacity: 0, transform: "translateY(16px) scale(0.985)" }, IN], { duration: 650 });
    play(draftHead, [OUT, { opacity: 1 }], { duration: 450, delay: 120 });
    await wait(350);

    // 5. Closingly writes it out, word by word, then lists what the change adds.
    await revealWords(scene, wordsOf(text), { gap: 24 });
    lines.forEach((line, i) => play(line, [{ opacity: 0, transform: "translateY(6px)" }, IN], { duration: 450, delay: 80 + i * 180 }));
    await play(total, [{ opacity: 0, transform: "translateY(6px)" }, IN], { duration: 500, delay: 80 + lines.length * 180 });
    play(busy, [IN, { opacity: 0, transform: "translateY(-6px)" }], { duration: 350, easing: EASE.inOut });
    play(done, [{ opacity: 0, transform: "translateY(6px)" }, IN], { duration: 500, delay: 150 });

    // 6. It rests, then everything steps back and the story starts over.
    await wait(3000);
    await Promise.all([verdict, draft].map((el) => play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: EASE.inOut })));
    await wait(300);
  }
}

export function ScopeArt() {
  const root = useRef<HTMLDivElement>(null);
  useScene(root, story);
  return (
    <div ref={root} className={a.root}>
      <Picture name="showcaseScope" sizes={ART_SIZES} className={a.bg} />
      <div className={s.check} data-part="check">
        <div className={s.checkHead}>
          <div className={s.row}>
            <Gloss size={28.721} />
            Scope check in progress
          </div>
          <div className={`${a.working} ${s.working}`}>
            <span className={s.scan} data-part="scan" aria-hidden="true" />
            <Orbit size={24.977} />
            Referencing every detail about the deal...
          </div>
        </div>
        <span className={s.thread} data-part="thread" aria-hidden="true" />
        <div className={s.item} data-part="item">
          <i aria-hidden="true" />
          <span>Original scope</span>
          <p>5-page marketing website with CMS.</p>
        </div>
        <div className={`${s.item} ${s.itemNew}`} data-part="item">
          <i aria-hidden="true" />
          <span>New client request</span>
          <p>Could we add a contact us page?</p>
        </div>
      </div>
      <div className={s.verdict} data-part="verdict">
        <div className={s.verdictText}>
          <div className={s.row}>
            <Gloss size={31.511} part="verdict-icon" />
            This request is out of scope
          </div>
          <p>This request may need more time and budget. Generate the draft to agree on the next steps before work begins.</p>
        </div>
        <span className={`${a.action} ${s.button}`} data-part="button">
          <span className={`${a.layers} ${s.buttonLabels}`}>
            <span className={s.buttonLabel} data-part="label">
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
              <img src="/icons/ai-draft.svg" alt="" width={26} height={26} loading="lazy" />
              Generate the draft
            </span>
            <span className={`${s.buttonLabel} ${a.hidden}`} data-part="busy">
              <Thinking label="Drafting" className={s.drafting} part="drafting" />
            </span>
            <span className={`${s.buttonLabel} ${a.hidden}`} data-part="done">
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
              </svg>
              Draft ready to send
            </span>
          </span>
        </span>
      </div>
      <Cursor className={s.cursor} />
      <div className={`${s.draft} ${a.hidden}`} data-part="draft">
        <p className={s.draftHead} data-part="draft-head">
          <Sparkle />
          CHANGE NOTE · DRAFT
        </p>
        <p className={s.text} data-part="text">
          <Words text={DRAFT} />
        </p>
        <ul className={s.lines}>
          <li data-part="line">
            <span>Contact page, design and build</span>
            <b>+ $600</b>
          </li>
          <li data-part="line">
            <span>Timeline</span>
            <b>+ 3 days</b>
          </li>
        </ul>
        <p className={s.total} data-part="total">
          <span>New project total</span>
          <b>$12,600</b>
        </p>
      </div>
    </div>
  );
}
