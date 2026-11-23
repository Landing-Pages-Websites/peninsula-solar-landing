// Flyer restyle (task 45272822): the light FranklinWH palette became the client's navy / cream / gold.
// The pairs below are the ones the restyled page paints, including the glow and sky composites the
// text actually sits on, every form state and the role aliases the form components still use.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const css = readFileSync(new URL("../../src/app/(franklinwh)/franklinwh.css", import.meta.url), "utf8");

/** A theme color, following `var(--color-x)` role aliases to their hex value. */
const token = (name: string): string => {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6}|var\\(--color-([a-z-]+)\\))`, "i"));
  if (!match) throw new Error(`missing token ${name}`);
  return match[2] ? token(match[2]) : match[1];
};

type Rgb = [number, number, number];
const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const blend = (fg: Rgb, bg: Rgb, alpha: number): Rgb => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha)) as Rgb;
const luminance = (c: Rgb): number => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The brightest point of a glow utility: its `color-mix(token N%, transparent)` stop over the ground beneath it. */
const glowPeak = (utility: string, ground: string): Rgb => {
  const start = css.indexOf(`@utility ${utility} {`);
  const block = css.slice(start, css.indexOf("\n}", start));
  const match = block.match(/color-mix\(in srgb, var\(--color-([a-z-]+)\) (\d+)%, transparent\)/);
  if (!match) throw new Error(`no glow stop in ${utility}`);
  return blend(rgb(token(match[1])), rgb(token(ground)), Number(match[2]) / 100);
};

const C = (name: string): Rgb => rgb(token(name));
const GROUNDS: [string, Rgb][] = [
  ["night", C("night")],
  ["harbor", C("harbor")],
  ["dusk", C("dusk")],
  ["section glow peak", glowPeak("bg-glow", "night")],
  ["raised glow peak", glowPeak("bg-glow-raised", "harbor")],
  ["hero sky peak", glowPeak("bg-evening", "dusk")],
];

describe("text contrast of the pairs the page uses", () => {
  for (const [ground, bg] of GROUNDS) {
    for (const text of ["cream", "mist", "gold"]) {
      it(`${text} text on ${ground} is at least 4.5:1`, () => {
        const r = ratio(C(text), bg);
        assert.ok(r >= 4.5, `${text} on ${ground}: ${r.toFixed(2)}`);
      });
    }
  }

  const PAIRS: [string, Rgb, Rgb][] = [
    ["navy label on the gold quote button", C("night"), C("gold")],
    ["navy label on the hovered gold button", C("night"), C("gold-light")],
    ["navy label on the pressed (cream) button", C("night"), C("cream")],
    ["pending (disabled) button label", C("mist"), C("dusk")],
    ["phone button label on its gold/15 hover", C("cream"), blend(C("gold"), C("night"), 0.15)],
    ["phone button label on its gold/25 press", C("cream"), blend(C("gold"), C("night"), 0.25)],
    ["form alert text", C("cream"), C("dusk")],
    ["input text and placeholder", C("mist"), C("night")],
    ["disabled input text", C("mist"), C("harbor")],
    ["checkbox tick (paper alias) on its checked fill (navy alias)", C("paper"), C("navy")],
    ["form labels (ink alias) on the form card (surface alias)", C("ink"), C("surface")],
    ["optional and helper text (muted alias) on the form card", C("muted"), C("surface")],
  ];
  for (const [label, fg, bg] of PAIRS) {
    it(`${label} is at least 4.5:1`, () => assert.ok(ratio(fg, bg) >= 4.5, `${label}: ${ratio(fg, bg).toFixed(2)}`));
  }

  it("input and checkbox borders meet 3:1 for UI components on every form ground", () => {
    for (const ground of ["night", "harbor"]) assert.ok(ratio(C("line"), C(ground)) >= 3, ground);
  });

  it("the coral error border meets 3:1 on every form ground", () => {
    for (const ground of ["night", "harbor"]) assert.ok(ratio(C("error"), C(ground)) >= 3, ground);
  });

  it("gold focus outlines and hover borders meet 3:1 on every ground", () => {
    for (const [ground, bg] of GROUNDS) assert.ok(ratio(C("gold"), bg) >= 3, ground);
  });

  it("never pairs cream text with the gold fill", () => {
    assert.ok(ratio(C("cream"), C("gold")) < 4.5);
  });
});
