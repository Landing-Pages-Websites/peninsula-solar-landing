// Delivered-density contract for every viewport from 320 to 1728px. A DPR 1 browser picks the
// smallest srcset file at least as wide as the slot, so a band passes only if its SMALLEST file
// holds 2x the largest slot it can render in. Slots are modelled from the authored CSS with no
// scrollbar (the widest case) and checked against the controller's native r2 receipts in comments.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { LOWER_PENINSULA, UPPER_PENINSULA } from "../../src/franklinwh/config";
import { deliveryBands, IMAGES, srcFor, TARGET_DENSITY, VIEWPORT_BANDS, type ResponsiveSource } from "../../src/franklinwh/images";
import { attr, classes, elements, renderPage, tags } from "./html";

type ImageKey = keyof typeof IMAGES;

const MIN_VIEWPORT = 320;
const MAX_VIEWPORT = 1728;
const LG = 1024;
const PUBLIC = new URL("../../public", import.meta.url);

/** CONTAINER: max-w 1200px, 20px side padding below lg and 32px from lg. */
function content(v: number): number {
  return v < LG ? v - 40 : Math.min(v, 1200) - 64;
}

/** The 7fr column of a 7fr/5fr grid with a 40px gap, widening to `xlGap` from 1280px. */
function sevenTwelfths(v: number, xlGap: number): number {
  return ((content(v) - (v >= 1280 ? xlGap : 40)) * 7) / 12;
}

interface SlotModel {
  slot: (v: number) => number;
  /** Displayed width/height when it differs from the file's (the hero's 16:10 cover crop). */
  aspect?: number;
}

/** Rendered CSS width per viewport. a-768: hero 713 at client 753; a-1024: 527.9 (hero, aPower 2) and 344.5 (aGate) at client 1009. */
const MODELS: Record<ImageKey, SlotModel> = {
  heroInstallation: { slot: (v) => (v < LG ? content(v) : sevenTwelfths(v, 56)), aspect: 16 / 10 },
  aGate: { slot: (v) => Math.min(440, v < LG ? content(v) - 64 : (content(v) - 64) / 2 - 96) },
  aPower2AndAGate: { slot: (v) => (v < LG ? content(v) : sevenTwelfths(v, 64)) },
};

/** Every integer viewport plus the last fractional pixel below each band edge. */
const VIEWPORTS = [
  ...Array.from({ length: MAX_VIEWPORT - MIN_VIEWPORT + 1 }, (_, i) => MIN_VIEWPORT + i),
  ...VIEWPORT_BANDS.filter((edge) => edge > MIN_VIEWPORT).map((edge) => edge - 0.01),
];

const SIZES = new Map<string, [number, number]>();

/** Pixel size from the WebP header, read once per file. */
function webpSize(path: string): [number, number] {
  const known = SIZES.get(path);
  if (known) return known;
  const size = readWebpSize(path);
  SIZES.set(path, size);
  return size;
}

