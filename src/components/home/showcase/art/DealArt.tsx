import { Mark } from "@/components/brand/Logo";
import { Picture } from "@/components/ui/Picture";
import { ART_SIZES } from "./shared";
import story from "./story.module.css";
import s from "./DealArt.module.css";

/** The call is processed, then the deal assembles itself: value, stage, next action. */
export function DealArt() {
  return (
    <>
      <Picture name="showcaseDeal" sizes={ART_SIZES} className={s.bg} />
      <div className={s.stack}>
        <div className={`${s.notice} ${story.drop}`}>
          <span className={`${s.icon} ${story.spin}`}>
            <Mark className={s.iconMark} size={44} />
          </span>
          <span className={s.noticeText}>
            <b>Sales call processed</b>
            <span>32 min · Key details captured</span>
          </span>
        </div>
        <div className={`${s.deal} ${story.rise}`}>
          <p className={s.title}>Acme Website Redesign</p>
          <p className={s.meta}>Acme Inc. · Website &amp; digital strategy</p>
          <p className={s.value} data-count="12500" data-prefix="$" data-count-delay="420">
            $12,500
          </p>
          <div className={s.stageRow}>
            <span>Deal stage</span>
            <span className={`${s.stage} ${story.pop}`}>
              <i aria-hidden="true" />
              Proposal
            </span>
          </div>
          <p className={`${s.next} ${story.wipe}`}>Next action: Review proposal</p>
        </div>
      </div>
    </>
  );
}
