import type { ReactElement } from "react";
import { FINAL_FORM_ANCHOR, FINAL_FORM_ID } from "../../config";
import { LeadFormCard } from "../LeadFormCard";

/** The last conversion point: the flyer's bordered navy callout with a gold rule, content-sized, ending with the form. */
export function FinalQuote(): ReactElement {
  return (
    <section id="final-quote" className="bg-glow py-20 lg:py-28">
      <div className="mx-auto max-w-[880px] px-5 lg:px-8">
        <LeadFormCard
          anchorId={FINAL_FORM_ANCHOR}
          formId={FINAL_FORM_ID}
          messageRows={4}
          className="rounded-panel border border-gold/60 bg-harbor p-6 sm:p-10"
          heading={<h2 className="title-rule text-h2">Let&rsquo;s plan <span className="whitespace-nowrap">your backup power</span></h2>}
          intro={<p className="mx-auto mt-2 max-w-[56ch] text-center text-body text-mist">Tell us a little about your property, and we&rsquo;ll follow up to plan your FranklinWH system.</p>}
        />
      </div>
    </section>
  );
}
