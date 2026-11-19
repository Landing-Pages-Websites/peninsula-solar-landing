import type { ChangeEvent, ReactElement } from "react";
import { FieldShell, controlProps } from "./FieldShell";

interface MessageFieldProps {
  id: string;
  value: string;
  rows: number;
  disabled: boolean;
  error?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
}

/** Optional free text; capped at 1,000 characters by the shared validator, never truncated by the input. */
export function MessageField({ id, value, rows, disabled, error, onChange, onBlur }: MessageFieldProps): ReactElement {
  return (
    <FieldShell id={id} label="Message" optional error={error} className="sm:col-span-2">
      <textarea
        id={id} name="message" rows={rows} value={value} disabled={disabled}
        onChange={onChange} onBlur={onBlur} {...controlProps(id, error)}
      />
    </FieldShell>
  );
}
