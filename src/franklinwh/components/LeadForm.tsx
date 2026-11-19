"use client";

import type { ReactElement } from "react";
import { QUOTE_CTA_LABEL } from "../config";
import type { FieldKey, LeadValues } from "../leadFields";
import { gateSend, isSendLocked, type SubmissionStatus } from "../submission";
import { buttonClass } from "./buttonStyles";
import { FormErrorAlert } from "./FormErrorAlert";
import { FormNote } from "./FormNote";
import { FormUnknownAlert } from "./FormUnknownAlert";
import { LeadFormFields } from "./LeadFormFields";
import { useLeadForm } from "./LeadFormProvider";
import { Spinner } from "./Spinner";
import { useFieldErrors } from "./useFieldErrors";
import { formKeyboardHandlers } from "./formKeyboardHandlers";

interface LeadFormProps {
  formId: string;
  messageRows: number;
}

function buttonLabel(status: SubmissionStatus): string {
  if (status === "submitting") return "Requesting your quote…";
  return status === "unknown" ? "Request paused" : QUOTE_CTA_LABEL;
}

/** Validate-first, direct send: no native submit event, so the optimizer only hears the confirmed lead. */
export function LeadForm({ formId, messageRows }: LeadFormProps): ReactElement {
  const { values, status, activeFormId, phone, setValue, readValues, sendLead } = useLeadForm();
  const { errors, validateAll, validateOne, clearIfValid } = useFieldErrors(formId);
  const pending = status === "submitting";
  // Pending, unconfirmed or accepted: fields and button are disabled and gateSend refuses.
  const locked = isSendLocked(status);
  const active = activeFormId === formId;

  const handleClick = (): void => gateSend(status, () => validateAll(readValues()), () => sendLead(formId));
  const { handleKeyDown, handleSubmit } = formKeyboardHandlers(handleClick);

  const onValue = <K extends FieldKey>(key: K, value: LeadValues[K]): void => {
    setValue(key, value);
    clearIfValid(key, { ...values, [key]: value });
  };

  return (
    <form id={formId} data-lead-form noValidate onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="flex flex-col gap-5">
      {status === "unknown" && <FormUnknownAlert phone={phone} announce={active} />}
      <LeadFormFields
        formId={formId} values={values} errors={errors} disabled={locked} messageRows={messageRows}
        onValue={onValue} onBlur={(key) => validateOne(key, values)}
      />
      {status === "error" && active && <FormErrorAlert phone={phone} />}
      <button type="button" onClick={handleClick} disabled={locked} aria-busy={pending} className={buttonClass("primary", { extra: "w-full" })}>
        {pending && <Spinner />}
        {buttonLabel(status)}
      </button>
      <FormNote phone={phone} />
    </form>
  );
}
