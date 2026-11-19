import type { ReactElement } from "react";
import { HERO_FORM_ANCHOR, QUOTE_CTA_LABEL, type RoutePhone } from "../config";
import { CONTAINER, buttonClass } from "./buttonStyles";
import { PartnerLockup } from "./PartnerLockup";
import { PhoneIcon } from "./PhoneIcon";

interface SiteHeaderProps {
  /** Omitted on the privacy page, which is shared by both campaign routes. */
  phone?: RoutePhone;
}

/** Sticky identity bar: partner lockup, the route phone and the first form. No navigation. */
export function SiteHeader({ phone }: SiteHeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper">
      <div className={`${CONTAINER} flex h-16 items-center justify-between gap-4 lg:h-[72px]`}>
        <PartnerLockup />
        {phone && (
          <div className="flex items-center gap-3">
            <a
              href={phone.href}
              aria-label={`Call ${phone.display}`}
              className={buttonClass("secondary", "min-w-12 px-3 lg:px-4")}
            >
              <PhoneIcon />
              <span className="hidden whitespace-nowrap lg:inline">{phone.display}</span>
            </a>
            <a href={`#${HERO_FORM_ANCHOR}`} className={buttonClass("primary", "hidden md:inline-flex")}>
              {QUOTE_CTA_LABEL}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
