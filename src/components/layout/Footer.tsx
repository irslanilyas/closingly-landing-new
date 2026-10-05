import Link from "next/link";
import s from "./Footer.module.css";

export function Footer({ overlay = true }: { overlay?: boolean }) {
  return (
    <footer className={`${s.footer} ${overlay ? s.overlay : ""}`}>
      <p>© 2026 Closingly. All rights reserved.</p>
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
