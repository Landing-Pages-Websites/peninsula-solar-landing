import type { ChangeEvent, InputHTMLAttributes, ReactElement } from "react";
import { FieldShell, controlProps } from "./FieldShell";

export type TextAttributes = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "autoComplete" | "inputMode" | "pattern" | "title" | "autoCapitalize" | "maxLength" | "spellCheck"
>;

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  required: boolean;
  disabled: boolean;
  error?: string;
  attrs: TextAttributes;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

/** A labelled single-line input; `name` equals its `form_data` key. */
export function TextField({ id, name, label, value, required, disabled, error, attrs, onChange, onBlur }: TextFieldProps): ReactElement {
  return (
    <FieldShell id={id} label={label} optional={!required} error={error}>
      <input
        id={id} name={name} value={value} required={required} disabled={disabled} {...attrs}
        onChange={onChange} onBlur={onBlur} {...controlProps(id, error)}
      />
    </FieldShell>
  );
}
