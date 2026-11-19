"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { useLeadForm } from "./LeadFormProvider";
import { INLINE_LINK } from "./buttonStyles";
import { PhoneNumber } from "./PhoneNumber";

/** Shown in every form card once the server confirmed the lead; takes focus in the card that sent it. */
export function SuccessPanel({ focus }: { focus: boolean }): ReactElement {
  const { values, phone } = useLeadForm();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);
  const firstName = values.name.trim().split(/\s+/)[0];
  return (
    <div ref={ref} tabIndex={-1} role="status" className="flex flex-col gap-3 rounded-control border-2 border-navy bg-surface p-6 focus-visible:outline-3 focus-visible:outline-navy">
      <p className="text-h4 font-semibold text-ink">Thanks, {firstName}. Your quote request is in.</p>
      <p className="text-body text-muted">
        We&apos;ll be in touch about your FranklinWH system. If you&apos;d rather talk now, call our {phone.office} at{" "}
        <PhoneNumber phone={phone} className={INLINE_LINK} />.
      </p>
    </div>
  );
}
