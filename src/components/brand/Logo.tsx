import Link from "next/link";
import { WORDMARK } from "./wordmark-path";
import styles from "./Logo.module.css";

/** The Closingly lockup: the mark and the wordmark, both vector, no web font. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`${styles.logo} ${className}`} aria-label="Closingly home">
      <Mark className={styles.mark} />
      <svg
        className={styles.wordmark}
        viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`}
        aria-hidden="true"
        focusable="false"
      >
        <path d={WORDMARK.d} />
      </svg>
    </Link>
  );
}

/** The orange mark on its own. Decorative everywhere it appears. */
export function Mark({ className = "", size }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a static SVG; next/image adds nothing here
    <img
      className={className}
      src="/brand/mark.svg"
      alt=""
      width={size ?? 41}
      height={size ?? 41}
      decoding="async"
      draggable={false}
    />
  );
}
