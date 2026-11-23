/* eslint-disable @next/next/no-img-element -- official logo file at a fixed size; images are unoptimized */
import type { ReactElement } from "react";
import { PRIVACY_PATH, SITE, type RoutePhone } from "../config";
import { CONTAINER, INLINE_LINK } from "./buttonStyles";
import { PhoneNumber } from "./PhoneNumber";

/** Legal-only footer, closing like the flyer: the installer badge, the route's own phone, the privacy policy and copyright. */
export function SiteFooter({ phone }: { phone?: RoutePhone }): ReactElement {
  return (
    <footer className="border-t border-gold/25 bg-night">
      <div className={`${CONTAINER} flex flex-col items-center gap-6 py-14 text-center`}>
        <img src="/franklinwh/own-your-energy-badge-320.png" width={320} height={318} alt="Peninsula Solar" loading="lazy" className="h-24 w-auto" />
        <div className="flex flex-col items-center gap-2 text-label text-mist">
          {phone && (
            <p>
              {phone.office}: <PhoneNumber phone={phone} className={INLINE_LINK} />
            </p>
          )}
          <p>
            <a href={PRIVACY_PATH} className={INLINE_LINK}>
              Privacy Policy
            </a>
          </p>
          <p className="text-small">
            &copy; {new Date().getFullYear()} {SITE.brandName}
          </p>
        </div>
      </div>
    </footer>
  );
}
