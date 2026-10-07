import { Mark } from "@/components/brand/Logo";
import { CtaButton } from "@/components/ui/CtaButton";
import { Picture } from "@/components/ui/Picture";
import section from "../section.module.css";
import { ArtControl } from "./ArtControl";
import s from "./HowItWorks.module.css";

// The voice spectrum: three bar heights in Atif's order, each bar on its own tempo.
const BARS = "acbcabacbcabaaacabbcbcbcab".split("");
const BAR_HEIGHT = { a: 5.783, b: 8.649, c: 14.369 } as const;

type Deal = { name: string; client: string; value: string; timeline: string; next: string };

function MiniDeal({ deal, className }: { deal: Deal; className?: string }) {
  return (
    <div className={`${s.mini} ${className ?? ""}`}>
      <div className={s.miniHead}>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
        <img className={s.grip} src="/icons/grip.svg" alt="" width={23} height={23} loading="lazy" />
        <span className={s.miniName}>
          <b>{deal.name}</b>
          <span>{deal.client}</span>
        </span>
      </div>
      <p className={s.miniValue}>
        <b>{deal.value}</b> Deal value
      </p>
      <dl className={s.miniRows}>
        <div>
          <dt>Owner</dt>
          <dd>
            <span className={s.initials}>JD</span> You
          </dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>{deal.timeline}</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>{deal.next}</dd>
        </div>
      </dl>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className={s.section} aria-labelledby="how-title">
      <div className={section.head} data-reveal="">
        <p className={section.eyebrow}>A LITTLE LESS BUSYWORK</p>
        <h2 id="how-title" className={section.title}>
          A simpler way to move <span className={section.wideBreak}>from call to close.</span>
        </h2>
        <p className={s.lede}>
          Calls, deals, proposals, follow-ups, pipeline, scope, and revenue visibility all in one connected flow.
        </p>
      </div>

      <div className={s.cards}>
        {/* 1. Capture the call */}
        <article className={s.card} data-reveal="">
          <div className={s.art} role="img" aria-label="A sales call in progress, with Closingly capturing the conversation as it happens.">
            <div className={s.stage}>
              <Picture name="howCall" sizes="419px" className={s.bg} />
              <div className={`${s.screen} ${s.host}`}>
                <Picture name="callHost" sizes="290px" className={s.cover} />
                <video className={s.cover} src="/media/call-host.mp4" muted loop playsInline preload="none" data-inview-play="" aria-hidden="true" tabIndex={-1} />
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative toolbar */}
                <img className={s.controls} src="/icons/call-controls.svg" alt="" width={172} height={19} loading="lazy" />
              </div>
              <div className={`${s.screen} ${s.client}`}>
                <Picture name="callClient" sizes="173px" className={s.cover} />
                <video className={s.cover} src="/media/call-client.mp4" muted loop playsInline preload="none" data-inview-play="" aria-hidden="true" tabIndex={-1} />
              </div>
              <div className={s.transcript}>
                <div className={s.voice}>
                  <span className={s.voiceMark}>
                    <Mark className={s.fill} size={36} />
                  </span>
                  <span className={s.bars} data-motion="">
                    {BARS.map((h, i) => (
                      <i
                        key={i}
                        style={
                          {
                            height: BAR_HEIGHT[h as keyof typeof BAR_HEIGHT],
                            "--wave-duration": `${640 + ((i * 137) % 650)}ms`,
                            "--wave-delay": `${-((i * 173) % 1200)}ms`,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </span>
                </div>
                <div className={s.quote}>
                  <p className={s.stamp}>
                    <b>AM</b> 18:42
                  </p>
                  <p>“We need the new website live before our launch in six weeks.”</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`${s.text} ${s.textFirst}`}>
            <h3>Capture the call</h3>
            <p>Closingly processes the conversation, so the important details stay with you.</p>
          </div>
        </article>

        {/* 2. Create the deal */}
        <article className={s.card} data-reveal="" style={{ "--reveal-delay": "70ms" } as React.CSSProperties}>
          <div className={s.art} role="img" aria-label="A deal Closingly created automatically, with its value, timeline and next action." data-tilt="">
            <div className={s.stage}>
              <span className={s.room} data-tilt-room="">
                <Picture name="howDeal" sizes="419px" className={s.bg} />
              </span>
              <div className={s.deal} data-tilt-card="">
                <span className={s.glare} data-tilt-glare="" />
                <div className={s.dealHead}>
                  <span className={s.dealLogo}>
                    <Picture name="logoAster" sizes="36px" />
                  </span>
                  <span className={s.dealName}>
                    <b>Aster&nbsp; Website Redesign</b>
                    <span>Aster Inc. · Johnny Walker</span>
                  </span>
                </div>
                <p className={s.dealValue}>
                  <b>$12,500</b> Deal value
                </p>
                <ul className={s.stages}>
                  <li>Discovery</li>
                  <li>Proposal</li>
                  <li>Negotiation</li>
                </ul>
                <dl className={s.dealRows}>
                  <div>
                    <dt>Owner</dt>
                    <dd>
                      <span className={s.initials}>JD</span> You
                    </dd>
                  </div>
                  <div>
                    <dt>Timeline</dt>
                    <dd>6 weeks</dd>
                  </div>
                  <div>
                    <dt>Next action</dt>
                    <dd>Review proposal</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <div className={`${s.text} ${s.textMiddle}`}>
            <h3>Create the deal</h3>
            <p>The opportunity is organized automatically. Client, context, and next step included.</p>
          </div>
        </article>

        {/* 3. Move it forward */}
        <article className={s.card} data-reveal="" style={{ "--reveal-delay": "140ms" } as React.CSSProperties}>
          <div className={s.art} role="img" aria-label="Deals moving forward from lead to proposal sent." data-drag="">
            <div className={s.stage}>
              <Picture name="howCall" sizes="419px" className={s.bg} />
              <div className={`${s.column} ${s.sent}`}>
                <p className={s.columnHead}>Proposal Sent</p>
                <div className={s.columnBody}>
                  <span className={s.slot} />
                </div>
              </div>
              <div className={`${s.column} ${s.lead}`}>
                <p className={s.columnHead}>Lead</p>
                <div className={`${s.columnBody} ${s.leadBody}`}>
                  <span className={s.dropzone} />
                  <MiniDeal
                    className={s.leadCard}
                    deal={{ name: "Acme Digital Identity", client: "Acme Inc.  Abraham Dillinger", value: "$6,200", timeline: "4 weeks", next: "Send Proposal" }}
                  />
                </div>
              </div>
              <div className={s.dragged} data-drag-card="">
                <MiniDeal
                  className={s.draggedCard}
                  deal={{ name: "Aster  Website Redesign", client: "Aster Inc. · Johnny Walker", value: "$12,500", timeline: "6 weeks", next: "Review Proposal" }}
                />
              </div>
            </div>
          </div>
          <div className={`${s.text} ${s.textLast}`}>
            <h3>Move it forward</h3>
            <p>Generate proposals, track engagement, follow up, and protect scope in one workflow.</p>
          </div>
        </article>
      </div>

      <ArtControl />
      <div data-reveal="">
        <CtaButton href="/beta">
          Get Free Beta Access
        </CtaButton>
      </div>
    </section>
  );
}
