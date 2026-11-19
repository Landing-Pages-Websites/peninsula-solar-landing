import type { ReactElement } from "react";
import type { RoutePhone } from "../config";
import { INLINE_LINK } from "./buttonStyles";
import { ALERT_CLASS } from "./fieldStyles";
import { PhoneNumber } from "./PhoneNumber";

/** A definite rejection (nothing was saved): the draft stays, retry is allowed, and the route phone is offered. */
export function FormErrorAlert({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <p role="alert" className={ALERT_CLASS}>
      We couldn&apos;t send your request. Your details are still here, so please try again or call{" "}
      <PhoneNumber phone={phone} className={INLINE_LINK} />.
    </p>
  );
}
