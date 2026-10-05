# Third-party disclosure register

What each third party receives from closingly.app, with the evidence and the
date it was last verified. The Privacy Policy (`src/content/privacy.html`,
sections 2 and 7) must agree with this table; update both in the same change
whenever a provider, cookie or loading behaviour changes.

| Provider | Loads / receives | When | Cookies | Region | Evidence | Verified |
|---|---|---|---|---|---|---|
| Cloudflare (Workers, Static Assets) | Every request; beta applications at `/api/apply` | Always | None set by the site | Global | `wrangler.jsonc`, `worker/index.ts` | 2026-10-05 (static) |
| Cloudflare Turnstile | Browser signals, IP | Beta page, first focus or touch of the form | Not verified | Global | `src/components/beta/BetaForm.tsx` (`challenges.cloudflare.com`) | 2026-10-05 (static) |
| Cloudflare Web Analytics | Page views, referrer, browser, country | Only if enabled on the zone in the dashboard (not in this code) | None | Global | Dashboard setting, not in source | Not verified |
| Supabase | Beta applications (name, email, role, calls, country, time zone, source, referrer), sent by the Worker | On submit | None | Singapore | `worker/index.ts` | 2026-10-05 (static) |
| Mux (video + Mux Data) | IP, browser, playback metrics | Only after the visitor presses play | None (`disableCookies`) | United States | `src/components/home/hero/DemoPlayer.tsx` | 2026-10-05 (static) |
| Google Analytics 4 | Page views, events, approximate location; consent-gated in EEA/UK/CH | After first interaction or ~5 s after load, live host only | `_ga`, `_ga_9S64ZB03KB`, 13 months (after consent in opt-in regions) | United States | `public/analytics.js` | 2026-10-05 (static) |

Removed in the Next.js rebuild: Vimeo (demo video) and cdnjs (Lottie player on the beta page).
