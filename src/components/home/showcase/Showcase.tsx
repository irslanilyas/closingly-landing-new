import type { ReactNode } from "react";
import { CtaButton } from "@/components/ui/CtaButton";
import { AskArt } from "./art/AskArt";
import { DealArt } from "./art/DealArt";
import { FollowUpArt } from "./art/FollowUpArt";
import { ProposalArt } from "./art/ProposalArt";
import { ScopeArt } from "./art/ScopeArt";
import { TrackingArt } from "./art/TrackingArt";
import { ShowcaseStage, type Feature } from "./ShowcaseStage";
import styles from "./Showcase.module.css";

function Copy({ title, body, wide = true, dark = false }: { title: string; body: string; wide?: boolean; dark?: boolean }) {
  return (
    <>
      <div className={styles.copyText}>
        <h3>{title}</h3>
        <p className={`${wide ? styles.wide : ""} ${dark ? styles.dark : ""}`}>{body}</p>
      </div>
      <CtaButton href="/beta">
        Get Free Beta Access
      </CtaButton>
    </>
  );
}

const FEATURES: Feature[] = [
  {
    id: "deal-pipeline",
    label: "Deal Pipeline",
    copy: (
      <Copy
        wide={false}
        title="Every sales call becomes an organized deal"
        body="The moment a call is processed, Closingly turns it into a deal with the key context already attached: client, project, stage, value, activity, and next step."
      />
    ),
    art: <DealArt />,
    artLabel:
      "A deal card Closingly created from a processed sales call: Acme Website Redesign, $12,500, next action review proposal.",
  },
  {
    id: "proposals",
    label: "Proposal generation",
    copy: (
      <Copy
        title="Turn conversations into proposals faster"
        body="Use the call context and your business setup to generate proposals around the actual opportunity, not a blank template."
      />
    ),
    art: <ProposalArt />,
    artLabel: "A proposal Closingly drafted from the call, built around what the client said.",
  },
  {
    id: "tracking",
    label: "Tracking",
    copy: (
      <Copy
        title="See how clients engage with your proposal"
        body="See which sections clients opened, how often they returned, and where interest seems strongest. Base your next move on real engagement, not guesswork."
      />
    ),
    art: <TrackingArt />,
    artLabel:
      "Proposal engagement: which sections the client opened, how often they came back and where interest is strongest.",
  },
  {
    id: "follow-ups",
    label: "Follow-ups",
    copy: (
      <Copy
        title="Follow up with better timing and context"
        body="Closingly drafts follow-ups based on what’s happening inside the deal like a proposal being viewed multiple times without a response. Send a smarter next move, with the context that matters."
      />
    ),
    art: <FollowUpArt />,
    artLabel: "A follow-up Closingly drafted after the client read the investment section twice without replying.",
  },
  {
    id: "scope",
    label: "Scope Protection",
    copy: (
      <Copy
        dark
        title="Protect your scope before work expands"
        body="Paste in a client’s new request and Closingly checks it against what you agreed. If it falls outside scope, you’ll know before you say yes, so it becomes new work instead of free work."
      />
    ),
    art: <ScopeArt />,
    artLabel: "Closingly flagging a new client request as outside the agreed scope.",
  },
  {
    id: "ask-closingly",
    label: "Ask Closingly",
    copy: (
      <Copy
        title="Ask anything about your deals"
        body="Ask what’s holding up a deal, who needs a follow-up today, or what a client said about budget. Closingly answers from your calls, proposals and activity, and preps you before the next call."
      />
    ),
    art: <AskArt />,
    artLabel: "Ask Closingly explaining what is holding up the Acme deal, using the deal’s own sources.",
  },
];

function Heading(): ReactNode {
  return (
    <header id="platform-heading" className={styles.heading}>
      <div className={styles.headingText}>
        <p className={styles.eyebrow}>ONE CONNECTED WORKSPACE</p>
        <h2>
          Your sales process already exists. Closingly <em>connects it</em>
        </h2>
      </div>
      <p>Calls, deals, proposals, follow-ups, pipeline, scope, and revenue visibility all in one connected flow.</p>
    </header>
  );
}

export function Showcase() {
  return (
    <section id="workspace-features" aria-label="Explore the Closingly workspace">
      <ShowcaseStage heading={<Heading />} features={FEATURES} />
    </section>
  );
}
