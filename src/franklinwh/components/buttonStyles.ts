export type ButtonVariant = "primary" | "secondary";
export type ButtonSurface = "light" | "dark";
export type ButtonSize = "regular" | "pair" | "icon";

// Display, gap, padding and type size live in exactly one place per button (BASE or SIZES), and
// `extra` may never repeat them: two unprefixed utilities for one property resolve by Tailwind's
// stylesheet order, not class order (that is how `hidden` once lost to `inline-flex`).
const BASE = [
  "inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-control border-2 py-3",
  "font-semibold transition-colors duration-200 ease-brand",
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-navy focus-visible:ring-offset-3 focus-visible:ring-offset-paper",
  "disabled:cursor-not-allowed disabled:border-hairline disabled:bg-hairline disabled:text-ink",
].join(" ");

const VARIANTS: Record<ButtonVariant, Record<ButtonSurface, string>> = {
  primary: {
    light: "border-orange bg-orange text-ink hover:border-navy hover:bg-navy hover:text-paper active:border-ink active:bg-ink active:text-paper",
    dark: "border-orange bg-orange text-ink hover:border-paper hover:bg-navy hover:text-paper active:border-ink active:bg-ink active:text-paper",
  },
  secondary: {
    light: "border-ink bg-transparent text-ink hover:border-navy hover:bg-navy hover:text-paper active:border-ink active:bg-ink active:text-paper",
    dark: "border-paper bg-transparent text-paper hover:bg-paper hover:text-navy active:border-ink active:bg-ink active:text-paper",
  },
};

const SIZES: Record<ButtonSize, string> = {
  regular: "gap-2 px-6 text-button",
  /** Section pairs keep quote + phone on one row down to a 265px column (320px viewport). */
  pair: "gap-1.5 px-2 text-small sm:gap-2 sm:px-6 sm:text-button",
  /** Header phone: a square 48px icon button that grows to show the number from lg. */
  icon: "min-w-12 gap-2 px-3 text-button lg:px-4",
};

interface ButtonOptions {
  surface?: ButtonSurface;
  size?: ButtonSize;
  /** Width, flex and shadow only; never display, gap, padding or type size. */
  extra?: string;
}

/** One button system: orange fill for the quote action, outlined for the phone. */
export function buttonClass(variant: ButtonVariant, { surface = "light", size = "regular", extra = "" }: ButtonOptions = {}): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant][surface]} ${extra}`.trim();
}

/** Page width and gutters shared by the header, every section and the footer. */
export const CONTAINER = "mx-auto max-w-[1200px] px-5 lg:px-8";

/** Inline text link on light surfaces: underlined, navy on hover, navy focus outline. */
export const INLINE_LINK =
  "font-semibold text-ink underline underline-offset-2 hover:text-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy";
