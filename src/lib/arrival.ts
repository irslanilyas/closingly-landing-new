/**
 * Where a visit came from, read from the link itself: its utm tags, the ?ref=
 * of a shared link, an ad click ID, the in-app browser it opened in, and the
 * site that linked here. Noted once, on the visit's first page, and kept in
 * memory only: the site moves between pages without reloading, so it is still
 * here when the visitor applies, and nothing is stored on their device. The
 * database turns it into "came from" and "channel" (classify_arrival).
 */
export type Arrival = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  clickId: string | null;
  inApp: string | null;
  referrer: string | null;
};

/** Ad click IDs (Google, Microsoft, Meta, LinkedIn, X, TikTok, Reddit). Only the name is kept, never the value. */
const CLICK_IDS = ["gclid", "gbraid", "wbraid", "dclid", "msclkid", "fbclid", "li_fat_id", "twclid", "ttclid", "rdt_cid"];

/** In-app browsers that often send no referrer, known by their user agent. Instagram's also mentions Facebook, so it goes first. */
const IN_APP: [RegExp, string][] = [
  [/LinkedInApp/i, "LinkedIn"],
  [/Instagram/i, "Instagram"],
  [/Barcelona/, "Threads"],
  [/FBAN|FBAV|FB_IAB/, "Facebook"],
  [/musical_ly|Bytedance|TikTok/i, "TikTok"],
  [/Snapchat/i, "Snapchat"],
  [/Pinterest/i, "Pinterest"],
];

const clip = (value: string | null) => value?.trim().slice(0, 100) || null;

function read(): Arrival {
  const params = new URLSearchParams(location.search);
  let referrer: string | null = null;
  try {
    const host = document.referrer ? new URL(document.referrer).hostname : "";
    if (host && host !== location.hostname) referrer = host.slice(0, 200);
  } catch {}
  return {
    source: clip(params.get("utm_source") || params.get("ref")),
    medium: clip(params.get("utm_medium")),
    campaign: clip(params.get("utm_campaign")),
    clickId: CLICK_IDS.find((id) => params.has(id)) ?? null,
    inApp: IN_APP.find(([agent]) => agent.test(navigator.userAgent))?.[1] ?? null,
    referrer,
  };
}

let first: Arrival | null = null;

/** Notes the arrival on the visit's first page; later calls return what was noted. */
export function noteArrival(): Arrival {
  return (first ??= read());
}
