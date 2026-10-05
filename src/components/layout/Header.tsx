import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CtaButton } from "@/components/ui/CtaButton";
import motion from "@/styles/motion.module.css";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={`${styles.header} ${motion.fadeIn}`}>
      <Logo />
      <nav className={styles.nav} aria-label="Main">
        <Link className={styles.link} href="/#workspace-features">
          The platform
        </Link>
        <Link className={styles.link} href="/#how-it-works">
          How it works
        </Link>
        <Link className={styles.link} href="/#founding-beta" aria-label="Founding beta, 200 spots">
          Founding beta
          <span className={styles.badge} aria-hidden="true">
            200
          </span>
        </Link>
      </nav>
      <CtaButton href="/beta" size="nav">
        Get early access
      </CtaButton>
    </header>
  );
}
