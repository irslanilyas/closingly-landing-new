type GtagParams = Record<string, string | number | boolean>;
type Clarity = ((...args: unknown[]) => void) & { q?: IArguments[] };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: Clarity;
  }
}

/** Sends a GA4 event when analytics is running; a no-op everywhere else. */
export function track(event: string, params: GtagParams = {}) {
  window.gtag?.("event", event, params);
}

/**
 * Queues a Microsoft Clarity call. Clarity's tag (loaded late by
 * public/analytics.js, on the live site only) replays the queue when it
 * arrives; anywhere else the queue is simply never read.
 */
export function clarity(...args: unknown[]) {
  window.clarity ??= function () {
    // Clarity's own stub queues the arguments object, and its tag expects exactly that.
    // eslint-disable-next-line prefer-rest-params
    (window.clarity!.q ??= []).push(arguments);
  };
  window.clarity(...args);
}

/**
 * The conversion: a GA4 key event, and in Clarity an event that keeps the
 * session's recording and tags it with the applicant's role.
 */
export function trackLead(params: GtagParams & { role: string }) {
  track("generate_lead", params);
  clarity("set", "role", params.role);
  clarity("event", "beta_applied");
  clarity("upgrade", "beta_applied");
}
