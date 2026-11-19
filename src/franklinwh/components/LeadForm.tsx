"use client";

import type { ReactElement } from "react";
import { QUOTE_CTA_LABEL } from "../config";
import type { FieldKey, LeadValues } from "../leadFields";
import { buttonClass } from "./buttonStyles";
import { FormErrorAlert } from "./FormErrorAlert";
import { FormNote } from "./FormNote";
import { LeadFormFields } from "./LeadFormFields";
import { useLeadForm } from "./LeadFormProvider";
import { Spinner } from "./Spinner";
import { useFieldErrors } from "./useFieldErrors";
import { formKeyboardHandlers } from "./formKeyboardHandlers";

interface LeadFormProps {
  formId: string;
  messageRows: number;
}

/** Validate-first, direct send: no native submit event, so the optimizer only hears the confirmed lead. */
export function LeadForm({ formId, messageRows }: LeadFormProps): ReactElement {
  const { values, status, activeFormId, phone, setValue, readValues, sendLead } = useLeadForm();
  const { errors, validateAll, validateOne, clearIfValid } = useFieldErrors(formId);
  const pending = status === "submitting";

  const handleClick = (): void => {
    if (pending || !validateAll(readValues())) return;
    sendLead(formId);
  };
  const { handleKeyDown, handleSubmit } = formKeyboardHandlers(handleClick);

  const onValue = <K extends FieldKey>(key: K, value: LeadValues[K]): void => {
    setValue(key, value);
    clearIfValid(key, { ...values, [key]: value });
  };

  return (
    <form id={formId} data-lead-form noValidate onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <LeadFormFields
        formId={formId} values={values} errors={errors} disabled={pending} messageRows={messageRows}
        onValue={onValue} onBlur={(key) => validateOne(key, values)}
      />
      {status === "error" && activeFormId === formId && <FormErrorAlert phone={phone} />}
      <button type="button" onClick={handleClick} disabled={pending} aria-busy={pending} className={buttonClass("primary", "w-full")}>
        {pending && <Spinner />}
        {pending ? "Requesting your quote…" : QUOTE_CTA_LABEL}
      </button>
      <FormNote phone={phone} />
    </form>
  );
}
