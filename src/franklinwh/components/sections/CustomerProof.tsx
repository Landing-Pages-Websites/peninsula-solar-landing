import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { TESTIMONIALS } from "../../content";
import { RULED } from "../buttonStyles";
import { SectionShell } from "./SectionShell";

/** Verbatim Google review excerpts with first names only: no stars, no portraits. Set as serif quotes between gold rules. */
export function CustomerProof({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="customer-proof" tone="night" phone={phone}>
      <div className="mx-auto max-w-[820px]">
        <h2 data-reveal className="title-rule text-h2">
          Customer reviews
        </h2>
        <ul data-reveal className={`mt-12 ${RULED}`}>
          {TESTIMONIALS.map((review) => (
            <li key={review.author} className="py-10 text-center">
              <figure>
                <blockquote className="font-display text-h3 italic">&ldquo;{review.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 text-label font-semibold text-gold">{review.author}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
