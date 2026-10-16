export const SITE = {
  url: "https://closingly.app",
  name: "Closingly",
  email: "hello@closingly.app",
  ogImage: "/og-image.jpg",
  linkedin: "https://www.linkedin.com/company/closingly",
  /** Public by design. The matching secret lives only in the Worker (TURNSTILE_SECRET). */
  turnstileSiteKey: "0x4AAAAAAFOcKkbvDUI7SjGv",
} as const;
