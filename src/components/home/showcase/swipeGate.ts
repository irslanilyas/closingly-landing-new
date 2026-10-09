/**
 * One swipe, one feature, however hard the swipe.
 *
 * The snap stops (Showcase.module.css) catch a gentle swipe, but Chrome on
 * Android ignores `scroll-snap-stop: always` once a fling has real speed, so a
 * hard flick from the top blew straight through every card. This gate watches a
 * swipe's momentum and, when it reaches the next stop in its direction, parks
 * the page exactly there. The stop is measured from where the swipe began, so a
 * hard flick moves one card, never two.
 *
 * It only ever acts after the finger has lifted, never while it is down, and it
 * has no stop to enforce past the last card or before the first, so the page
 * always scrolls on freely from both ends. iPhones keep the native snapping:
 * Safari honours `scroll-snap-stop` for flings.
 */
export function installSwipeGate(snaps: HTMLElement): () => void {
  if (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform))) {
    return () => {};
  }
  const html = document.documentElement;
  // Long enough for the leftover momentum to die once it is parked.
  const HOLD = 900;

  let touching = false;
  let swiping = false;
  let startY = 0;
  let from = 0;
  let dir = 0;
  let wall: number | null = null;
  let parked = false;
  let unlockTimer = 0;
  let settleTimer = 0;

  const stops = () => [...snaps.querySelectorAll("i")].map((mark) => Math.round(mark.getBoundingClientRect().top + scrollY));
  const active = () => getComputedStyle(snaps).display !== "none";

  const unlock = () => {
    clearTimeout(unlockTimer);
    html.style.overflowY = "";
    parked = false;
  };
  // Momentum stops when the page cannot scroll; the position is set while it cannot.
  const park = () => {
    if (parked || wall === null) return;
    const target = wall;
    parked = true;
    wall = null;
    dir = 0;
    html.style.overflowY = "hidden";
    scrollTo({ top: target, behavior: "instant" });
    unlockTimer = window.setTimeout(unlock, HOLD);
  };
  const past = () => wall !== null && (dir > 0 ? scrollY >= wall : scrollY <= wall);

  const onStart = (e: TouchEvent) => {
    if (parked) unlock();
    clearTimeout(settleTimer);
    touching = true;
    swiping = false;
    wall = null;
    dir = 0;
    startY = e.touches[0].clientY;
    from = scrollY;
  };
  const onMove = (e: TouchEvent) => {
    if (Math.abs(e.touches[0].clientY - startY) > 12) swiping = true;
  };
  const onEnd = () => {
    touching = false;
    if (!swiping || !active() || Math.abs(scrollY - from) < 6) return;
    dir = scrollY > from ? 1 : -1;
    const all = stops();
    wall = (dir > 0 ? all.find((y) => y > from + 4) : [...all].reverse().find((y) => y < from - 4)) ?? null;
    // Momentum normally reaches the stop by itself; a lift with none is settled here.
    settleTimer = window.setTimeout(() => past() && park(), 140);
  };
  const onScroll = () => {
    if (!touching && !parked && past()) park();
  };

  addEventListener("touchstart", onStart, { passive: true });
  addEventListener("touchmove", onMove, { passive: true });
  addEventListener("touchend", onEnd, { passive: true });
  addEventListener("scroll", onScroll, { passive: true });
  return () => {
    removeEventListener("touchstart", onStart);
    removeEventListener("touchmove", onMove);
    removeEventListener("touchend", onEnd);
    removeEventListener("scroll", onScroll);
    clearTimeout(settleTimer);
    unlock();
  };
}
