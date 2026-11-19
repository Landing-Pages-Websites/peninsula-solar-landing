import type { ReactElement } from "react";
import { HERO_FORM_ANCHOR, HERO_FORM_ID, type RoutePhone } from "../../config";
import { IMAGES } from "../../images";
import { CONTAINER } from "../buttonStyles";
import { LeadFormCard } from "../LeadFormCard";
import { ResponsiveImage } from "../ResponsiveImage";
import { HeroIntro } from "./HeroIntro";

/** Photo-led split: messaging and FranklinWH's own aPower S installation photo on the left, the quote form on the right. */
export function Hero({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <section id="hero" className="bg-surface lg:min-h-[85vh]">
      <div className={`${CONTAINER} grid gap-10 pb-16 pt-8 sm:pt-12 lg:grid-cols-[7fr_5fr] lg:gap-10 lg:pb-20 lg:pt-14 xl:gap-14`}>
        <div className="flex flex-col gap-8">
          <HeroIntro phone={phone} />
          <figure className="overflow-hidden rounded-panel bg-hairline shadow-card">
            <ResponsiveImage
              image={IMAGES.heroInstallation}
              sizes="(min-width: 1200px) 640px, (min-width: 1024px) 55vw, calc(100vw - 40px)"
              priority
              className="aspect-[16/10] h-auto w-full object-cover object-[50%_62%]"
            />
          </figure>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <LeadFormCard
            anchorId={HERO_FORM_ANCHOR}
            formId={HERO_FORM_ID}
            messageRows={3}
            className="rounded-panel border border-hairline bg-paper p-6 shadow-card lg:max-w-[560px] lg:p-7"
            heading={<h2 className="text-h3 font-semibold text-ink">Request your free quote</h2>}
            intro={<p className="text-label text-muted">Only your name and phone number are required.</p>}
          />
        </div>
      </div>
    </section>
  );
}
