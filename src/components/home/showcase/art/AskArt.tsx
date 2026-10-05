import { Mark } from "@/components/brand/Logo";
import { Picture } from "@/components/ui/Picture";
import { ART_SIZES } from "./shared";
import story from "./story.module.css";
import s from "./AskArt.module.css";

const POINTS = [
  {
    lead: "Budget is worth clarifying.",
    rest: " Alex has viewed Investment twice, but hasn’t replied. Views alone don’t confirm a concern.",
    source: "Proposal activity · 17 min ago",
  },
  {
    lead: "The launch date matters.",
    rest: " On the discovery call, Alex asked to launch in six weeks.",
    source: "Discovery call · 18:42",
  },
  {
    lead: "There’s a new scope question.",
    rest: " Alex asked about a customer portal. The proposal covers a 5-page website with CMS.",
    source: "Client request · Yesterday",
  },
];

/** A question about a deal, answered point by point from that deal's own sources. */
export function AskArt() {
  return (
    <>
      <Picture name="showcaseAsk" sizes={ART_SIZES} className={s.bg} />
      <div className={`${s.panel} ${story.rise}`}>
        <div className={s.top}>
          <span className={s.avatar}>
            <Picture name="askAvatar" sizes="46px" />
          </span>
          <span className={s.topText}>
            <b>Ask Closingly</b>
            <span>Your deals, in context.</span>
          </span>
        </div>
        <div className={s.thread}>
          <p className={`${s.question} ${story.right}`}>What’s holding up the Acme deal?</p>
          <div className={`${s.answerHead} ${story.fade}`}>
            <span className={s.icon}>
              <Mark className={s.iconMark} size={20} />
            </span>
            <b>Closingly</b>
            <span className={s.sources}>Using 3 deal sources</span>
          </div>
          <p className={`${s.intro} ${story.fade}`}>Alex hasn’t raised an objection yet. Here’s what the deal context tells us:</p>
          <ol className={s.points}>
            {POINTS.map((p, i) => (
              <li key={p.source} className={story.rise} style={{ "--d": `${1 + i * 0.22}s` } as React.CSSProperties}>
                <span className={s.number}>{i + 1}</span>
                <span className={s.pointText}>
                  <span>
                    <b>{p.lead}</b>
                    {p.rest}
                  </span>
                  <span className={s.pointSource}>{p.source}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
