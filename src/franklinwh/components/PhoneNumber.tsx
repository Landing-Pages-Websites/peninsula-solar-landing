import type { ReactElement } from "react";
import type { RoutePhone } from "../config";

interface PhoneNumberProps {
  phone: RoutePhone;
  className?: string;
}

/** The route's own number as a tel: link that never wraps mid-number. */
export function PhoneNumber({ phone, className = "" }: PhoneNumberProps): ReactElement {
  return (
    <a href={phone.href} className={`whitespace-nowrap ${className}`}>
      {phone.display}
    </a>
  );
}
