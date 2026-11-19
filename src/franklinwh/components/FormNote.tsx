import type { ReactElement } from "react";
import { PRIVACY_PATH, type RoutePhone } from "../config";
import { INLINE_LINK } from "./buttonStyles";
import { PhoneNumber } from "./PhoneNumber";

/** Under every submit button: the call alternative and the privacy policy link. */
export function FormNote({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <p className="text-small text-muted">
      Prefer to talk? Call our {phone.office} at <PhoneNumber phone={phone} className={INLINE_LINK} />.{" "}
      <a href={PRIVACY_PATH} className={INLINE_LINK}>
        Privacy Policy
      </a>
    </p>
  );
}
