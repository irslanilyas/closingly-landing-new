import Link from "next/link";
import styles from "./CtaButton.module.css";

type Props = {
  href: string;
  children: React.ReactNode;
  /** "nav" is the compact header button with the ↗ arrow. */
  size?: "default" | "nav";
  className?: string;
};

/** The orange call to action: a gradient rim around a glowing orange face. */
export function CtaButton({ href, children, size = "default", className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`${styles.cta} ${size === "nav" ? styles.nav : ""} ${className}`}
    >
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
