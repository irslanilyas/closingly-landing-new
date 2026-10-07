"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { Mark } from "@/components/brand/Logo";
import { track } from "@/lib/analytics";
import { DEMO, PLAY_DEMO_EVENT, PREVIEW_SRC, loadDemoPlayer } from "./demo";
import styles from "./HeroVideo.module.css";

/**
 * idle     nothing moving yet: the 0:31 still, with the mark as a preloader
 * preview  the muted 15 second loop is playing
 * opening  the visitor asked for the demo; the player is loading over the loop
 * demo     the full demo is playing from 0:00 with sound
 */
type Phase = "idle" | "preview" | "opening" | "demo";
/** "still" when the visitor prefers reduced motion or reduced data: no loop, a play button instead. */
type Mode = "motion" | "still";
type PlayerComponent = ComponentType<{ autoPlay: boolean; onPlaying: () => void }>;

export function HeroVideo() {
  const frameRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const viaKeyboard = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  // Event handlers read the phase from here, so they never act on a stale render.
  const phaseRef = useRef<Phase>("idle");
  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);
  const [mode, setMode] = useState<Mode>("motion");
  const [Player, setPlayer] = useState<PlayerComponent | null>(null);
  // "armed": mounted hidden and buffering; "asked": mounted because the visitor pressed play first.
  const [mount, setMount] = useState<"armed" | "asked" | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // The muted loop: requested only after the page has loaded, so it never
  // competes with the text, fonts and poster for the first paint.
  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    const prefersStill =
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (prefersStill || !video.canPlayType("video/mp4")) {
      setMode("still");
      return;
    }

    let visible = true;
    const onPlaying = () => {
      if (phaseRef.current === "idle") go("preview");
    };
    const start = () => {
      video.muted = true;
      video.src = PREVIEW_SRC;
      // Autoplay can still be refused (iOS Low Power Mode): fall back to the play button.
      video.play().catch(() => setMode("still"));
    };
    // Off screen the loop stops decoding, so scrolling the rest of the page stays at 60 fps.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!video.src) return;
      if (visible) video.play().catch(() => {});
      else video.pause();
    });

    video.addEventListener("playing", onPlaying);
    io.observe(video);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      video.removeEventListener("playing", onPlaying);
      window.removeEventListener("load", start);
      io.disconnect();
    };
  }, [go]);

  const prefetch = useCallback(() => {
    loadDemoPlayer().catch(() => {});
  }, []);

  // Once the page has loaded and the visitor starts using it with the hero on screen,
  // the player mounts hidden and buffers the opening seconds, so play is instant.
  // Never on data saver or a slow connection; then it loads on press, as before.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || /(^|-)(2g|3g)$/.test(connection?.effectiveType ?? "")) return;
    const frame = frameRef.current!;
    let inView = false;
    let interacted = false;
    let loaded = document.readyState === "complete";
    const arm = () => {
      if (!loaded || !inView || !interacted) return;
      cleanup();
      loadDemoPlayer()
        .then((m) => {
          setPlayer((current: PlayerComponent | null) => current ?? m.default);
          setMount((current) => current ?? "armed");
        })
        .catch(() => {});
    };
    const onInteract = () => {
      interacted = true;
      arm();
    };
    const onLoad = () => {
      loaded = true;
      arm();
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      arm();
    });
    const events = ["pointerdown", "pointermove", "touchstart", "scroll", "keydown"] as const;
    const cleanup = () => {
      io.disconnect();
      events.forEach((type) => removeEventListener(type, onInteract));
      removeEventListener("load", onLoad);
    };
    io.observe(frame);
    events.forEach((type) => addEventListener(type, onInteract, { passive: true }));
    if (!loaded) addEventListener("load", onLoad, { once: true });
    return cleanup;
  }, []);

  const openDemo = useCallback(() => {
    const from = phaseRef.current;
    if (from === "opening" || from === "demo") return;
    go("opening");
    track("video_start", { video_provider: "mux", video_title: DEMO.title });
    // Already buffered: start it inside this click, so sound is allowed and it plays at once.
    const video = playerRef.current?.querySelector("video");
    if (video) {
      video.muted = false;
      video.play().catch(() => go("demo"));
      return;
    }
    setMount("asked");
    loadDemoPlayer()
      .then((m) => setPlayer(() => m.default))
      .catch(() => go(from));
  }, [go]);

  // "Watch the demo" buttons elsewhere on the page ask through an event.
  useEffect(() => {
    const onRequest = () => {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      frameRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      openDemo();
    };
    window.addEventListener(PLAY_DEMO_EVENT, onRequest);
    return () => window.removeEventListener(PLAY_DEMO_EVENT, onRequest);
  }, [openDemo]);

  const onDemoPlaying = useCallback(() => {
    go("demo");
    const video = previewRef.current;
    if (video) {
      // Release the loop's decoder and buffer once the demo has taken over.
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    if (viaKeyboard.current) frameRef.current?.querySelector<HTMLElement>("[data-demo] button")?.focus();
  }, [go]);

  return (
    <div
      ref={frameRef}
      className={styles.frame}
      data-phase={phase}
      data-mode={mode}
      onPointerEnter={prefetch}
      onPointerDown={prefetch}
      onFocus={prefetch}
    >
      <picture className={styles.poster}>
        <source
          type="image/avif"
          srcSet="/media/hero-poster-640.avif 640w, /media/hero-poster-960.avif 960w, /media/hero-poster-1280.avif 1280w"
          sizes="(min-width: 1324px) 1274px, calc(100vw - 32px)"
        />
        <source
          type="image/webp"
          srcSet="/media/hero-poster-640.webp 640w, /media/hero-poster-960.webp 960w, /media/hero-poster-1280.webp 1280w"
          sizes="(min-width: 1324px) 1274px, calc(100vw - 32px)"
        />
        <img src="/media/hero-poster-1280.webp" alt="" width={1280} height={720} fetchPriority="high" decoding="async" />
      </picture>

      <video
        ref={previewRef}
        className={styles.preview}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
      />

      <span className={styles.loader} aria-hidden="true">
        <span className={styles.ripple} />
        <Mark className={styles.mark} size={72} />
      </span>

      {phase !== "demo" && (
        <button
          type="button"
          className={styles.start}
          onClick={(e) => {
            viaKeyboard.current = e.detail === 0;
            openDemo();
          }}
          aria-label={`Watch the demo, a ${DEMO.minutes}-minute walkthrough of Closingly. Play with sound`}
          aria-busy={phase === "opening"}
        >
          <span className={styles.cta} aria-hidden="true">
            <span className={styles.ctaIcon}>
              <PlayIcon />
            </span>
            <span className={styles.ctaText}>
              <b>Watch the demo</b>
              <span>A {DEMO.minutes}-minute walkthrough of Closingly</span>
            </span>
          </span>
          <span className={styles.sound} aria-hidden="true">
            <SoundIcon />
            <span>{phase === "opening" ? "Loading the demo" : "Play with sound"}</span>
          </span>
        </button>
      )}

      {Player && mount && (
        <div ref={playerRef} className={styles.player} data-demo="" data-armed={phase === "demo" ? undefined : ""}>
          <Player autoPlay={mount === "asked"} onPlaying={onDemoPlaying} />
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5.6v12.8a1 1 0 0 0 1.52.85l10.2-6.4a1 1 0 0 0 0-1.7L9.52 4.75A1 1 0 0 0 8 5.6Z" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      <path d="M22 9l-6 6M16 9l6 6" />
    </svg>
  );
}
