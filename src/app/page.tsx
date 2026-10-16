import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/hero/Hero";
import { Showcase } from "@/components/home/showcase/Showcase";
import { HowItWorks } from "@/components/home/how-it-works/HowItWorks";
import { FoundingBeta } from "@/components/home/FoundingBeta";
import { Audience } from "@/components/home/Audience";
import { GoodFit } from "@/components/home/GoodFit";
import { Faq } from "@/components/home/Faq";
import { NextMove } from "@/components/home/NextMove";
import { FAQS } from "@/components/home/faq-data";
import { pageMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/",
  title: "Closingly: Turn every sales call into a deal that moves forward",
  description:
    "Closingly joins your sales calls, turns them into deals, drafts your proposal, tracks how clients engage and shows you the next move. Join the free founding beta.",
  socialDescription:
    "From client call to closed deal: proposals, pricing, follow-ups and pipeline, handled. Join the free founding beta.",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: `${SITE.url}/`,
      logo: `${SITE.url}/apple-touch-icon.png`,
      email: SITE.email,
      sameAs: [SITE.linkedin],
      areaServed: "Worldwide",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: SITE.name,
      publisher: { "@id": `${SITE.url}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.url}/#software`,
      name: SITE.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${SITE.url}/`,
      image: `${SITE.url}${SITE.ogImage}`,
      description:
        "Closingly is an AI sales assistant for freelancers, consultants and agencies. It joins your client calls as a visible notetaker, then drafts the proposal, recommends a price from your own past deals, tracks the deal and drafts your follow-ups.",
      featureList: [
        "Visible AI notetaker for Google Meet, Zoom and Microsoft Teams",
        "Proposals drafted from the call",
        "Price recommendations based on your own past deals",
        "Proposal links with section-level read tracking",
        "Follow-up drafting and nudges",
        "Deal pipeline, win and loss insights",
        "Scope creep detection",
        "Ask Closingly assistant and call prep",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free during the founding beta",
        url: `${SITE.url}/beta`,
      },
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE.url}/#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.privacyLink ? `${f.a} Privacy Policy.` : f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static data, escaped so it can never close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page">
        <Header />
        <main id="main">
          <Hero />
          {/* Each boundary hydrates as its own unit, after the first paint, so the
              browser never waits on the whole page before showing the hero. */}
          <Suspense>
            <Showcase />
          </Suspense>
          <Suspense>
            <HowItWorks />
            <FoundingBeta />
            <Audience />
            <GoodFit />
          </Suspense>
          <Suspense>
            <Faq />
            <NextMove />
          </Suspense>
        </main>
      </div>
    </>
  );
}
