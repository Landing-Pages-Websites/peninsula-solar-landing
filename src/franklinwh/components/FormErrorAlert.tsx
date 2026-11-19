import type { ReactElement } from "react";
import type { RoutePhone } from "../config";
import { INLINE_LINK } from "./buttonStyles";
import { PhoneNumber } from "./PhoneNumber";

/** A failed or unconfirmed request: the draft stays, retry is allowed, and the route phone is offered. */
export function FormErrorAlert({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <p role="alert" className="rounded-control border-2 border-ink bg-sand px-4 py-3 text-label text-ink">
      We couldn&apos;t send your request. Your details are still here, so please try again or call{" "}
      <PhoneNumber phone={phone} className={INLINE_LINK} />.
    </p>
  );
}
