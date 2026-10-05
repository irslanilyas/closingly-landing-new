type GtagParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sends a GA4 event when analytics is running; a no-op everywhere else. */
export function track(event: string, params: GtagParams = {}) {
  window.gtag?.("event", event, params);
}
