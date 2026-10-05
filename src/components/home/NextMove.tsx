import { CtaButton } from "@/components/ui/CtaButton";
import { Picture } from "@/components/ui/Picture";
import { Footer } from "@/components/layout/Footer";
import section from "./section.module.css";
import s from "./NextMove.module.css";

export function NextMove() {
  return (
    <section id="next-move" className={s.section} aria-labelledby="next-title">
      <Picture name="nextMove" sizes="(max-width: 1000px) 200vw, 1276px" className={s.bg} />
      <div className={s.content}>
        <div className={section.head} data-reveal="">
          <p className={section.eyebrow}>YOUR NEXT MOVE STARTS HERE</p>
          <h2 id="next-title" className={s.title}>
            Your next sales call could become your <em>next deal.</em>
          </h2>
        </div>
        <p className={s.lede} data-reveal="" style={{ "--reveal-delay": "70ms" } as React.CSSProperties}>
          Let Closingly turn the conversation into context, the context{" "}
          <span className={section.wideBreak}>into a deal, and the deal into the next move.</span>
        </p>
        <div data-reveal="" style={{ "--reveal-delay": "140ms" } as React.CSSProperties}>
          <CtaButton href="/beta">
            Get Free Beta Access
          </CtaButton>
        </div>
      </div>
      <Footer />
    </section>
  );
}
