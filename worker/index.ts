// The site is static files on Workers Static Assets. This Worker runs only for
// /api/* (see run_worker_first in wrangler.jsonc); every other request is served
// straight from the asset store.
import { CALLS, COUNTRY_CODES, ROLES } from "../src/components/beta/countries";

interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  /** Secret. Set with `wrangler secret put TURNSTILE_SECRET`. Without it, applications are refused. */
  TURNSTILE_SECRET?: string;
  APPLY_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const MAX_BODY = 4096;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,63}$/;
const ROLE_VALUES = new Set<string>(ROLES.map((r) => r.value));
const CALL_VALUES = new Set<string>(CALLS.map((c) => c.value));
const COUNTRIES = new Set(COUNTRY_CODES);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const optional = (v: unknown, max: number) => text(v, max) || null;

async function verifyTurnstile(token: string, ip: string, secret: string, hostname: string) {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!res.ok) return false;
  const out = (await res.json()) as { success: boolean; action?: string; hostname?: string };
  return out.success && out.action === "apply" && (out.hostname === hostname || hostname.endsWith(".workers.dev"));
}

async function apply(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
  // Same-origin only: the form posts from this site and nowhere else.
  if (request.headers.get("Origin") !== url.origin) return json(403, { error: "forbidden" });
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) return json(415, { error: "unsupported_media_type" });

  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  if (env.APPLY_LIMITER && !(await env.APPLY_LIMITER.limit({ key: ip || "unknown" })).success) {
    return json(429, { error: "too_many_requests" });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(413, { error: "too_large" });
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const name = text(input.name, 120);
  const email = text(input.email, 254).toLowerCase();
  const role = text(input.role, 20);
  const calls = text(input.calls, 10);
  const country = text(input.country, 2);
  if (!name || !EMAIL.test(email) || !ROLE_VALUES.has(role) || !CALL_VALUES.has(calls) || !COUNTRIES.has(country)) {
    return json(400, { error: "invalid_input" });
  }

  if (!env.TURNSTILE_SECRET) return json(503, { error: "not_configured" });
  const token = text(input.token, 2048);
  if (!token || !(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET, url.hostname))) {
    return json(403, { error: "challenge_failed" });
  }

  // apply_for_beta is the only thing the publishable key may call; a repeat email is ignored without an error.
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/apply_for_beta`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_email: email,
      p_name: name,
      p_role: role,
      p_calls_per_month: calls,
      p_country_code: country,
      p_country_name: optional(input.countryName, 80),
      p_timezone: optional(input.timezone, 64),
      // Where the applicant came from, as their link showed it. The database labels it (classify_arrival).
      p_source: optional(input.source, 100),
      p_referrer: optional(input.referrer, 200),
      p_medium: optional(input.medium, 100),
      p_campaign: optional(input.campaign, 100),
      p_click_id: optional(input.clickId, 20),
      p_in_app: optional(input.inApp, 40),
    }),
  });
  if (!res.ok) {
    console.error("apply_for_beta failed", res.status, await res.text());
    return json(502, { error: "upstream" });
  }
  return json(200, { ok: true });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/apply") return apply(request, env, url);
    if (url.pathname.startsWith("/api/")) return json(404, { error: "not_found" });
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
