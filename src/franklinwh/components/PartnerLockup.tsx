/* eslint-disable @next/next/no-img-element -- official logo files at fixed sizes; images are unoptimized */
import type { ReactElement } from "react";

/**
 * Peninsula Solar (the installer) and FranklinWH, separated by the thin vertical rule and even
 * spacing the FranklinWH partner-lockup rules ask for. Official artwork, never recolored.
 * Below 640px only the installer mark shows here; the hero carries the FranklinWH mark there.
 * Every mark is `shrink-0` with a fixed height and auto width, so flex can never squeeze its ratio.
 */
export function PartnerLockup(): ReactElement {
  return (
    <div className="flex shrink-0 items-center gap-4 lg:gap-5">
      <img
        src="/franklinwh/peninsula-solar-logo-480.png"
        width={480}
        height={57}
        alt="Peninsula Solar"
        className="h-[22px] w-auto shrink-0 sm:h-6 lg:h-7"
      />
      <span aria-hidden="true" className="hidden h-8 w-px shrink-0 bg-line sm:block" />
      <img
        src="/franklinwh/franklinwh-logo-480.png"
        width={480}
        height={34}
        alt="FranklinWH logo"
        className="hidden h-[13px] w-auto shrink-0 sm:block lg:h-[15px]"
      />
    </div>
  );
}
