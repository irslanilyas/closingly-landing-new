import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BetaForm } from "@/components/beta/BetaForm";
import { Picture } from "@/components/ui/Picture";
import { pageMetadata } from "@/lib/metadata";
import s from "./beta.module.css";

export const metadata = pageMetadata({
  path: "/beta",
  title: "Join the founding beta | Closingly",
  description:
    "Get free early access to Closingly. Your client call ends, and your proposal, price and follow-ups are ready. 200 founding spots.",
  socialTitle: "Join the Closingly founding beta",
  socialDescription: "Free early access for freelancers, consultants and agencies who take sales calls and send proposals.",
});

export default function BetaPage() {
  return (
    <div className={s.canvas}>
      <main className={s.application}>
        <aside className={s.story} aria-label="Closingly founding beta">
          <Picture name="foundingBetaMobile" sizes="(max-width: 767px) 1px, 50vw" className={s.storyImage} />
          <div className={s.storyContent}>
            <Logo className={s.brand} />
            <div className={s.storyIntro}>
              <p className={s.eyebrow}>A SMALL COHORT. A BIG SAY.</p>
              <p className={s.storyTitle}>
                Your next chapter,
                <br />
                with a little <em>less busywork.</em>
              </p>
              <p className={s.storyText}>
                More time for your expertise.
                <br />A clearer path from call to close.
              </p>
            </div>
          </div>
          <p className={s.caption}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
            </svg>
            Built with you. Better because of you.
          </p>
        </aside>
        <section className={s.panel} aria-labelledby="form-heading">
          <Link className={s.back} href="/">
            <span aria-hidden="true">←</span> Back to Closingly
          </Link>
          <div className={s.content}>
            <BetaForm />
          </div>
          <p className={s.footer}>
            Your expertise. Your relationships. <span>Your next move.</span>
          </p>
        </section>
      </main>
    </div>
  );
}
