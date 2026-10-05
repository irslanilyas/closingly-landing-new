"use client";

import { DEMO, PLAY_DEMO_EVENT, loadDemoPlayer } from "./demo";
import motion from "@/styles/motion.module.css";
import styles from "./Hero.module.css";

export function WatchDemoButton() {
  const prefetch = () => {
    loadDemoPlayer().catch(() => {});
  };
  return (
    <button
      type="button"
      className={`${styles.watch} ${motion.riseIn}`}
      onPointerEnter={prefetch}
      onPointerDown={prefetch}
      onFocus={prefetch}
      onClick={() => window.dispatchEvent(new Event(PLAY_DEMO_EVENT))}
    >
      <span className={styles.watchIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M8 5.6v12.8a1 1 0 0 0 1.52.85l10.2-6.4a1 1 0 0 0 0-1.7L9.52 4.75A1 1 0 0 0 8 5.6Z" />
        </svg>
      </span>
      Watch the demo
      <span className={styles.watchTime}>{DEMO.minutes} min</span>
    </button>
  );
}
