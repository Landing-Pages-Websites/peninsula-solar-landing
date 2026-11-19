// Optimized copies of the approved originals in public/franklinwh (provenance in
// docs/franklinwh/image-ledger.json). Each image is used in exactly one section.
//
// Delivery policy: at DPR 1 a browser picks the smallest srcset file at least as wide as the slot,
// so a 1x file wins unless nothing smaller is offered. Each image therefore declares its largest
// CSS slot per viewport band, and each band's srcset (a `<source media>` in ResponsiveImage) lists
// only files holding TARGET_DENSITY x that slot. `sizes` stays the true slot width.

/** Band lower edges in CSS px, widest first; each band runs up to the next wider edge. */
export const VIEWPORT_BANDS = [1024, 768, 640, 480, 0] as const;
export type ViewportBand = (typeof VIEWPORT_BANDS)[number];

export const TARGET_DENSITY = 2;

export interface ResponsiveSource {
  base: string;
  /** Every variant in public/franklinwh, ascending. */
  widths: readonly number[];
  /** Largest CSS slot width in each band, measured at the band's widest viewport with no scrollbar. */
  slots: Readonly<Record<ViewportBand, number>>;
  /** Intrinsic size of the largest variant; sets the aspect ratio and prevents layout shift. */
  width: number;
  height: number;
  alt: string;
}

export interface DeliveryBand {
  minViewport: ViewportBand;
  widths: readonly number[];
}

const DIR = "/franklinwh";

export function srcFor(image: ResponsiveSource, width: number): string {
  return `${DIR}/${image.base}-${width}.webp`;
}

export function largestSrc(image: ResponsiveSource): string {
  return srcFor(image, image.widths[image.widths.length - 1]);
}

export function srcSet(image: ResponsiveSource, widths: readonly number[]): string {
  return widths.map((w) => `${srcFor(image, w)} ${w}w`).join(", ");
}

function bandWidths(image: ResponsiveSource, band: ViewportBand): number[] {
  const widths = image.widths.filter((w) => w >= TARGET_DENSITY * image.slots[band]);
  if (widths.length === 0) throw new Error(`${image.base}: no variant holds ${TARGET_DENSITY}x the ${band}px band slot`);
  return widths;
}

/**
 * Widest band first; neighbouring bands with the same widths merge into the narrower one. Each list is
 * a suffix of `image.widths`, so equal floors mean equal lists.
 */
export function deliveryBands(image: ResponsiveSource): DeliveryBand[] {
  const bands: DeliveryBand[] = [];
  for (const minViewport of VIEWPORT_BANDS) {
    const widths = bandWidths(image, minViewport);
    const previous = bands[bands.length - 1];
    if (previous && previous.widths[0] === widths[0]) previous.minViewport = minViewport;
    else bands.push({ minViewport, widths });
  }
  return bands;
}

/** Single-column slot below lg (container padding 20px each side), per band. */
const FULL_COLUMN = { 768: 984, 640: 728, 480: 600, 0: 440 } as const;

export const IMAGES = {
  heroInstallation: {
    base: "apower-s-installation",
    // 7/12 hero column, at most 640px from lg.
    widths: [900, 1300, 1500, 1800, 2000],
    slots: { 1024: 640, ...FULL_COLUMN },
    width: 2000,
    height: 1500,
    alt: "Two FranklinWH aPower S batteries on a concrete pad beside a house, with the aGate controller mounted on the wall above the electrical boxes",
  },
  aGate: {
    base: "agate",
    // Capped at 440px by its max-width at every viewport.
    widths: [1200],
    slots: { 1024: 440, 768: 440, 640: 440, 480: 440, 0: 440 },
    width: 1200,
    height: 1042,
    alt: "FranklinWH aGate controller",
  },
  aPower2AndAGate: {
    base: "apower-2-and-agate",
    // 7/12 column from lg, at most 640px (1200-1279px, 40px column gap).
    widths: [900, 1300, 1500, 2000],
    slots: { 1024: 640, ...FULL_COLUMN },
    width: 2000,
    height: 1511,
    alt: "FranklinWH aPower 2 battery beside the smaller aGate controller",
  },
  marquetteEquipment: {
    base: "marquette-franklinwh-equipment",
    // 4 of 10.25 flex shares in the photo row from lg, at most 432px.
    widths: [900, 1200, 1400, 1500, 2000],
    slots: { 1024: 432, ...FULL_COLUMN },
    width: 2000,
    height: 1500,
    alt: "FranklinWH equipment mounted on an interior wall next to the main electrical panel at the Marquette project",
  },
  marquetteArray: {
    base: "marquette-rooftop-array",
    // 4 of 10.25 flex shares in the photo row from lg, at most 432px.
    widths: [900, 1200, 1400, 1500, 2000],
    slots: { 1024: 432, ...FULL_COLUMN },
    width: 2000,
    height: 1500,
    alt: "Rows of solar panels on the low-slope roof of the Marquette project, with autumn trees behind",
  },
  marquetteRacking: {
    base: "marquette-racking-detail",
    // 2.25 of 10.25 flex shares from lg (at most 243px); below lg the figure is capped at 750px,
    // the widest slot the 1500px original covers at 2x.
    widths: [600, 900, 1000, 1200, 1500],
    slots: { 1024: 243, ...FULL_COLUMN, 768: 750 },
    width: 1500,
    height: 2000,
    alt: "Close view of a panel clamp, mounting foot and concrete ballast blocks on the Marquette roof",
  },
} as const satisfies Record<string, ResponsiveSource>;