function readWebpSize(path: string): [number, number] {
  const buf = readFileSync(new URL(`.${path}`, `${PUBLIC.href}/`));
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (chunk === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
  throw new Error(`${path}: unknown WebP chunk ${chunk}`);
}

interface Candidate {
  file: string;
  w: number;
}

function candidates(srcSet: string): Candidate[] {
  return srcSet.split(", ").map((entry) => {
    const [file, descriptor] = entry.split(" ");
    return { file, w: Number.parseInt(descriptor, 10) };
  });
}

interface RenderedSet {
  minViewport: number;
  srcSet: string;
  sizes: string;
}

/** The image's <source>s (widest first) then its <img>, as rendered on the page. */
function renderedSets(html: string, image: ResponsiveSource): RenderedSet[] {
  const owns = (markup: string): boolean => markup.includes(`/franklinwh/${image.base}-`);
  const picture = elements(html, "picture").find(owns);
  const sources = picture ? tags(picture, "source") : [];
  const img = tags(picture ?? html, "img").find(owns);
  assert.ok(img, image.base);
  const sets = sources.map((tag) => {
    const media = attr(tag, "media")?.match(/^\(min-width: (\d+)px\)$/);
    assert.ok(media, tag);
    return { minViewport: Number(media[1]), srcSet: attr(tag, "srcSet") ?? "", sizes: attr(tag, "sizes") ?? "" };
  });
  return [...sets, { minViewport: 0, srcSet: attr(img, "srcSet") ?? "", sizes: attr(img, "sizes") ?? "" }];
}

function evalLength(expr: string, v: number): number {
  const calc = expr.match(/^calc\(([\d.]+)vw - ([\d.]+)px\)$/);
  if (calc) return (v * Number(calc[1])) / 100 - Number(calc[2]);
  const vw = expr.match(/^([\d.]+)vw$/);
  if (vw) return (v * Number(vw[1])) / 100;
  const px = expr.match(/^([\d.]+)px$/);
  if (px) return Number(px[1]);
  throw new Error(`unsupported sizes length ${expr}`);
}

function evalSizes(sizes: string, v: number): number {
  for (const entry of sizes.split(", ")) {
    const media = entry.match(/^\(min-width: (\d+)px\) (.+)$/);
    if (!media) return evalLength(entry, v);
    if (v >= Number(media[1])) return evalLength(media[2], v);
  }
  throw new Error(`sizes without a default: ${sizes}`);
}

/** The file a DPR 1 browser picks from a set: its smallest candidate. */
function smallestFile(set: RenderedSet): Candidate {
  return candidates(set.srcSet).reduce((a, b) => (b.w < a.w ? b : a));
}

/** Decoded density shortfall of a file in a slot `cssW` wide: <= 1 passes at TARGET_DENSITY. */
function ratio(file: string, cssW: number, aspect: number): number {
  const [fileW, fileH] = webpSize(file);
  return Math.max(cssW / fileW, cssW / aspect / fileH) * TARGET_DENSITY;
}

const ROUTES = [
  ["A", renderPage(UPPER_PENINSULA)],
  ["B", renderPage(LOWER_PENINSULA)],
] as const;

describe("image delivery across every viewport 320-1728", () => {
  for (const [key, image] of Object.entries(IMAGES) as [ImageKey, ResponsiveSource][]) {
    const model = MODELS[key];
    const aspect = model.aspect ?? image.width / image.height;

    it(`${key}: each declared band slot covers every modelled slot in that band`, () => {
      for (const v of VIEWPORTS) {
        const band = VIEWPORT_BANDS.find((edge) => v >= edge) ?? 0;
        const slot = model.slot(v);
        if (slot > image.slots[band]) assert.fail(`${v}px: ${slot.toFixed(1)} > ${image.slots[band]}`);
      }
    });

    for (const [route, html] of ROUTES) {
      it(`${key} (route ${route}): the selected band's smallest file holds 2x the slot at every viewport`, () => {
        const picks = renderedSets(html, image).map((set) => ({ minViewport: set.minViewport, file: smallestFile(set).file }));
        for (const v of VIEWPORTS) {
          const pick = picks.find((p) => v >= p.minViewport);
          if (!pick) assert.fail(`${v}px: no set applies`);
          const r = ratio(pick.file, model.slot(v), aspect);
          if (r > 1) assert.fail(`${v}px: ratio ${r.toFixed(3)} from ${pick.file}`);
        }
      });
    }

    it(`${key}: sizes states the true slot (never below it, at most 12% above it)`, () => {
      const sets = renderedSets(ROUTES[0][1], image);
      for (const v of VIEWPORTS) {
        const stated = evalSizes(sets[0].sizes, v);
        const slot = model.slot(v);
        if (stated < slot - 0.5 || stated > slot * 1.12) assert.fail(`${v}px: sizes ${stated.toFixed(1)} vs slot ${slot.toFixed(1)}`);
      }
      assert.ok(sets.every((s) => s.sizes === sets[0].sizes), "every <source> repeats the <img> sizes");
    });

    it(`${key}: every srcset descriptor is the file's real width at the image's aspect ratio`, () => {
      for (const w of image.widths) {
        const file = srcFor(image, w);
        const [fileW, fileH] = webpSize(file);
        assert.equal(fileW, w, file);
        assert.ok(Math.abs(fileH - (w * image.height) / image.width) <= 1, `${file}: ${fileW}x${fileH}`);
      }
    });
  }

  it("bands are ordered widest first on the VIEWPORT_BANDS edges, and the <img> is the narrowest band", () => {
    for (const image of Object.values(IMAGES)) {
      const bands = deliveryBands(image).map((band) => band.minViewport);
      assert.deepEqual(bands, [...bands].sort((a, b) => b - a));
      assert.ok(bands.every((edge) => (VIEWPORT_BANDS as readonly number[]).includes(edge)));
      assert.equal(bands[bands.length - 1], 0);
    }
  });

  it("keeps the <img> as the layout item: the <picture> is display: contents", () => {
    const pictures = elements(ROUTES[0][1], "picture");
    assert.equal(pictures.length, Object.values(IMAGES).filter((image) => deliveryBands(image).length > 1).length);
    for (const picture of pictures) assert.deepEqual(classes(tags(picture, "picture")[0]), ["contents"]);
  });

  it("ships no unreferenced photo variant", () => {
    const referenced = new Set(Object.values(IMAGES).flatMap((image) => image.widths.map((w) => `${image.base}-${w}.webp`)));
    const shipped = readdirSync(new URL("./franklinwh/", `${PUBLIC.href}/`)).filter((file) => file.endsWith(".webp"));
    assert.deepEqual(shipped.sort(), [...referenced].sort());
    for (const image of Object.values(IMAGES)) {
      const offered = new Set(deliveryBands(image).flatMap((band) => band.widths));
      assert.deepEqual([...offered].sort((a, b) => a - b), [...image.widths], image.base);
    }
  });
});
