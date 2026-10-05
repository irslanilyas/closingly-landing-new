import { Picture } from "@/components/ui/Picture";
import type { ImageName } from "@/generated/images";
import section from "./section.module.css";
import s from "./Audience.module.css";

const ROLES = ["Designer", "Coach", "Developer", "Freelancer", "Agency owner", "Consultant", "Copywriter"];
const PEOPLE = Array.from({ length: 20 }, (_, i) => ({
  image: `portrait${String(i + 1).padStart(2, "0")}` as ImageName,
  role: ROLES[i % ROLES.length],
}));

function Group({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className={s.group} aria-hidden={hidden || undefined} inert={hidden || undefined}>
      {PEOPLE.map((p) => (
        <li key={p.image}>
          <Picture name={p.image} sizes="(max-width: 1000px) 190px, 223px" alt={hidden ? "" : `${p.role} in an everyday workspace`} className={s.portrait} />
          <span>{p.role.toUpperCase()}</span>
        </li>
      ))}
    </ul>
  );
}

export function Audience() {
  return (
    <section id="audience" className={s.section} aria-labelledby="audience-title">
      <div className={section.head} data-reveal="">
        <p className={section.eyebrow}>SOUND FAMILIAR?</p>
        <h2 id="audience-title" className={section.title}>
          For people who sell <span className={section.wideBreak}>their expertise.</span>
        </h2>
      </div>
      {/* Two identical groups scroll as one seamless loop. */}
      <div className={s.ticker} data-motion="">
        <div className={s.track}>
          <Group />
          <Group hidden />
        </div>
      </div>
    </section>
  );
}
