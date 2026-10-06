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
| Supabase | Beta applications (name, email, role, calls, country, time zone, and where the visitor came from: utm source/medium/campaign or `?ref=`, referrer host, the name of an ad click ID, the in-app browser), sent by the Worker | On submit | None | Singapore | `worker/index.ts`, `src/lib/arrival.ts` | 2026-10-06 (static) |
| Mux (video + Mux Data) | IP, browser, playback metrics | Only after the visitor presses play | None (`disableCookies`) | United States | `src/components/home/hero/DemoPlayer.tsx` | 2026-10-05 (static) |
| Microsoft Clarity | Session recordings, heatmaps, clicks and scrolls (typed text masked), referrer and utm tags, approximate location; consent-gated for European time zones | With GA4: after first interaction or ~5 s after load, live host only | `_clck` (1 year), `_clsk` (1 day), after consent where asked | United States | `public/analytics.js` (`CLARITY_ID`), `src/lib/analytics.ts` | 2026-10-06 (static) |
| Google Analytics 4 | Page views, events, approximate location; consent-gated in EEA/UK/CH | After first interaction or ~5 s after load, live host only | `_ga`, `_ga_9S64ZB03KB`, 13 months (after consent in opt-in regions) | United States | `public/analytics.js` | 2026-10-05 (static) |

Not yet in the Privacy Policy: Microsoft Clarity, and the arrival details stored with beta applications (the founders are rewriting the policy).

Removed in the Next.js rebuild: Vimeo (demo video) and cdnjs (Lottie player on the beta page).
