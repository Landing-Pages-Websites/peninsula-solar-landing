import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldShowFloating, type Box } from "../../src/franklinwh/floatingVisibility";

const VIEWPORT = 800;
function box(top: number, height: number, left = 0, width = 400): Box {
  return { top, bottom: top + height, left, right: left + width, width, height };
}
const LANE = box(720, 80);
const BASE = { viewportHeight: VIEWPORT, hero: box(-1500, 1000), cards: [box(3000, 700)], lane: LANE, obstructions: () => [box(100, 48)] };

describe("floating quote button", () => {
  it("shows in a real gap", () => {
    assert.equal(shouldShowFloating(BASE), true);
  });

  it("does not measure obstructions while the hero or a card is on screen", () => {
    let measured = false;
    const obstructions = (): Box[] => {
      measured = true;
      return [];
    };
    shouldShowFloating({ ...BASE, hero: box(-200, 1000), obstructions });
    assert.equal(measured, false);
  });

  it("hides while the hero is on screen", () => {
    assert.equal(shouldShowFloating({ ...BASE, hero: box(-200, 1000) }), false);
  });

  it("hides while any form card is exposed, even by one pixel", () => {
    assert.equal(shouldShowFloating({ ...BASE, cards: [box(799, 700)] }), false);
  });

  it("hides when it would cover a link, button, summary or footer text", () => {
    assert.equal(shouldShowFloating({ ...BASE, obstructions: () => [box(740, 48, 100, 200)] }), false);
  });

  it("ignores controls that only touch the lane edge", () => {
    assert.equal(shouldShowFloating({ ...BASE, obstructions: () => [box(672, 48)] }), true);
  });
});
