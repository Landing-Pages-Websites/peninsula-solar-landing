"use client";

import type { ChangeEvent, ReactElement } from "react";
import { EMAIL_ERROR, EMAIL_MAX_LENGTH, EMAIL_PATTERN, PHONE_ERROR, PHONE_PATTERN, formatPhone } from "../fields";
import { isRequired, type FieldErrors, type FieldKey, type LeadValues, type TextFieldKey } from "../leadFields";
import { MessageField } from "./MessageField";
import { OffGridCheckbox } from "./OffGridCheckbox";
import { TextField, type TextAttributes } from "./TextField";
import { fieldId } from "./useFieldErrors";

interface LeadFormFieldsProps {
  formId: string;
  values: LeadValues;
  errors: FieldErrors;
  disabled: boolean;
  messageRows: number;
  onValue: <K extends FieldKey>(key: K, value: LeadValues[K]) => void;
  onBlur: (key: FieldKey) => void;
}

const TEXT_FIELDS: readonly { key: Exclude<TextFieldKey, "message">; label: string; attrs: TextAttributes }[] = [
  { key: "name", label: "Full Name", attrs: { type: "text", autoComplete: "name", autoCapitalize: "words" } },
  {
    key: "phone",
    label: "Phone Number",
    attrs: { type: "tel", autoComplete: "tel-national", inputMode: "numeric", pattern: PHONE_PATTERN, title: PHONE_ERROR },
  },
  {
    key: "email",
    label: "Email",
    attrs: {
      type: "email", autoComplete: "email", inputMode: "email", pattern: EMAIL_PATTERN,
      maxLength: EMAIL_MAX_LENGTH, spellCheck: false, autoCapitalize: "none", title: EMAIL_ERROR,
    },
  },
  { key: "utility", label: "Utility Company", attrs: { type: "text", autoComplete: "off" } },
];

/** The six fields in payload order; names equal the `form_data` keys. Only name and phone are required. */
export function LeadFormFields({ formId, values, errors, disabled, messageRows, onValue, onBlur }: LeadFormFieldsProps): ReactElement {
  const onText = (key: TextFieldKey) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onValue(key, key === "phone" ? formatPhone(event.target.value) : event.target.value);
  };
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {TEXT_FIELDS.map(({ key, label, attrs }) => (
        <TextField
          key={key} id={fieldId(formId, key)} name={key} label={label} value={values[key]} required={isRequired(key)}
          disabled={disabled} error={errors[key]} attrs={attrs} onChange={onText(key)} onBlur={() => onBlur(key)}
        />
      ))}
      <OffGridCheckbox id={fieldId(formId, "offGrid")} checked={values.offGrid} disabled={disabled} onChange={(checked) => onValue("offGrid", checked)} />
      <MessageField
        id={fieldId(formId, "message")} value={values.message} rows={messageRows} disabled={disabled}
        error={errors.message} onChange={onText("message")} onBlur={() => onBlur("message")}
      />
    </div>
  );
}
