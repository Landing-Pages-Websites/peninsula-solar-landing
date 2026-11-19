import type { ReactElement, ReactNode } from "react";
import { inputClass } from "./fieldStyles";

interface FieldShellProps {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function errorId(id: string): string {
  return `${id}-error`;
}

/** The accessibility and style wiring every control inside a FieldShell shares. */
export function controlProps(id: string, error?: string): { "aria-invalid"?: true; "aria-describedby"?: string; className: string } {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId(id) : undefined,
    className: inputClass(Boolean(error)),
  };
}

/** Visible label, the control, and an error tied to it with aria-describedby. */
export function FieldShell({ id, label, optional = false, error, className = "", children }: FieldShellProps): ReactElement {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-label font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={errorId(id)} className="flex items-start gap-2 text-small font-medium text-ink">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-ink stroke-2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
