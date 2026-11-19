import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { PRODUCT_MODELS } from "../../content";
import { IMAGES } from "../../images";
import { ResponsiveImage } from "../ResponsiveImage";
import { SectionShell } from "./SectionShell";

/** The one dark band: the official aPower 2 + aGate render beside the four model names and roles. */
export function ProductFamily({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="product-family" tone="navy" phone={phone}>
      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16">
        <figure>
          <ResponsiveImage
            image={IMAGES.aPower2AndAGate}
            sizes="(min-width: 1200px) 620px, (min-width: 1024px) 55vw, calc(100vw - 40px)"
            className="h-auto w-full"
          />
          <figcaption className="mt-4 text-small text-paper/80">aPower 2 battery, left, with the aGate controller, right.</figcaption>
        </figure>
        <div data-reveal>
          <h2 className="text-h2 font-semibold text-paper">Meet the FranklinWH system</h2>
          <dl className="mt-8 divide-y divide-paper/20 border-y border-paper/20">
            {PRODUCT_MODELS.map((model) => (
              <div key={model.name} className="grid gap-1 py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
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
