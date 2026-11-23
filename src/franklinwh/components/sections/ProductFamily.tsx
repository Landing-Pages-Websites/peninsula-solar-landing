import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { PRODUCT_MODELS } from "../../content";
import { IMAGES } from "../../images";
import { RULED } from "../buttonStyles";
import { ResponsiveImage } from "../ResponsiveImage";
import { RenderFloorFilter } from "./RenderFloorFilter";
import { SectionShell } from "./SectionShell";

/**
 * Name beside role from 640px, except 1024-1279px: there the 5/12 text column is ~370px, so a
 * paired row leaves the role ~220px and the list outgrows the render by 250px. Stacking the
 * name over its role in that range (and the narrower 40px column gap) keeps the columns close;
 * the stacked rows sit at 16px instead of 20px. xl restores the paired rows.
 */
const MODEL_ROW =
  "grid gap-1 py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-6 lg:grid-cols-1 lg:gap-1 lg:max-xl:py-4 xl:grid-cols-[7.5rem_1fr] xl:gap-6";

/**
 * One line from 1024px: at -0.02em the heading is 9.1em wide, so until xl its size is capped at 10.75cqi
 * of the text column (2% spare). The cap only bites below ~1060px (40.5px in the 377px column a reserved
 * scrollbar leaves at 1024).
 */
const LINEUP_HEADING = "text-h2 lg:tracking-[-0.02em] lg:max-xl:text-[length:min(var(--text-h2),10.75cqi)]";

/** The dusk band: the official aPower 2 + aGate render beside the four models, set as the flyer's ruled two-track spec rows. */
export function ProductFamily({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="product-family" tone="dusk" phone={phone}>
      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-center xl:gap-16">
        <figure>
          <RenderFloorFilter id="lineup-render-floor" />
          <ResponsiveImage
            image={IMAGES.aPower2AndAGate}
            sizes="(min-width: 1280px) 625px, (min-width: 1024px) calc(58.33vw - 61px), calc(100vw - 40px)"
            className="render-fade h-auto w-full [filter:url(#lineup-render-floor)]"
          />
          <figcaption className="mt-4 font-display text-lede italic text-gold">aPower 2 battery, left, with the aGate controller, right.</figcaption>
        </figure>
        <div data-reveal className="lg:max-xl:@container">
          <h2 className={LINEUP_HEADING}>The <span className="whitespace-nowrap">FranklinWH lineup</span></h2>
          <dl className={`mt-8 ${RULED}`}>
            {PRODUCT_MODELS.map((model) => (
              <div key={model.name} className={MODEL_ROW}>
                <dt className="whitespace-nowrap font-display text-h4 font-medium">{model.name}</dt>
                <dd className="text-body text-mist">{model.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SectionShell>
  );
}
