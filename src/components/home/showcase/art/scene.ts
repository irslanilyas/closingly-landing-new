"use client";

import { createContext, useContext, useLayoutEffect, useRef, type RefObject } from "react";

/** True while this panel is the one on screen and the showcase has been seen. */
export const PlayingContext = createContext(false);

export const EASE = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  glide: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  soft: "cubic-bezier(0.33, 1, 0.68, 1)",
} as const;

type Frames = Keyframe[] | PropertyIndexedKeyframes;

export type Scene = {
  /** First element matching a [data-part] name inside the art. */
  part: (name: string) => HTMLElement;
  parts: (name: string) => HTMLElement[];
  /** Web Animations only: opacity and transforms stay on the compositor, so every frame is a 60 fps frame. */
  play: (el: Element, frames: Frames, options: KeyframeAnimationOptions) => Promise<void>;
  wait: (ms: number) => Promise<void>;
  /** Drops every animation this scene started, so the art is back at its resting CSS. */
  reset: () => void;
  /** Drops the animations on these elements only. */
  clear: (targets: Element[]) => void;
  /** Holds elements invisible until a later play() brings them in, so nothing shows before its turn. */
  hide: (targets: Element[]) => void;
};

const aborted = () => new DOMException("scene stopped", "AbortError");

/**
 * Runs a scripted, looping story for one showcase illustration while its panel
 * is active. The resting CSS is the finished composition, so reduced motion and
 * a panel that is not playing both show the complete picture.
 */
export function useScene(root: RefObject<HTMLElement | null>, script: (scene: Scene) => Promise<void>) {
  const playing = useContext(PlayingContext);
  const latest = useRef(script);
  useLayoutEffect(() => {
    latest.current = script;
  });

  // A layout effect, so the first frames are set before the panel paints.
  useLayoutEffect(() => {
    const el = root.current;
    if (!playing || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stopped = false;
    const running = new Set<Animation>();
    const timers = new Set<number>();
    const scene: Scene = {
      part: (name) => el.querySelector<HTMLElement>(`[data-part="${name}"]`)!,
      parts: (name) => [...el.querySelectorAll<HTMLElement>(`[data-part="${name}"]`)],
      play(target, frames, options) {
        if (stopped) return Promise.reject(aborted());
        const animation = target.animate(frames, { fill: "both", easing: EASE.out, ...options });
        running.add(animation);
        // A cancelled animation (reset, clear) settles quietly; only a stopped scene aborts its script.
        const settle = () => {
          if (stopped) throw aborted();
        };
        const done = animation.finished.then(settle, settle);
        done.catch(() => {}); // fire-and-forget calls must not surface as unhandled rejections
        return done;
      },
      wait: (ms) =>
        new Promise((resolve, reject) => {
          if (stopped) return reject(aborted());
          const id = window.setTimeout(() => {
            timers.delete(id);
            if (stopped) reject(aborted());
            else resolve();
          }, ms);
          timers.add(id);
        }),
      reset() {
        running.forEach((a) => a.cancel());
        running.clear();
      },
      hide(targets) {
        targets.forEach((target) => scene.play(target, [{ opacity: 0 }, { opacity: 0 }], { duration: 1 }));
      },
      clear(targets) {
        running.forEach((a) => {
          if (targets.includes((a.effect as KeyframeEffect | null)?.target as Element)) {
            a.cancel();
            running.delete(a);
          }
        });
      },
    };
    latest.current(scene).catch(() => {});
    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
      running.forEach((a) => a.cancel());
    };
  }, [playing, root]);

  return playing;
}

/** Text that writes itself out word by word, each word developing out of a soft blur, as Ask Closingly does in the app. */
export function wordsOf(el: HTMLElement) {
  return [...el.querySelectorAll<HTMLElement>("[data-word]")];
}

export function revealWords(scene: Scene, words: HTMLElement[], { gap = 34, start = 0 } = {}) {
  return Promise.all(
    words.map((word, i) =>
      scene.play(
        word,
        [
          { opacity: 0, filter: "blur(4px)", transform: "translateY(0.25em)" },
          { opacity: 1, filter: "blur(0)", transform: "none" },
        ],
        { duration: 520, delay: start + i * gap, easing: EASE.out },
      ),
    ),
  );
}
