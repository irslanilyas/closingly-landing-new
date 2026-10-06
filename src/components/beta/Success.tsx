"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Applicant } from "./BetaForm";
import { sparks } from "./sparks";
import s from "./BetaForm.module.css";

const WISHES: Record<string, string> = {
  freelancer: "Until then, may every client say “sounds great, send it over” and actually mean it.",
  consultant: "Until then, may every discovery call end with the client asking what the next steps are.",
  agency: "Until then, may no client ask for “one small change” after sign-off.",
  founder: "Until then, may every follow-up you send get a reply the same day.",
  other: "Until then, may every proposal you send get a yes faster than you filled in this form.",
};

/**
 * The note that replaces the form. After the paper plane animation, its check
 * already sits in the corner; without it, a drawn check and a few sparks stand in.
 */
export function Success({ applicant, animated = false }: { applicant: Applicant; animated?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [shareLabel, setShareLabel] = useState("Send this to a friend who hates writing proposals");
  const firstName = applicant.name.split(/\s+/)[0] || "friend";

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
    if (animated || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const badge = el.querySelector<HTMLElement>("[data-badge]");
    if (!badge) return;
    const timer = window.setTimeout(() => sparks(badge, badge.offsetWidth / 2, badge.offsetHeight / 2, s.spark, { count: 18, reach: 46 }), 520);
    return () => clearTimeout(timer);
  }, [animated]);

  const share = async () => {
    const url = "https://closingly.app/beta?ref=friend";
    const text = "Closingly turns your sales calls into ready-to-send proposals. The founding beta is free:";
    try {
      if (navigator.share) return void (await navigator.share({ title: "Closingly founding beta", text, url }));
      await navigator.clipboard.writeText(url);
      setShareLabel("Link copied. Go make their evening easier.");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") setShareLabel(url);
    }
  };

  return (
    <div ref={root} className={`${s.done} ${animated ? s.afterPlane : ""}`} tabIndex={-1} role="status">
      {!animated && (
        <span className={s.badge} data-badge="" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" />
            <path d="M20 33.5l8 8 16-17" />
          </svg>
        </span>
      )}
      <h2>You’re in, {firstName}.</h2>
      <p className={s.lead}>
        Your founding beta spot is saved. We’ll email <strong>{applicant.email}</strong> the moment it’s ready.
      </p>
      <p className={s.empathy}>
        We know the hours after a good call are the ones nobody sees. We’re building Closingly to give them back.
      </p>
      <p className={s.wish}>{WISHES[applicant.role] ?? WISHES.other}</p>
      <div className={s.actions}>
        <button type="button" className={s.share} onClick={share}>
          {shareLabel}
        </button>
        <Link className={s.back} href="/">
          <span aria-hidden="true">←</span> Back to Closingly
        </Link>
      </div>
    </div>
  );
}
