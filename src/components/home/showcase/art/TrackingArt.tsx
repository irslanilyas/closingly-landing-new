import { Picture } from "@/components/ui/Picture";
import { ART_SIZES } from "./shared";
import story from "./story.module.css";
import s from "./TrackingArt.module.css";

const SECTIONS = [
  { name: "Overview", track: 60, fill: 48, status: "Viewed" },
  { name: "Deliverables", track: 72, fill: 58, status: "Viewed" },
  { name: "Investment", track: 84, fill: 67, status: "2 views" },
  { name: "Terms", track: 96, fill: 77, status: "Viewed" },
];

/** The client opens the proposal again; views tick up and each section's reading fills in. */
export function TrackingArt() {
  return (
    <>
      <Picture name="showcaseTracking" sizes={ART_SIZES} className={s.bg} />
      <div className={s.column}>
        <div className={`${s.notice} ${story.drop}`}>
          <span className={`${s.logo} ${story.pop}`}>
            <Picture name="logoAster" sizes="48px" />
          </span>
          <span className={s.noticeText}>
            <b>Aster Living just viewed your proposal again.</b>
            <span>Time to send a follow up?</span>
          </span>
        </div>
        <div className={`${s.card} ${story.rise}`}>
          <div className={s.head}>
            <span className={s.thumbs}>
              <span className={s.thumbBack}>
                <Picture name="proposalThumbBack" sizes="72px" />
              </span>
              <span className={s.thumbFront}>
                <Picture name="proposalThumbFront" sizes="85px" />
              </span>
            </span>
            <span className={s.views}>
              <span className={s.label}>PROPOSAL ENGAGEMENT</span>
              <span className={s.count}>
                <b data-count="4" data-count-delay="500" data-count-duration="700">
                  4
                </b>{" "}
                views
              </span>
            </span>
          </div>
          <p className={s.last}>Last viewed 17 minutes ago</p>
          <ul className={s.rows}>
            {SECTIONS.map((row, i) => (
              <li key={row.name}>
                <span>{row.name}</span>
                <span className={s.track} style={{ width: row.track }}>
                  <span
                    className={`${s.fill} ${story.grow}`}
                    style={{ width: row.fill, "--d": `${0.6 + i * 0.12}s`, "--t": "0.8s" } as React.CSSProperties}
                  />
                </span>
                <span>{row.status}</span>
              </li>
            ))}
          </ul>
          <p className={`${s.insight} ${story.pop}`}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M8 0c.5 4.4 3.6 7.5 8 8-4.4.5-7.5 3.6-8 8-.5-4.4-3.6-7.5-8-8 4.4-.5 7.5-3.6 8-8Z" />
            </svg>
            Strongest interest: Investment
          </p>
        </div>
      </div>
    </>
  );
}
