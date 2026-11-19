import type { ReactElement } from "react";
import { QUOTE_CTA_LABEL, QUOTE_CTA_SHORT_LABEL, type RoutePhone } from "../config";
import { buttonClass, type ButtonSurface } from "./buttonStyles";
import { PhoneIcon } from "./PhoneIcon";

interface CtaPairProps {
  phone: RoutePhone;
  /** The form this pair leads to: `hero-form` under the hero, `form` everywhere after it. */
  formAnchor: string;
  surface?: ButtonSurface;
  align?: "center" | "start";
}

/**
 * Quote button and route phone on ONE row at every width; forward-only. Below 640px the labels
 * shorten ("Free quote", number without "Call") and the quote grows to fill the row, so the pair
 * fits a 265px column (320px viewport) without wrapping. From 640px both take their full labels.
 */
export function CtaPair({ phone, formAnchor, surface = "light", align = "center" }: CtaPairProps): ReactElement {
  const justify = align === "center" ? "justify-center" : "justify-start";
  return (
    <div data-cta-pair className={`flex flex-nowrap items-stretch gap-2 sm:gap-3 ${justify}`}>
      <a href={`#${formAnchor}`} data-cta className={buttonClass("primary", { surface, size: "pair", extra: "flex-1 sm:flex-none" })}>
        <span className="sm:hidden">{QUOTE_CTA_SHORT_LABEL}</span>
        <span className="hidden sm:inline">{QUOTE_CTA_LABEL}</span>
      </a>
      <a href={phone.href} aria-label={`Call ${phone.display}`} data-cta className={buttonClass("secondary", { surface, size: "pair" })}>
        <PhoneIcon />
        <span>
          <span className="hidden sm:inline">Call </span>
          {phone.display}
        </span>
      </a>
    </div>
  );
}
