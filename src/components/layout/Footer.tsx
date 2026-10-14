import Link from "next/link";
import s from "./Footer.module.css";

export function Footer({ overlay = true }: { overlay?: boolean }) {
  return (
    <footer className={`${s.footer} ${overlay ? s.overlay : ""}`}>
      <div className={s.left}>
        {/* Nick Launches keeps the listing live only while this badge is on the homepage. */}
        <a className={s.badge} href="https://nicklaunches.com/products/closingly/" target="_blank" rel="noopener">
          {/* eslint-disable-next-line @next/next/no-img-element -- their badge, served from their host */}
          <img
            src="https://nicklaunches.com/badges/featured.png"
            alt="Closingly on Nick Launches"
            width="244"
            height="56"
            loading="lazy"
            decoding="async"
          />
        </a>
        <p>© 2026 Closingly. All rights reserved.</p>
      </div>
      <nav aria-label="Footer">
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#faq">FAQ</Link>
        <Link href="/beta">Join the beta</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
        <button type="button" data-cookie-settings="">
          Cookie settings
        </button>
      </nav>
    </footer>
  );
}
