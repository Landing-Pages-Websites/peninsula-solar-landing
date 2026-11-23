/* eslint-disable @next/next/no-img-element -- official logo files at fixed sizes; images are unoptimized */
import type { ReactElement } from "react";

/**
 * Peninsula Solar's "Own Your Energy" badge (the installer) and FranklinWH, separated by a thin
 * gold rule. The badge is the client's own artwork; the FranklinWH mark is its reversed version
 * (cream lettering, the brand's own "WH") for the navy ground, as on the client's flyer.
 * Below 640px only the badge shows here; the hero carries the FranklinWH mark there.
 * Every mark is `shrink-0` with a fixed height and auto width, so flex can never squeeze its ratio.
 */
export function PartnerLockup(): ReactElement {
  return (
    <div className="flex shrink-0 items-center gap-4 lg:gap-6">
      <img
        src="/franklinwh/own-your-energy-badge-192.png"
        width={192}
        height={191}
        alt="Peninsula Solar"
        className="h-[72px] w-auto shrink-0 lg:h-[88px]"
      />
      <span aria-hidden="true" className="hidden h-10 w-px shrink-0 bg-gold/50 sm:block" />
      <img
        src="/franklinwh/franklinwh-logo-reversed-480.png"
        width={480}
        height={34}
        alt="FranklinWH logo"
        className="hidden h-[13px] w-auto shrink-0 sm:block lg:h-[15px]"
      />
    </div>
  );
}
