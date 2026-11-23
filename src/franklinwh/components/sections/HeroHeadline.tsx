/* eslint-disable @next/next/no-img-element -- official logo file at a fixed size; images are unoptimized */
import type { ReactElement } from "react";
import { IMAGES } from "../../images";
import { ResponsiveImage } from "../ResponsiveImage";

/**
 * The headline set over FranklinWH's own aPower S installation photo at dusk. The whole 4:3 frame
 * shows; the headline takes the upper left (eaves, trees, siding) under a navy scrim, leaving the
 * floor batteries and the wall unit's lettering clear below and to the right. Below 640px the header
 * shows only the installer badge, so the FranklinWH mark rides above the headline here instead of
 * taking a row of its own above the photo.
 */
export function HeroHeadline(): ReactElement {
  return (
    <div className="evening-photo rounded-panel shadow-card">
      <div className="absolute left-0 top-0 z-10 flex flex-col gap-2 p-4 sm:p-8">
        <img src="/franklinwh/franklinwh-logo-reversed-720.png" width={720} height={51} alt="FranklinWH logo" className="h-[13px] w-auto self-start sm:hidden" />
        <h1 className="italic">FranklinWH home battery backup</h1>
      </div>
      <ResponsiveImage
        image={IMAGES.heroInstallation}
        sizes="(min-width: 1200px) 640px, (min-width: 1024px) 55vw, calc(100vw - 40px)"
        priority
        className="block h-auto w-full"
      />
    </div>
  );
}
