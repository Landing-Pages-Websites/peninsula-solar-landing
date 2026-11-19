import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { TESTIMONIALS } from "../../content";
import { SectionShell } from "./SectionShell";

/** Verbatim Google review excerpts with first names only: no stars, no portraits. */
export function CustomerProof({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="customer-proof" tone="paper" phone={phone}>
      <div className="grid gap-10 lg:grid-cols-[4fr_8fr] lg:gap-16">
        <h2 data-reveal className="text-h2 font-semibold lg:sticky lg:top-28 lg:self-start">
          Customer reviews
        </h2>
        <ul data-reveal className="divide-y divide-hairline border-y border-hairline">
          {TESTIMONIALS.map((review) => (
            <li key={review.author} className="py-8">
              <figure>
                <blockquote className="text-h4 font-medium text-ink">&ldquo;{review.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-label font-semibold text-muted">{review.author}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
