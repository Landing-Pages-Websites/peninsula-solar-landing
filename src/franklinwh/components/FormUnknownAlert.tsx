import type { ReactElement } from "react";
import type { RoutePhone } from "../config";
import { INLINE_LINK } from "./buttonStyles";
import { ALERT_CLASS } from "./fieldStyles";
import { PhoneNumber } from "./PhoneNumber";

interface FormUnknownAlertProps {
  phone: RoutePhone;
  /** Only the form that sent the request announces it; its sibling shows the same text quietly. */
  announce: boolean;
}

/** The request may have reached us but was never confirmed: no resend, call instead. */
export function FormUnknownAlert({ phone, announce }: FormUnknownAlertProps): ReactElement {
  return (
    <p role={announce ? "alert" : undefined} className={ALERT_CLASS}>
      We couldn&apos;t confirm your request went through. To avoid sending it twice, this form is paused and
      your details are kept. Call our {phone.office} at{" "}
      <PhoneNumber phone={phone} className={INLINE_LINK} />{" "}
      and we&apos;ll check for you.
    </p>
  );
}
