/* eslint-disable @next/next/no-img-element -- official logo files at fixed sizes; images are unoptimized */
import type { ReactElement } from "react";

/**
 * Peninsula Solar (the installer) and FranklinWH, separated by the thin vertical rule and even
 * spacing the FranklinWH partner-lockup rules ask for. Official artwork, never recolored.
 * Below 640px only the installer mark shows here; the hero carries the FranklinWH mark there.
 */
export function PartnerLockup(): ReactElement {
  return (
    <div className="flex items-center gap-4 lg:gap-5">
      <img
        src="/franklinwh/peninsula-solar-logo-480.png"
        width={480}
        height={57}
        alt="Peninsula Solar"
        className="h-6 w-auto lg:h-7"
      />
      <span aria-hidden="true" className="hidden h-8 w-px bg-line sm:block" />
      <img
        src="/franklinwh/franklinwh-logo-480.png"
        width={480}
        height={34}
        alt="FranklinWH logo"
        className="hidden h-[13px] w-auto sm:block lg:h-[15px]"
      />
    </div>
  );
}
