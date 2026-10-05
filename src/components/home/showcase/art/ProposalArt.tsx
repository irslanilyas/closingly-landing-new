import { Picture } from "@/components/ui/Picture";
import { ART_SIZES } from "./shared";
import story from "./story.module.css";
import s from "./ProposalArt.module.css";

/** The call transcript arrives, Closingly works on it, and the proposal pages take shape behind. */
export function ProposalArt() {
  return (
    <>
      <Picture name="showcaseProposal" sizes={ART_SIZES} className={s.bg} />
      <span className={`${s.pageBack} ${story.right}`}>
        <Picture name="proposalPageBack" sizes="310px" className={s.fill} />
      </span>
      <span className={`${s.pageFront} ${story.left}`}>
        <Picture name="proposalPageFront" sizes="358px" className={s.fill} />
      </span>
      <div className={`${s.card} ${story.drop}`}>
        <div className={s.source}>
          <span className={s.logo}>
            <Picture name="logoAcme" sizes="55px" className={s.fill} />
          </span>
          <span className={s.sourceText}>
            <b>Call Transcript · Acme Corp,</b>
            <span>New website · 6 weeks · $12,000</span>
          </span>
        </div>
        <div className={`${s.working} ${story.wipe}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
          <img className={s.workingIcon} src="/icons/ai-chat.svg" alt="" width={28} height={28} loading="lazy" />
          Getting your proposal ready..
        </div>
      </div>
    </>
  );
}
