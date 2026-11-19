import type { ReactElement } from "react";

interface OffGridCheckboxProps {
  id: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

/** Optional project-interest flag, false until checked. Not communication consent. */
export function OffGridCheckbox({ id, checked, disabled, onChange }: OffGridCheckboxProps): ReactElement {
  return (
    <label
      htmlFor={id}
      className="group flex min-h-12 cursor-pointer items-center gap-3 rounded-control border-2 border-line bg-paper px-4 py-3 text-label text-ink transition-colors duration-200 ease-brand hover:border-navy has-[:checked]:border-navy has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-surface sm:col-span-2"
    >
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        <input
          id={id}
          name="offGrid"
          type="checkbox"
          value="true"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer h-6 w-6 cursor-pointer appearance-none rounded-[4px] border-2 border-line bg-paper transition-colors duration-200 ease-brand checked:border-navy checked:bg-navy focus-visible:outline-none disabled:cursor-not-allowed"
        />
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute h-4 w-4 fill-none stroke-paper stroke-3 opacity-0 peer-checked:opacity-100">
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>
        Interested in <span className="whitespace-nowrap">off-grid</span> / battery backup?
      </span>
    </label>
  );
}
