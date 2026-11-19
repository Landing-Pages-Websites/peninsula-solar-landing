// When the floating quote button may paint: pure geometry, re-read on every check.

export const HERO_SELECTOR = "#hero";
/** Wrapper around a whole lead-form card: title, fields, errors, privacy link, success. */
export const CARD_SELECTOR = "[data-lead-form-card]";
/** Controls the floating button must never cover. Exposed form cards already hide it. */
export const OBSTRUCTION_SELECTOR = "[data-cta], main a[href], main button, main summary, footer a, footer p";

export interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface VisibilityInput {
  viewportHeight: number;
  hero: Box | null;
  cards: readonly Box[];
  lane: Box | null;
  /** Read lazily: only measured once the hero and every card are off screen. */
  obstructions: () => readonly Box[];
}

/** Any positive overlap with the viewport counts, a single pixel included. */
function isExposed(box: Box, viewportHeight: number): boolean {
  return box.height > 0 && box.bottom > 0 && box.top < viewportHeight;
}

/** Strict overlap: boxes that only touch at an edge, or have no area, do not count. */
function intersects(a: Box, b: Box): boolean {
  if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) return false;
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

/**
 * Shown only in a real gap: the hero (with its form and paired actions) has scrolled away, no
 * form card is on screen, and the button's lane covers no link, button or disclosure.
 */
export function shouldShowFloating({ viewportHeight, hero, cards, lane, obstructions }: VisibilityInput): boolean {
  if (hero && isExposed(hero, viewportHeight)) return false;
  if (cards.some((card) => isExposed(card, viewportHeight))) return false;
  if (!lane) return false;
  return !obstructions().some((box) => intersects(lane, box));
}
