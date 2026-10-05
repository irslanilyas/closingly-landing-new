import { preload } from "react-dom";
import { CtaButton } from "@/components/ui/CtaButton";
import { HeroVideo } from "./HeroVideo";
import { WatchDemoButton } from "./WatchDemoButton";
import motion from "@/styles/motion.module.css";
import styles from "./Hero.module.css";

export function Hero() {
  // The poster is the largest thing on screen at load: fetch it from <head>.
  preload("/media/hero-poster-1280.avif", {
    as: "image",
    type: "image/avif",
    imageSrcSet: "/media/hero-poster-640.avif 640w, /media/hero-poster-960.avif 960w, /media/hero-poster-1280.avif 1280w",
    imageSizes: "(min-width: 1324px) 1274px, calc(100vw - 32px)",
    fetchPriority: "high",
  });
  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.content}>
        <div className={styles.copy}>
          <a className={`${styles.pill} ${motion.riseIn}`} href="#founding-beta">
            <span className={styles.dot} aria-hidden="true" />
            Founding Beta Cohort
            <span className={styles.divider} aria-hidden="true" />
            200 Free Spots
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          </a>
          <h1 id="hero-title" className={`${styles.title} ${motion.riseInSoft}`}>
            Turn every sales call into a deal that <em>moves forward.</em>
          </h1>
          <p className={`${styles.sub} ${motion.riseInSoft}`}>
            Closingly captures your sales conversations, turns them into deals automatically, helps
            generate proposals, tracks client engagement, and shows you what to do next.
          </p>
        </div>
        <div className={styles.actions}>
          <CtaButton href="/beta" className={`${styles.cta} ${motion.riseIn}`}>
            Get Free Beta Access
          </CtaButton>
          <WatchDemoButton />
        </div>
      </div>
      <HeroVideo />
    </section>
  );
}
