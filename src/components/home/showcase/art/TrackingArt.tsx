"use client";

import { useRef } from "react";
import { Picture } from "@/components/ui/Picture";
import { Sparkle } from "./Bits";
import { EASE, useScene, type Scene } from "./scene";
import { ART_SIZES } from "./shared";
import a from "./art.module.css";
import s from "./TrackingArt.module.css";

const SECTIONS = [
  { name: "Overview", track: 60, fill: 48, status: "Viewed" },
  { name: "Deliverables", track: 72, fill: 58, status: "Viewed" },
  { name: "Investment", track: 84, fill: 67, status: "2 views", hot: true },
  { name: "Terms", track: 96, fill: 77, status: "Viewed" },
];

const IN = { opacity: 1, transform: "none" };

/**
 * The client opens the proposal again: the view count ticks over, each section's
 * reading fills in at a reading pace, and the strongest interest lights up.
 */
async function story(scene: Scene) {
  const { part, parts, play, wait, reset } = scene;
  const [notice, logo, card] = [part("notice"), part("logo"), part("card")];
  const [from, to] = [part("from"), part("to")];
  const fills = parts("fill");
  const statuses = parts("status");
  const [hot, insight] = [part("hot"), part("insight")];

  for (;;) {
    reset();
    play(notice, [{ opacity: 0, transform: "translateY(-14px) scale(0.98)" }, IN], { duration: 1000, delay: 100 });
    play(logo, [{ opacity: 0, transform: "scale(0.8)" }, IN], { duration: 900, delay: 350 });
    play(card, [{ opacity: 0, transform: "translateY(20px) scale(0.985)" }, IN], { duration: 1100, delay: 350 });

    // The count rolls from 3 to 4 views.
    play(from, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-60%)" }], {
      duration: 700,
      delay: 1300,
      easing: EASE.inOut,
    });
    play(to, [{ opacity: 0, transform: "translateY(60%)" }, IN], { duration: 800, delay: 1380 });

    // Each section fills in at a reading pace, one after another.
    fills.forEach((fill, i) =>
      play(fill, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: 1400,
        delay: 1500 + i * 380,
        easing: EASE.inOut,
      }),
    );
    statuses.forEach((status, i) =>
      play(status, [{ opacity: 0, transform: "translateX(6px)" }, IN], { duration: 600, delay: 2300 + i * 380 }),
    );

    // Investment was read the most: it warms up, then the insight arrives.
    play(hot, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 3600, easing: EASE.inOut });
    await play(insight, [{ opacity: 0, transform: "translateY(10px) scale(0.98)" }, IN], { duration: 900, delay: 4000 });

    await wait(5200);
    await Promise.all([notice, card].map((el) => play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: EASE.inOut })));
    await wait(300);
  }
}

export function TrackingArt() {
  const root = useRef<HTMLDivElement>(null);
  useScene(root, story);
  return (
    <div ref={root} className={a.root}>
      <Picture name="showcaseTracking" sizes={ART_SIZES} className={a.bg} />
      <div className={s.column}>
        <div className={s.notice} data-part="notice">
          <span className={s.logo} data-part="logo">
            <Picture name="logoAster" sizes="48px" />
          </span>
          <span className={s.live} aria-hidden="true" />
          <span className={s.noticeText}>
            <b>Aster Living just viewed your proposal again.</b>
            <span>Time to send a follow up?</span>
          </span>
        </div>
        <div className={s.card} data-part="card">
          <div className={s.head}>
            <span className={s.thumbs}>
              <span className={s.thumbBack}>
                <Picture name="proposalThumbBack" sizes="72px" />
              </span>
              <span className={s.thumbFront}>
                <Picture name="proposalThumbFront" sizes="85px" />
              </span>
            </span>
            <span className={s.views}>
              <span className={s.label}>PROPOSAL ENGAGEMENT</span>
              <span className={s.count}>
                <b className={`${a.layers} ${s.digits}`}>
                  <span className={a.hidden} data-part="from">
                    3
                  </span>
                  <span data-part="to">4</span>
                </b>{" "}
                views
              </span>
            </span>
          </div>
          <p className={s.last}>Last viewed 17 minutes ago</p>
          <ul className={s.rows}>
            {SECTIONS.map((row) => (
              <li key={row.name}>
                {row.hot && <span className={s.hot} data-part="hot" aria-hidden="true" />}
                <span>{row.name}</span>
                <span className={s.track} style={{ width: row.track }}>
                  <span className={s.fill} data-part="fill" style={{ width: row.fill }} />
                </span>
                <span data-part="status">{row.status}</span>
              </li>
            ))}
          </ul>
          <p className={`${a.working} ${s.insight}`} data-part="insight">
            <Sparkle className={s.sparkle} />
            Strongest interest: Investment
          </p>
        </div>
      </div>
    </div>
  );
}
