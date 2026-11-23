export type ButtonVariant = "primary" | "secondary";
export type ButtonSurface = "light" | "dark";
export type ButtonSize = "regular" | "pair" | "icon";

// Display, gap, padding and type size live in exactly one place per button (BASE or SIZES), and
// `extra` may never repeat them: two unprefixed utilities for one property resolve by Tailwind's
// stylesheet order, not class order (that is how `hidden` once lost to `inline-flex`).
const BASE = [
  "inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-control border py-3",
  "font-semibold transition-colors duration-200 ease-brand",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-3 focus-visible:ring-offset-transparent",
  "disabled:cursor-not-allowed disabled:border-dusk disabled:bg-dusk disabled:text-mist",
].join(" ");

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "border-gold bg-gold text-night hover:border-gold-light hover:bg-gold-light active:border-cream active:bg-cream",
  secondary: "border-gold bg-transparent text-cream hover:bg-gold/15 active:bg-gold/25",
};

const SIZES: Record<ButtonSize, string> = {
  regular: "gap-2 px-6 text-button",
  /** Section pairs keep quote + phone on one row down to a 265px column (320px viewport). */
  pair: "gap-1.5 px-2 text-small sm:gap-2 sm:px-6 sm:text-button",
  /** Header phone: a square 48px icon button that grows to show the number from lg. */
  icon: "min-w-12 gap-2 px-3 text-button lg:px-4",
};

interface ButtonOptions {
  /** Accepted for existing callers; since the flyer restyle every surface is navy, so it no longer changes the look. */
  surface?: ButtonSurface;
  size?: ButtonSize;
  /** Width, flex and shadow only; never display, gap, padding or type size. */
  extra?: string;
}

/** One button system: gold fill with navy text for the quote action, gold outline for the phone. */
export function buttonClass(variant: ButtonVariant, { size = "regular", extra = "" }: ButtonOptions = {}): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${extra}`.trim();
}

/** Page width and gutters shared by the header, every section and the footer. */
export const CONTAINER = "mx-auto max-w-[1200px] px-5 lg:px-8";

/** A list ruled above, below and between its items by gold hairlines, as on the flyer. */
export const RULED = "divide-y divide-gold/25 border-y border-gold/25";

/** Inline text link: cream with a gold underline, gold on hover, gold focus outline. */
export const INLINE_LINK =
  "font-semibold text-cream underline decoration-gold underline-offset-2 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
