import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const css = readFileSync(new URL("../../src/app/(franklinwh)/franklinwh.css", import.meta.url), "utf8");
const token = (name: string): string => {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, "i"));
  if (!match) throw new Error(`missing token ${name}`);
  return match[1];
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

describe("text contrast of the pairs the page uses", () => {
  const TEXT_PAIRS: [string, Rgb, Rgb][] = [
    ["body on paper", rgb(token("ink")), rgb(token("paper"))],
    ["muted on paper", rgb(token("muted")), rgb(token("paper"))],
    ["muted on surface", rgb(token("muted")), rgb(token("surface"))],
    ["ink on orange button", rgb(token("ink")), rgb(token("orange"))],
    ["paper on navy hover", rgb(token("paper")), rgb(token("navy"))],
    ["navy step numbers on paper", rgb(token("navy")), rgb(token("paper"))],
    ["ink alert on sand", rgb(token("ink")), rgb(token("sand"))],
    ["pending (disabled) button", rgb(token("ink")), rgb(token("hairline"))],
    ["80% paper on navy", blend(rgb(token("paper")), rgb(token("navy")), 0.8), rgb(token("navy"))],
    ["80% paper on charcoal", blend(rgb(token("paper")), rgb(token("charcoal")), 0.8), rgb(token("charcoal"))],
    ["70% paper on charcoal", blend(rgb(token("paper")), rgb(token("charcoal")), 0.7), rgb(token("charcoal"))],
  ];
  for (const [label, fg, bg] of TEXT_PAIRS) {
    it(`${label} is at least 4.5:1`, () => assert.ok(ratio(fg, bg) >= 4.5, `${label}: ${ratio(fg, bg).toFixed(2)}`));
  }

  it("input borders meet 3:1 for UI components", () => {
    assert.ok(ratio(rgb(token("line")), rgb(token("paper"))) >= 3);
  });

  it("never pairs white text with the orange fill", () => {
    assert.ok(ratio(rgb(token("paper")), rgb(token("orange"))) < 4.5);
  });
});
