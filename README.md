# closingly.app

The Closingly landing site: Next.js 16 (App Router) exported as static files and
served from Cloudflare Workers Static Assets. The only server code is the beta
application endpoint in `worker/`.

## Develop

```bash
npm ci
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck    # site and worker
npm run build        # static export to out/, then out/_headers (CSP, caching)
```

## How it is put together

| Path | What it is |
|---|---|
| `src/app/` | Routes: `/`, `/beta`, `/privacy`, `/terms`, 404, sitemap, robots |
| `src/components/home/` | The home page sections, one folder or file per section |
| `src/components/home/showcase/` | The sticky six-feature showcase and its animated product art |
| `src/components/beta/` | The beta application form (Turnstile, then `/api/apply`) |
| `src/content/` | Privacy Policy and Terms as plain HTML, read at build time |
| `worker/index.ts` | `/api/apply`: validates, verifies Turnstile, calls Supabase `apply_for_beta` |
| `public/analytics.js` | GA4 with Consent Mode v2 and the cookie notice; gtag loads after first interaction |
| `scripts/build-images.mjs` | AVIF + WebP at display sizes, content-hashed, into `public/img/` and `src/generated/images.ts` |
| `scripts/build-media.sh` | The 15 s hero loop and posters (ffmpeg) |
| `scripts/build-fonts.py` | Subsets the fonts and draws the wordmark as a path |
| `scripts/build-headers.mjs` | Writes `out/_headers`: per-page CSP with hashed inline scripts, HSTS, cache rules |
| `disclosures-register.md` | Every third party the site uses, kept in step with the Privacy Policy |

The full demo video streams from Mux (Video.js 10 player, loaded only when a
visitor presses play). Originals for images and fonts live in `assets-src/`.

## Deploy

Secrets are never stored in the repository. Set the Turnstile secret once per
Worker:

```bash
npx wrangler secret put TURNSTILE_SECRET --env preview   # preview
npx wrangler secret put TURNSTILE_SECRET                 # production
```

The public Turnstile site key is in `src/lib/site.ts`; the widget allows
closingly.app and the preview hostname.

```bash
npm run deploy:preview   # closingly-landing-preview on workers.dev, noindex
npm run deploy           # closingly.app
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, build, a production
dependency audit and Lighthouse on every push and pull request.
