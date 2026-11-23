/* eslint-disable @next/next/no-img-element -- official logo file at a fixed size; images are unoptimized */
import type { ReactElement } from "react";
import { HERO_FORM_ANCHOR, type RoutePhone } from "../../config";
import { CtaPair } from "../CtaPair";

/** Category headline, the in-house differentiator, audience, paired actions and one trust line. */
export function HeroIntro({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <div className="flex flex-col gap-5">
      <img src="/franklinwh/franklinwh-logo-reversed-720.png" width={720} height={51} alt="FranklinWH logo" className="h-[13px] w-auto self-start sm:hidden" />
      <h1 className="text-h1 italic">FranklinWH home battery backup</h1>
      <p className="max-w-[60ch] text-body">
        Our licensed electricians install your system, with sales, permitting and warranty handled by the same in&#8209;house team.
      </p>
      <p className="font-display text-lede italic text-gold">Serving Northern Michigan homes, <span className="whitespace-nowrap">cabins and camps</span> since&nbsp;2011.</p>
      <CtaPair phone={phone} formAnchor={HERO_FORM_ANCHOR} align="start" />
      <p className="flex items-center gap-2 text-label text-mist">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-gold stroke-[1.5]">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        FranklinWH certified installer in Michigan
      </p>
    </div>
  );
}
