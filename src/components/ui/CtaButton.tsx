import Link from "next/link";
import styles from "./CtaButton.module.css";

type Common = {
  children: React.ReactNode;
  className?: string;
};

type LinkProps = Common & {
  href: string;
  /** "nav" is the compact header button with the ↗ arrow. */
  size?: "default" | "nav";
};

/** The orange call to action: a gradient rim around a glowing orange face. */
export function CtaButton({ href, children, size = "default", className = "" }: LinkProps) {
  return (
    <Link href={href} className={`${styles.cta} ${size === "nav" ? styles.nav : ""} ${className}`}>
      <span className={styles.face}>
        <span className={styles.label}>{children}</span>
        {size === "nav" && (
          <span className={styles.arrow} aria-hidden="true">
            ↗
          </span>
        )}
      </span>
    </Link>
  );
}

/**
 * The same button submitting a form, full width. While `busy` it greys out,
 * shows a spinner and keeps a slow light moving across it.
 */
export function SubmitButton({ children, busy, className = "" }: Common & { busy: boolean }) {
  return (
    <button type="submit" className={`${styles.cta} ${styles.form} ${className}`} disabled={busy} aria-busy={busy}>
      <span className={styles.face}>
        {busy && <i className={styles.spinner} aria-hidden="true" />}
        <span className={styles.label}>{children}</span>
      </span>
    </button>
  );
}
