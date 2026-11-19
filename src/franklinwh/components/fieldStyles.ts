/** Shared input look: 2px border, 48px tap height, navy focus ring, error border kept non-color-only by the message. */
export function inputClass(hasError: boolean): string {
  // Error: the token error color (black) plus a warm fill, so the state reads at a glance without relying on color alone.
  const border = hasError ? "border-ink bg-sand" : "border-line bg-paper";
  return [
    "w-full min-h-12 resize-y rounded-control border-2 px-4 py-3 text-body text-ink",
    "placeholder:text-muted transition-colors duration-200 ease-brand",
    "hover:border-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy focus-visible:border-navy",
    "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted",
    border,
  ].join(" ");
}
