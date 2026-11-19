import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { PRODUCT_MODELS } from "../../content";
import { IMAGES } from "../../images";
import { ResponsiveImage } from "../ResponsiveImage";
import { SectionShell } from "./SectionShell";

/**
 * Name beside role from 640px, except 1024-1279px: there the 5/12 text column is ~370px, so a
 * paired row leaves the role ~220px and the list outgrows the render by 250px. Stacking the
 * name over its role in that range (and the narrower 40px column gap) keeps the columns within
 * ~105px of each other at 1024; xl restores the paired rows.
 */
const MODEL_ROW = "grid gap-1 py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-6 lg:grid-cols-1 lg:gap-1 xl:grid-cols-[7.5rem_1fr] xl:gap-6";

/** The one dark band: the official aPower 2 + aGate render beside the four model names and roles. */
export function ProductFamily({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="product-family" tone="navy" phone={phone}>
      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-center xl:gap-16">
        <figure>
          <ResponsiveImage
            image={IMAGES.aPower2AndAGate}
            sizes="(min-width: 1280px) 625px, (min-width: 1024px) calc(58.33vw - 61px), calc(100vw - 40px)"
            className="h-auto w-full"
          />
          <figcaption className="mt-4 text-small text-paper/80">aPower 2 battery, left, with the aGate controller, right.</figcaption>
        </figure>
        <div data-reveal>
          <h2 className="text-h2 font-semibold text-paper">The FranklinWH lineup</h2>
          <dl className="mt-8 divide-y divide-paper/20 border-y border-paper/20">
            {PRODUCT_MODELS.map((model) => (
              <div key={model.name} className={MODEL_ROW}>
                <dt className="whitespace-nowrap text-h4 font-semibold text-paper">{model.name}</dt>
                <dd className="text-body text-paper/80">{model.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SectionShell>
  );
}
