/** The boxed form alert (rejected or unconfirmed request): gold border and raised fill, never color-only. */
export const ALERT_CLASS = "rounded-control border-2 border-gold bg-dusk px-4 py-3 text-label text-cream";

/** Shared input look: 48px tap height on the night ground, gold hover and focus, error kept non-color-only by the message. */
export function inputClass(hasError: boolean): string {
  // Error: a coral border and ring that hover and focus keep (the gold outline still marks focus), with the message carrying the meaning.
  const border = hasError ? "border-error ring-1 ring-error" : "border-line hover:border-gold focus-visible:border-gold";
  return [
    "w-full min-h-12 resize-y rounded-control border-2 bg-night px-4 py-3 text-body text-cream",
    "placeholder:text-mist transition-colors duration-200 ease-brand",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
    "disabled:cursor-not-allowed disabled:bg-harbor disabled:text-mist",
    border,
  ].join(" ");
}
