/** The full product demo, hosted on Mux. Public playback policy. */
export const DEMO = {
  playbackId: "01jR6H4kZKLloFY5iOOGbTTIJZe300EhhGoN027WORuTCk",
  title: "Closingly demo",
  minutes: 4,
} as const;

/** The 15 second muted loop (0:31 to 0:46 of the demo) that plays on arrival. */
export const PREVIEW_SRC = "/media/hero-preview.mp4";

/** Fired by any "Watch the demo" control; the hero video listens for it. */
export const PLAY_DEMO_EVENT = "closingly:play-demo";

/** Starts fetching the player on intent (hover, touch, focus), so a click finds it ready. */
export const loadDemoPlayer = () => import("./DemoPlayer");
