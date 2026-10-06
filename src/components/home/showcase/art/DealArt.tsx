import { Picture } from "@/components/ui/Picture";
import { ART_SIZES } from "./shared";
import { Gloss } from "./Bits";
import a from "./art.module.css";
import s from "./DealArt.module.css";

/** The call is processed, then the deal assembles itself: value, stage, next action. */
export function DealArt() {
  return (
    <div className={`${a.root} ${s.root}`}>
      <Picture name="showcaseDeal" sizes={ART_SIZES} className={a.bg} />
      <div className={s.stack}>
        <div className={`${s.notice} ${s.drop}`}>
          <Gloss size={44.416} className={`${s.icon} ${s.spin}`} />
          <span className={s.noticeText}>
            <b>Sales call processed</b>
            <span>32 min · Key details captured</span>
          </span>
        </div>
        <div className={`${s.deal} ${s.rise}`}>
          <p className={s.title}>Acme Website Redesign</p>
          <p className={s.meta}>Acme Inc. · Website &amp; digital strategy</p>
          <p className={s.value} data-count="12500" data-prefix="$" data-count-delay="600" data-count-duration="1400">
            $12,500
          </p>
          <div className={s.stageRow}>
            <span>Deal stage</span>
            <span className={`${s.stage} ${s.pop}`}>
              <i aria-hidden="true" />
              Proposal
            </span>
          </div>
          <p className={`${s.next} ${s.wipe}`}>Next action: Review proposal</p>
        </div>
      </div>
    </div>
  );
}
