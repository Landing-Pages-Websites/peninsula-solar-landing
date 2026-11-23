import type { ReactElement } from "react";
import { HERO_FORM_ANCHOR, HERO_FORM_ID, type RoutePhone } from "../../config";
import { IMAGES } from "../../images";
import { CONTAINER } from "../buttonStyles";
import { LeadFormCard } from "../LeadFormCard";
import { ResponsiveImage } from "../ResponsiveImage";
import { HeroIntro } from "./HeroIntro";

/**
 * Photo-led split on the evening sky: the headline sits in the dusk above FranklinWH's own aPower S
 * installation photo, toned to evening, whose top edge dissolves into that sky. The form stays on the
 * right, content-sized; the photo keeps its full column width and 16:10 crop.
 */
export function Hero({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <section id="hero" className="bg-evening">
      <div className={`${CONTAINER} grid gap-10 pb-16 pt-8 sm:pt-12 lg:grid-cols-[7fr_5fr] lg:gap-10 lg:pb-16 lg:pt-16 xl:gap-14`}>
        <div className="flex flex-col gap-8">
          <HeroIntro phone={phone} />
          <figure className="evening-photo overflow-hidden rounded-b-panel">
            <ResponsiveImage
              image={IMAGES.heroInstallation}
              sizes="(min-width: 1200px) 640px, (min-width: 1024px) 55vw, calc(100vw - 40px)"
              priority
              className="aspect-[16/10] h-auto w-full object-cover object-[50%_62%]"
            />
          </figure>
        </div>
        <div className="lg:sticky lg:top-34 lg:self-start">
          <LeadFormCard
            anchorId={HERO_FORM_ANCHOR}
            formId={HERO_FORM_ID}
            messageRows={3}
            className="rounded-panel border border-gold/40 bg-harbor p-6 shadow-card lg:max-w-[560px] lg:p-8"
            heading={<h2 className="text-h3">Request your free quote</h2>}
            intro={<p className="text-label text-mist">Only your name and phone number are required.</p>}
          />
        </div>
      </div>
    </section>
  );
}
