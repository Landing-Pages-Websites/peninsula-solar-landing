/* eslint-disable @next/next/no-img-element -- official logo file at a fixed size; images are unoptimized */
import type { ReactElement } from "react";
import { PRIVACY_PATH, SITE, type RoutePhone } from "../config";
import { CONTAINER } from "./buttonStyles";
import { PhoneNumber } from "./PhoneNumber";

const LINK_CLASS = "font-semibold text-paper underline underline-offset-2 hover:decoration-orange hover:decoration-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-paper";

/** Legal-only footer: installer identity, the route's own phone, the privacy policy and copyright. */
export function SiteFooter({ phone }: { phone?: RoutePhone }): ReactElement {
  return (
    <footer className="bg-charcoal text-paper">
      <div className={`${CONTAINER} flex flex-col gap-8 py-12 lg:flex-row lg:items-end lg:justify-between`}>
        <img src="/franklinwh/peninsula-solar-logo-white-480.png" width={480} height={57} alt="Peninsula Solar" className="h-7 w-auto self-start lg:self-end" />
        <div className="flex flex-col gap-2 text-label text-paper/80 lg:items-end">
          {phone && (
            <p>
              {phone.office}: <PhoneNumber phone={phone} className={LINK_CLASS} />
            </p>
          )}
          <p>
            <a href={PRIVACY_PATH} className={LINK_CLASS}>
              Privacy Policy
            </a>
          </p>
          <p className="text-small text-paper/70">
            &copy; {new Date().getFullYear()} {SITE.brandName}
          </p>
        </div>
      </div>
    </footer>
  );
}
