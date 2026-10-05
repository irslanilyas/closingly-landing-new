"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { CALLS, COUNTRY_CODES, ROLES, ZONE_COUNTRY } from "./countries";
import { Success } from "./Success";
import s from "./BetaForm.module.css";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let turnstileLoad: Promise<Turnstile> | null = null;
/** Turnstile loads on the first touch of the form, not with the page. */
function loadTurnstile() {
  turnstileLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    script.onerror = reject;
    document.head.append(script);
  });
  return turnstileLoad;
}

export type Applicant = { name: string; email: string; role: string };

// Country names and the visitor's likely country exist only in the browser: the
// server renders an empty list, the browser fills it in after hydration.
type Country = { code: string; name: string };
const NO_COUNTRIES: Country[] = [];
let countryList: Country[] | null = null;
const countriesSnapshot = () => {
  if (!countryList) {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    countryList = COUNTRY_CODES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }
  return countryList;
};
let likelyCountry: string | null = null;
const likelyCountrySnapshot = () => {
  if (likelyCountry === null) {
    let zone = "";
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    } catch {}
    const fromLocale = navigator.languages
      ?.map((tag) => {
        try {
          return new Intl.Locale(tag).maximize().region;
        } catch {
          return undefined;
        }
      })
      .find(Boolean);
    const guess = ZONE_COUNTRY[zone] ?? fromLocale ?? "";
    likelyCountry = COUNTRY_CODES.includes(guess) ? guess : "";
  }
  return likelyCountry;
};
const noSubscription = () => () => {};

export function BetaForm() {
  const countries = useSyncExternalStore(noSubscription, countriesSnapshot, () => NO_COUNTRIES);
  const likely = useSyncExternalStore(noSubscription, likelyCountrySnapshot, () => "");
  const [picked, setPicked] = useState<string | null>(null);
  const country = picked ?? likely;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [done, setDone] = useState<Applicant | null>(null);
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const pendingToken = useRef<{ resolve: (t: string) => void; reject: (e: unknown) => void } | null>(null);

  const prepareTurnstile = () => {
    if (!TURNSTILE_SITE_KEY || widgetId.current !== null) return;
    loadTurnstile()
      .then((ts) => {
        if (widgetId.current !== null || !widget.current) return;
        widgetId.current = ts.render(widget.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: "apply",
          appearance: "interaction-only",
          execution: "execute",
          callback: (token: string) => pendingToken.current?.resolve(token),
          "error-callback": () => pendingToken.current?.reject(new Error("turnstile")),
        });
      })
      .catch(() => {});
  };

  const token = async (): Promise<string | null> => {
    if (!TURNSTILE_SITE_KEY) return null;
    prepareTurnstile();
    const ts = await loadTurnstile();
    for (let i = 0; i < 50 && widgetId.current === null; i++) await new Promise((r) => setTimeout(r, 50));
    if (widgetId.current === null) throw new Error("turnstile");
    return new Promise((resolve, reject) => {
      pendingToken.current = { resolve, reject };
      ts.reset(widgetId.current!);
      ts.execute(widgetId.current!);
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    const data = new FormData(event.currentTarget);
    const applicant = {
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim().toLowerCase(),
      role: String(data.get("role")),
    };
    // A filled honeypot means a bot: act as if it worked and store nothing.
    if (data.get("website")) return setDone(applicant);
    setBusy(true);
    try {
      const params = new URLSearchParams(location.search);
      const referrerHost = (() => {
        try {
          const host = document.referrer ? new URL(document.referrer).hostname : "";
          return host && host !== location.hostname ? host.slice(0, 200) : null;
        } catch {
          return null;
        }
      })();
      const code = String(data.get("country"));
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...applicant,
          calls: data.get("calls"),
          country: code,
          countryName: new Intl.DisplayNames(["en"], { type: "region" }).of(code),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
          source: (params.get("utm_source") || params.get("ref") || "").slice(0, 100) || null,
          referrer: referrerHost,
          token: await token(),
        }),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      // The conversion that matters (a key event in Google Analytics). No name or email is sent.
      window.gtag?.("event", "generate_lead", {
        lead_source: params.get("utm_source") || params.get("ref") || referrerHost || "direct",
        role: applicant.role,
        calls_per_month: String(data.get("calls")),
      });
      setDone(applicant);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  if (done) return <Success applicant={done} />;

  return (
    <>
      <div className={s.intro}>
        <p className={s.cohort}>
          <span aria-hidden="true" /> FOUNDING BETA
        </p>
        <h1 id="form-heading">
          Make your <br />
          next move <em>with us.</em>
        </h1>
        <p>
          Get free early access to Closingly.
          <br />
          Tell us a little about yourself to get started.
        </p>
      </div>
      <form className={s.form} onSubmit={submit} onFocus={prepareTurnstile} onPointerDown={prepareTurnstile}>
        <div className={s.field}>
          <label htmlFor="full-name">Name</label>
          <input id="full-name" name="name" type="text" autoComplete="name" placeholder="Your full name" required maxLength={120} />
        </div>
        <div className={s.field}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" required maxLength={254} />
        </div>
        <fieldset className={s.field}>
          <legend>What best describes you?</legend>
          <div className={s.roles}>
            {ROLES.map((r) => (
              <label key={r.value} className={s.chip}>
                <input type="radio" name="role" value={r.value} required />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={s.field}>
          <legend>How many sales calls do you take a month?</legend>
          <div className={s.calls}>
            {CALLS.map((c) => (
              <label key={c.value} className={s.chip}>
                <input type="radio" name="calls" value={c.value} required />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className={s.field}>
          <label htmlFor="country">Country</label>
          <div className={s.select}>
            <select id="country" name="country" autoComplete="country" required value={country} onChange={(e) => setPicked(e.target.value)}>
              <option value="" disabled>
                Select your country
              </option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={s.honeypot} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div ref={widget} className={s.turnstile} />
        <button className={s.apply} type="submit" disabled={busy} aria-busy={busy}>
          <span>
            {busy ? "Saving your spot…" : "Get Free Beta Access"} <span aria-hidden="true">↗</span>
          </span>
        </button>
        <p className={s.note}>
          Free during the beta. No card, no spam, one email when your spot opens. By applying you agree to our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        {error && (
          <p className={s.status} role="alert">
            That didn’t go through. Check your connection and try again. If it keeps happening, email{" "}
            <a href="mailto:hello@closingly.app">hello@closingly.app</a> and we’ll add you ourselves.
          </p>
        )}
      </form>
    </>
  );
}
