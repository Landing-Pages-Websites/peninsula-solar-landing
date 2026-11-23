import type { ReactElement } from "react";
import { HERO_FORM_ANCHOR, QUOTE_CTA_LABEL, type RoutePhone } from "../config";
import { CONTAINER, buttonClass } from "./buttonStyles";
import { PartnerLockup } from "./PartnerLockup";
import { PhoneIcon } from "./PhoneIcon";

interface SiteHeaderProps {
  /** Omitted on the privacy page, which is shared by both campaign routes. */
  phone?: RoutePhone;
}

/**
 * Sticky identity bar: partner lockup, the route phone and the first form. No navigation.
 * At 320px the 72px badge, a 16px gap and the 48px phone fit the 280px column with room to
 * spare. The quote link joins at lg, where both marks and the full phone number also fit;
 * below that the hero's own quote action is already on the first screen.
 */
export function SiteHeader({ phone }: SiteHeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/25 bg-night">
      <div className={`${CONTAINER} flex h-[88px] items-center justify-between gap-4 lg:h-[104px]`}>
        <PartnerLockup />
        {phone && (
          <div className="flex shrink-0 items-center gap-3">
            <a href={phone.href} aria-label={`Call ${phone.display}`} className={buttonClass("secondary", { size: "icon" })}>
              <PhoneIcon />
              <span className="hidden lg:inline">{phone.display}</span>
            </a>
            {/* Visibility lives on a wrapper: the link's own inline-flex would override `hidden`. */}
            <div data-header-quote className="hidden lg:block">
              <a href={`#${HERO_FORM_ANCHOR}`} className={buttonClass("primary")}>
                {QUOTE_CTA_LABEL}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
