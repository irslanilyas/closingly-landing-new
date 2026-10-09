// The welcome email a new beta applicant gets, sent through Resend from the
// admin@closingly.app address (the founders' shared inbox, so replies land there).
// Kept plain on purpose: a note from a person, no images, no tracking.

const FROM = "Atif from Closingly <admin@closingly.app>";
const DISCORD = "https://discord.gg/nD3QVNRsMC";
const WHATSAPP = "https://chat.whatsapp.com/GhpCcBpFaiDKApBxF1AXz9";

export interface WelcomeEnv {
  /** Secret. Set with `wrangler secret put RESEND_API_KEY`. Without it no welcome email is sent. */
  RESEND_API_KEY?: string;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The first word of what they typed, as a name. All-lowercase or all-capitals
 * input gets a capital first letter; anything mixed ("McDonald") is left alone.
 * Returns "there" when no usable word is found.
 */
export function firstName(full: string): string {
  const word = full.match(/\p{L}[\p{L}\p{M}'’-]*/u)?.[0].slice(0, 40);
  if (!word) return "there";
  const plain = word === word.toLowerCase() || word === word.toUpperCase();
  return plain ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word;
}

export function welcomeEmail(fullName: string): { subject: string; html: string; text: string } {
  const name = firstName(fullName);
  const subject = `hey ${name}, you are a Closingly Founding Member 🧡`;

  const paragraphs = [
    "First off, thank you for giving Closingly a shot. It genuinely means a lot to us, especially at this early stage.",
    "We're a small team building Closingly, and we'd love to stay connected with you, hear what you think, and involve you in what we build next.",
    "We've created two small communities where you can share feedback, ask questions, get updates, or just chat with us directly. Both are optional.",
  ];
  const closing = [
    "Join whichever you prefer. We'd love to have you there!",
    "Your application is in. We'll email you as soon as your spot opens.",
    "Thanks again for being one of our early users. 🧡",
  ];
  const footer = "You're getting this because you applied for the Closingly beta at closingly.app. Just reply to this email if you have a question.";

  const p = (s: string) => `<p style="margin:0 0 16px">${escapeHtml(s)}</p>`;
  const link = (href: string, label: string) =>
    `<a href="${href}" style="color:#ff4601;text-decoration:underline">${label}</a>`;

  const html =
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#232522;max-width:560px">` +
    `<p style="margin:0 0 16px">Hey ${escapeHtml(name)},</p>` +
    paragraphs.map(p).join("") +
    `<p style="margin:0 0 16px">${link(DISCORD, "Discord Community")}<br>${link(WHATSAPP, "WhatsApp Community")}</p>` +
    closing.map(p).join("") +
    `<p style="margin:0 0 24px">Atif<br>Co-founder, Closingly</p>` +
    `<p style="margin:0;font-size:12px;color:#7a7f73">${escapeHtml(footer)}</p>` +
    `</div>`;

  const text = [
    `Hey ${name},`,
    ...paragraphs,
    `Discord Community: ${DISCORD}\nWhatsApp Community: ${WHATSAPP}`,
    ...closing,
    "Atif\nCo-founder, Closingly",
    footer,
  ].join("\n\n");

  return { subject, html, text };
}

async function idempotencyKey(email: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  return "beta-welcome-" + [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Never throws and never blocks a signup: a failed email is logged and nothing more. */
export async function sendWelcome(env: WelcomeEnv, name: string, email: string): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  try {
    const { subject, html, text } = welcomeEmail(name);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        // The same address cannot be welcomed twice within Resend's window, even if a retry slips through.
        "Idempotency-Key": await idempotencyKey(email),
      },
      body: JSON.stringify({ from: FROM, to: [email], subject, html, text }),
    });
    if (!res.ok) console.error("welcome email failed", res.status, await res.text());
  } catch (err) {
    console.error("welcome email failed", err instanceof Error ? err.message : err);
  }
}
