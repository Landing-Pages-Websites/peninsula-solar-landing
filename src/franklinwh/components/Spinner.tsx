import type { ReactElement } from "react";

/** Pending indicator for the submit button; still under reduced motion (the label carries the state). */
export function Spinner(): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current stroke-2 motion-safe:animate-spin">
      <path d="M12 3a9 9 0 1 1-9 9" strokeLinecap="round" />
    </svg>
  );
}
