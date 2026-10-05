import { Mark } from "@/components/brand/Logo";
import { Picture } from "@/components/ui/Picture";
import { ART_SIZES } from "./shared";
import story from "./story.module.css";
import s from "./ScopeArt.module.css";

/** The request is checked against the agreed scope, flagged, and turned into new work. */
export function ScopeArt() {
  return (
    <>
      <Picture name="showcaseScope" sizes={ART_SIZES} className={s.bg} />
      <div className={`${s.check} ${story.fade}`}>
        <div className={s.checkHead}>
          <div className={s.row}>
            <span className={`${s.icon} ${s.iconSmall}`}>
              <Mark className={s.iconMark} size={29} />
            </span>
            Scope check in progress
          </div>
          <div className={s.working}>
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
            <img className={s.workingIcon} src="/icons/ai-chat.svg" alt="" width={25} height={25} loading="lazy" />
            Referencing every detail about the deal...
          </div>
        </div>
        <span className={s.thread} aria-hidden="true" />
        <div className={`${s.item} ${story.left}`}>
          <i aria-hidden="true" />
          <span>Original scope</span>
          <p>5-page marketing website with CMS.</p>
        </div>
        <div className={`${s.item} ${s.itemNew} ${story.left}`}>
          <i aria-hidden="true" />
          <span>New client request</span>
          <p>Could we add a contact us page?</p>
        </div>
      </div>
      <div className={`${s.verdict} ${story.rise}`}>
        <div className={s.verdictText}>
          <div className={s.row}>
            <span className={`${s.icon} ${s.iconLarge} ${story.spin}`}>
              <Mark className={s.iconMark} size={32} />
            </span>
            This request is out of scope
          </div>
          <p>
            This request may need more time and budget. Generate the draft. to agree on the next steps before work
            begins.
          </p>
        </div>
        <span className={s.button}>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
          <img src="/icons/ai-draft.svg" alt="" width={26} height={26} loading="lazy" />
          Generate the draft.
        </span>
      </div>
      <span className={s.cursor} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative pointer */}
        <img src="/icons/cursor.svg" alt="" width={79} height={94} loading="lazy" />
      </span>
    </>
  );
}
