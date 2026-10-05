import { CtaButton } from "@/components/ui/CtaButton";
import { Picture } from "@/components/ui/Picture";
import section from "./section.module.css";
import s from "./FoundingBeta.module.css";

const PERKS = [
  ["Free beta access", "Direct influence on the product", "Founding-user status"],
  ["Early access to new features", "Priority support"],
];

export function FoundingBeta() {
  return (
    <section id="founding-beta" className={s.section} aria-labelledby="beta-title">
      <Picture
        name="foundingBeta"
        sizes="(max-width: 1000px) 200vw, 1276px"
        mobile={{ name: "foundingBetaMobile", sizes: "100vw" }}
        className={s.bg}
      />
      <div className={s.content}>
        <div className={s.intro} data-reveal="">
          <p className={section.eyebrow}>A SMALL COHORT. A BIG SAY.</p>
          <h2 id="beta-title" className={s.title}>
            Built with you. <span className={s.line}>Better because of you.</span>
          </h2>
          <p className={s.lede}>
            We’re opening Closingly to 200 founding users. Freelancers, consultants, agencies, coaches, and service
            businesses who regularly take sales calls and send proposals.
          </p>
        </div>
        <div className={s.perks} data-reveal="" style={{ "--reveal-delay": "70ms" } as React.CSSProperties}>
          {PERKS.map((column) => (
            <ul key={column[0]}>
              {column.map((perk) => (
                <li key={perk}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
                  <img src="/icons/check-badge.svg" alt="" width={22} height={22} loading="lazy" />
                  {perk}
                </li>
              ))}
            </ul>
          ))}
        </div>
        <div data-reveal="" style={{ "--reveal-delay": "140ms" } as React.CSSProperties}>
          <CtaButton href="/beta">
            Get Free Beta Access
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
