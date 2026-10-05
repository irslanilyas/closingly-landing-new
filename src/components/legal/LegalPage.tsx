import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import s from "./LegalPage.module.css";

type Doc = "privacy" | "terms";

/** Privacy Policy and Terms: the text lives in src/content as plain HTML, read at build time. */
export function LegalPage({ doc }: { doc: Doc }) {
  const html = readFileSync(join(process.cwd(), "src", "content", `${doc}.html`), "utf8");
  return (
    <div className={s.page}>
      <header className={s.header}>
        <Logo className={s.brand} />
        <nav aria-label="Site">
          <Link href="/">Home</Link>
          <Link href="/beta">Join the beta</Link>
          <Link href="/privacy" aria-current={doc === "privacy" ? "page" : undefined}>
            Privacy
          </Link>
          <Link href="/terms" aria-current={doc === "terms" ? "page" : undefined}>
            Terms
          </Link>
        </nav>
      </header>
      {/* Our own static legal text, not user input. */}
      <main className={s.legal} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
