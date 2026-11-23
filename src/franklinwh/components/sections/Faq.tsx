import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { FAQS } from "../../content";
import { RULED } from "../buttonStyles";
import { SectionShell } from "./SectionShell";

/** Native disclosures, all collapsed on load; only questions no other section answers. */
export function Faq({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="faq" tone="raised" phone={phone}>
      <div className="mx-auto max-w-[820px]">
        <h2 data-reveal className="title-rule text-h2">Before you plan your system</h2>
        <div data-reveal className={`mt-12 ${RULED}`}>
          {FAQS.map((faq) => (
            <details key={faq.question}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-h4 font-medium transition-colors duration-200 ease-brand hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                {faq.question}
                <svg data-chevron aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-none stroke-gold stroke-[1.5] transition-transform duration-200 ease-brand">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div data-answer className="pb-6 pr-12">
                <p className="text-body text-mist">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
