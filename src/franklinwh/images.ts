// Optimized copies of the approved originals in public/franklinwh (provenance in
// docs/franklinwh/image-ledger.json). Each image is used in exactly one section.

export interface ResponsiveSource {
  base: string;
  widths: readonly number[];
  /** Intrinsic size of the largest variant; sets the aspect ratio and prevents layout shift. */
  width: number;
  height: number;
  alt: string;
}

const DIR = "/franklinwh";

export function srcSet(image: ResponsiveSource): string {
  return image.widths.map((w) => `${srcFor(image, w)} ${w}w`).join(", ");
}

export function srcFor(image: ResponsiveSource, width: number): string {
  return `${DIR}/${image.base}-${width}.webp`;
}

export function largestSrc(image: ResponsiveSource): string {
  return srcFor(image, image.widths[image.widths.length - 1]);
}

export const IMAGES = {
  heroInstallation: {
    base: "apower-s-installation",
    widths: [800, 1300, 1800],
    width: 1800,
    height: 1350,
    alt: "Two FranklinWH aPower S batteries on a concrete pad beside a house, with the aGate controller mounted on the wall above the electrical boxes",
  },
  aGate: {
    base: "agate",
    widths: [700, 1200],
    width: 1200,
    height: 1042,
    alt: "FranklinWH aGate controller",
  },
  aPower2AndAGate: {
    base: "apower-2-and-agate",
    widths: [800, 1300],
    width: 1300,
    height: 982,
    alt: "FranklinWH aPower 2 battery beside the smaller aGate controller",
  },
  marquetteEquipment: {
    base: "marquette-franklinwh-equipment",
    widths: [900, 1200, 1400],
    width: 1400,
    height: 1050,
    alt: "FranklinWH equipment mounted on an interior wall next to the main electrical panel at the Marquette project",
  },
  marquetteArray: {
    base: "marquette-rooftop-array",
    widths: [900, 1200, 1400],
    width: 1400,
    height: 1050,
    alt: "Rows of solar panels on the low-slope roof of the Marquette project, with autumn trees behind",
  },
  marquetteRacking: {
    base: "marquette-racking-detail",
    widths: [600, 1000, 1200],
    width: 1200,
    height: 1600,
    alt: "Close view of a panel clamp, mounting foot and concrete ballast blocks on the Marquette roof",
  },
} as const satisfies Record<string, ResponsiveSource>;
