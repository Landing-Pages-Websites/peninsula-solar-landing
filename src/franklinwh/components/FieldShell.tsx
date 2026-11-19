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

/**
 * Visible label, then the control with its error tied by aria-describedby. The shell spans two rows
 * of the form grid (`grid-rows-subgrid`), so fields side by side share one label row and one
 * control row: a label that wraps to two lines ("Utility Company (optional)") lowers the shared
 * row, every label sits on its control (`self-end`), and paired inputs stay top-aligned.
 */
export function FieldShell({ id, label, optional = false, error, className = "", children }: FieldShellProps): ReactElement {
  return (
    <div data-field-shell className={`row-span-2 grid grid-rows-subgrid gap-y-2 ${className}`}>
      <label htmlFor={id} className="self-end text-label font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <div className="flex flex-col gap-2">
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
    </div>
  );
}
