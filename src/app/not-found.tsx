import type { Metadata } from "next";
import Link from "next/link";
import s from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found | Closingly",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className={s.main}>
      <p className={s.eyebrow}>404</p>
      <h1>This page moved on.</h1>
      <p>The link may be old or mistyped. The rest of Closingly is right where you left it.</p>
      <Link className={s.home} href="/">
        Back to Closingly
      </Link>
    </main>
  );
}
