import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { FAQS } from "../../content";
import { SectionShell } from "./SectionShell";

/** Native disclosures, all collapsed on load; only questions no other section answers. */
export function Faq({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="faq" tone="surface" phone={phone}>
      <div className="mx-auto max-w-[820px]">
        <h2 data-reveal className="text-h2 font-semibold">Before you plan your system</h2>
        <div data-reveal className="mt-8 divide-y divide-hairline border-y border-hairline">
          {FAQS.map((faq) => (
            <details key={faq.question}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 text-h4 font-semibold text-ink transition-colors duration-200 ease-brand hover:text-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy">
                {faq.question}
                <svg data-chevron aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-none stroke-current stroke-2 transition-transform duration-200 ease-brand">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div data-answer className="pb-6 pr-12">
                <p className="text-body text-muted">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
