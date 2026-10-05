import { Mark } from "@/components/brand/Logo";
import { Picture } from "@/components/ui/Picture";
import { ART_SIZES } from "./shared";
import story from "./story.module.css";
import s from "./FollowUpArt.module.css";

/** A signal in the deal, then the follow-up Closingly drafts from it, ready to send. */
export function FollowUpArt() {
  return (
    <>
      <Picture name="showcaseFollowUp" sizes={ART_SIZES} className={s.bg} />
      <div className={`${s.card} ${story.rise}`}>
        <div className={s.head}>
          <span className={`${s.icon} ${story.spin}`}>
            <Mark className={s.iconMark} size={53} />
          </span>
          <span className={s.headText}>
            <b>Client reviewed Investment twice</b>
            <span>Your deal context, working for you.</span>
          </span>
        </div>
        <p className={`${s.kicker} ${story.fade}`}>
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8 0c.5 4.4 3.6 7.5 8 8-4.4.5-7.5 3.6-8 8-.5-4.4-3.6-7.5-8-8 4.4-.5 7.5-3.6 8-8Z" />
          </svg>
          SUGGESTED NEXT MOVE
        </p>
        <div className={s.draft}>
          <p className={s.write}>
            Hi Alex, I saw you had another look at the website proposal. Happy to walk through the investment and how
            we can shape the project around your priorities. Would a quick chat this week help?
          </p>
        </div>
        <div className={`${s.actions} ${story.rise}`}>
          <span className={s.secondary}>
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
            <img src="/icons/copy.svg" alt="" width={27} height={27} loading="lazy" />
            Copy text
          </span>
          <span className={s.primary}>
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
            <img src="/icons/ai-draft.svg" alt="" width={27} height={27} loading="lazy" />
            Generate another variation
          </span>
        </div>
      </div>
    </>
  );
}
