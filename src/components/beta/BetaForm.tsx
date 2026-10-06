"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { SubmitButton } from "@/components/ui/CtaButton";
import { noteArrival } from "@/lib/arrival";
import { trackLead } from "@/lib/analytics";
import { SITE } from "@/lib/site";
import { CALLS, COUNTRY_CODES, ROLES, ZONE_COUNTRY } from "./countries";
import { sparks } from "./sparks";
import { Success } from "./Success";
import s from "./BetaForm.module.css";

const TURNSTILE_SITE_KEY = SITE.turnstileSiteKey;
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

/* The success animation (a paper plane that turns into a check) loads while the
   form is being filled in, so it is ready the moment the spot is saved. */
type LottiePlayer = typeof import("lottie-web/build/player/lottie_light").default;
let lottieLoad: Promise<[LottiePlayer, object]> | null = null;
const stillMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function loadLottie() {
  if (stillMotion()) return null;
  lottieLoad ??= Promise.all([
    import("lottie-web/build/player/lottie_light").then((m) => m.default),
    fetch("/lottie/complete.json").then((r) => r.json() as Promise<object>),
  ]);
  lottieLoad.catch(() => (lottieLoad = null));
  return lottieLoad;
}

/** The file sends the plane, turns it into a check by frame 84, then loops back. It rests on the check. */
const CHECK_FRAME = 84;
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

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
  const [sending, setSending] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const pendingToken = useRef<{ resolve: (t: string) => void; reject: (e: unknown) => void } | null>(null);

  // The form steps back and blurs, the plane flies and lands as a check, then the check
  // settles into the corner of the note that replaces the form.
  const celebrate = async (applicant: Applicant) => {
    const wrap = stage.current;
    const box = plane.current;
    const assets = await loadLottie()?.catch(() => null);
    if (!wrap || !box || !assets) return setDone(applicant);
    wrap.style.minHeight = `${wrap.offsetHeight}px`;
    if (wrap.getBoundingClientRect().top < 0) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
    setSending(true);

    const [lottie, animationData] = assets;
    const size = Math.min(240, wrap.clientWidth * 0.6);
    const x = (wrap.clientWidth - size) / 2;
    const y = Math.max(0, Math.min(wrap.clientHeight, innerHeight) / 2 - size / 2);
    Object.assign(box.style, { width: `${size}px`, height: `${size}px` });
    const centre = `translate(${x}px, ${y}px)`;
    const player = lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false, animationData });
    player.setSpeed(1.2);
    box.animate(
      [
        { opacity: 0, transform: `${centre} scale(0.6)` },
        { opacity: 1, transform: `${centre} scale(1)` },
      ],
      { duration: 700, delay: 420, easing: SPRING, fill: "both" },
    );
    let burst = false;
    player.addEventListener("enterFrame", (e) => {
      if (!burst && (e as unknown as { currentTime: number }).currentTime >= 60) {
        burst = true;
        sparks(wrap, x + size / 2, y + size / 2, s.spark);
      }
    });
    player.addEventListener("complete", () => {
      player.goToAndStop(CHECK_FRAME, true);
      const badge = innerWidth < 768 ? 76 : 88;
      const scale = badge / size;
      // Scale stays about the centre, so the corner position accounts for the shrink.
      const corner = `translate(${-12 - (size - badge) / 2}px, ${-10 - (size - badge) / 2}px) scale(${scale})`;
      box.animate([{ transform: `${centre} scale(1)` }, { transform: corner }], { duration: 800, easing: EASE_OUT, fill: "forwards" });
      setCelebrated(true);
      setSending(false);
      setDone(applicant);
    });
    window.setTimeout(() => player.playSegments([0, CHECK_FRAME], true), 420);
  };

  const prepareTurnstile = () => {
    loadLottie();
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
    if (data.get("website")) return void celebrate(applicant);
    setBusy(true);
    try {
      const arrival = noteArrival();
      const code = String(data.get("country"));
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...applicant,
          ...arrival,
          calls: data.get("calls"),
          country: code,
          countryName: new Intl.DisplayNames(["en"], { type: "region" }).of(code),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
          token: await token(),
        }),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      // The conversion that matters. No name or email is sent.
      trackLead({
        lead_source: arrival.source || arrival.referrer || arrival.inApp || "direct",
        role: applicant.role,
        calls_per_month: String(data.get("calls")),
      });
      await celebrate(applicant);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  const fields = (
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
        <SubmitButton className={s.apply} busy={busy}>
          {busy ? (
            "Saving your spot…"
          ) : (
            <>
              Get Free Beta Access <span aria-hidden="true">↗</span>
            </>
          )}
        </SubmitButton>
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

  return (
    <div ref={stage} className={s.stage} data-sending={sending ? "" : undefined}>
      <div ref={plane} className={s.plane} aria-hidden="true" />
      {done ? <Success applicant={done} animated={celebrated} /> : fields}
    </div>
  );
}
