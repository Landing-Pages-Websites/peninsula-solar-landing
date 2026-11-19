import type { ReactElement } from "react";
import { QUOTE_CTA_LABEL, type RoutePhone } from "../config";
import { buttonClass, type ButtonSurface } from "./buttonStyles";
import { PhoneIcon } from "./PhoneIcon";

interface CtaPairProps {
  phone: RoutePhone;
  /** The form this pair leads to: `hero-form` under the hero, `form` everywhere after it. */
  formAnchor: string;
  surface?: ButtonSurface;
  align?: "center" | "start";
}

/** Quote button and route phone, side by side; forward-only. */
export function CtaPair({ phone, formAnchor, surface = "light", align = "center" }: CtaPairProps): ReactElement {
  const justify = align === "center" ? "justify-center" : "justify-start";
  return (
    <div className={`flex flex-wrap items-center gap-3 ${justify}`}>
      <a href={`#${formAnchor}`} data-cta className={buttonClass("primary", "", surface)}>
        {QUOTE_CTA_LABEL}
      </a>
      <a href={phone.href} data-cta className={buttonClass("secondary", "whitespace-nowrap", surface)}>
        <PhoneIcon />
        Call {phone.display}
      </a>
    </div>
  );
}
