"use client";

import Link from "next/link";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { FAQS } from "./faq-data";
import section from "./section.module.css";
import s from "./Faq.module.css";

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className={s.section} aria-labelledby="faq-title">
      <div className={section.head} data-reveal="">
        <p className={section.eyebrow}>A LITTLE MORE CLARITY</p>
        <h2 id="faq-title" className={`${section.title} ${s.title}`}>
          Got questions? We’ve got <em>answers</em>
        </h2>
      </div>
      <div className={s.list}>
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className={s.row} data-open={isOpen || undefined} data-reveal="" style={{ "--reveal-delay": `${Math.min(i, 6) * 70}ms` } as React.CSSProperties}>
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => {
                    setOpen(isOpen ? -1 : i);
                    if (!isOpen) track("select_content", { content_type: "faq", content_id: item.q });
                  }}
                >
                  <span>{item.q}</span>
                  <i aria-hidden="true" />
                </button>
              </h3>
              <div className={s.answer} id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                <div>
                  <p>
                    {item.a}
                    {item.privacyLink && (
                      <>
                        {" "}
                        <Link href="/privacy">Privacy Policy</Link>.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
