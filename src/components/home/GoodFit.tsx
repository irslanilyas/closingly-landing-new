import { Mark } from "@/components/brand/Logo";
import { CtaButton } from "@/components/ui/CtaButton";
import s from "./GoodFit.module.css";

const ITEMS = [
  { text: "Take discovery or sales calls regularly", checked: true },
  { text: "Send proposals as part of your workflow", checked: false },
  { text: "Want more visibility into deals and pipeline", checked: true },
  { text: "Need help knowing what to do next", checked: false },
  { text: "Want AI assistance without giving up control", checked: false },
];

export function GoodFit() {
  return (
    <section id="good-fit" className={s.section} aria-labelledby="fit-title">
      <div className={s.intro} data-reveal="">
        <div className={s.introText}>
          <span className={s.icon}>
            <Mark className={s.iconMark} size={53} />
          </span>
          <h2 id="fit-title">Closingly is a good fit if you check any of these boxes.</h2>
        </div>
        <CtaButton href="/beta">
          Get Free Beta Access
        </CtaButton>
      </div>
      <div className={s.list}>
        {ITEMS.map((item, i) => (
          <label key={item.text} className={s.item} data-reveal="" style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
            <input type="checkbox" defaultChecked={item.checked} />
            {item.text}
          </label>
        ))}
      </div>
    </section>
  );
}
