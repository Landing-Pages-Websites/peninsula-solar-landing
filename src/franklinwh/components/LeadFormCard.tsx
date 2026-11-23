"use client";

import type { ReactElement, ReactNode } from "react";
import { LeadForm } from "./LeadForm";
import { useLeadForm } from "./LeadFormProvider";
import { SuccessPanel } from "./SuccessPanel";

interface LeadFormCardProps {
  anchorId: string;
  formId: string;
  heading: ReactNode;
  intro: ReactNode;
  messageRows: number;
  className?: string;
}

/** A whole form card: anchor target, title, form, and the success state once the lead is confirmed. */
export function LeadFormCard({ anchorId, formId, heading, intro, messageRows, className = "" }: LeadFormCardProps): ReactElement {
  const { status, activeFormId } = useLeadForm();
  const succeeded = status === "success";
  return (
    <div id={anchorId} data-lead-form-card className={`scroll-mt-4 ${className}`}>
      <div className="mb-6 flex flex-col gap-2">
        {heading}
        {!succeeded && intro}
      </div>
      {succeeded ? <SuccessPanel focus={activeFormId === formId} /> : <LeadForm formId={formId} messageRows={messageRows} />}
    </div>
  );
}
