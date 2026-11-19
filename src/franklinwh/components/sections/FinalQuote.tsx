import type { ReactElement } from "react";
import { FINAL_FORM_ANCHOR, FINAL_FORM_ID } from "../../config";
import { LeadFormCard } from "../LeadFormCard";

/** The last conversion point: one compact surface that ends with the form, no CTA pair after it. */
export function FinalQuote(): ReactElement {
  return (
    <section id="final-quote" className="bg-paper py-20 lg:py-24">
      <div className="mx-auto max-w-[880px] px-5 lg:px-8">
        <LeadFormCard
          anchorId={FINAL_FORM_ANCHOR}
          formId={FINAL_FORM_ID}
          messageRows={4}
          className="rounded-panel border border-hairline bg-surface p-6 shadow-card sm:p-10"
          heading={<h2 className="text-h2 font-semibold">Let&rsquo;s plan your backup power</h2>}
          intro={<p className="text-body text-muted">Tell us a little about your property, and we&rsquo;ll follow up to plan your FranklinWH system.</p>}
        />
      </div>
    </section>
  );
}
