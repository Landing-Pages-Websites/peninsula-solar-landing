import type { ReactElement } from "react";
import { HERO_FORM_ANCHOR, HERO_FORM_ID, type RoutePhone } from "../../config";
import { CONTAINER } from "../buttonStyles";
import { LeadFormCard } from "../LeadFormCard";
import { HeroIntro } from "./HeroIntro";

/**
 * Photo-led split on the evening sky: the headline sits over FranklinWH's own aPower S installation
 * photo, toned to evening, with the rest of the intro below it. The form stays on the right,
 * content-sized; the photo keeps its full column width and whole 4:3 frame. From lg to xl (1024-1279px)
 * the form is at its tallest, so the hero's top padding tightens and the intro's spacing opens (here and
 * in HeroIntro) to keep the two columns within 120px without pushing the quote pair below a 768px screen.
 */
export function Hero({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <section id="hero" className="bg-evening">
      <div className={`${CONTAINER} grid gap-6 pb-16 pt-3 sm:gap-10 sm:pt-12 lg:grid-cols-[7fr_5fr] lg:max-xl:pt-10 xl:gap-14`}>
        <HeroIntro phone={phone} />
        <div className="lg:sticky lg:top-34 lg:self-start">
          <LeadFormCard
            anchorId={HERO_FORM_ANCHOR}
            formId={HERO_FORM_ID}
            messageRows={3}
            className="rounded-panel border border-gold/40 bg-harbor p-4 shadow-card sm:p-6 lg:max-w-[560px] xl:p-8"
            heading={<h2 className="text-h3">Request your free quote</h2>}
            intro={<p className="text-label text-mist">Only your name and phone number are required.</p>}
          />
        </div>
      </div>
    </section>
  );
}
