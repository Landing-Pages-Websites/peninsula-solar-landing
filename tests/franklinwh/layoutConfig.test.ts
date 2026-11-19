import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { OPTIMIZER_API, OPTIMIZER_SRC, SITE, TRACKING_API } from "../../src/franklinwh/config";

const layout = readFileSync(new URL("../../src/app/(franklinwh)/layout.tsx", import.meta.url), "utf8");

describe("FranklinWH layout tracking literals", () => {
  it("match the shared site identity", () => {
    assert.ok(layout.includes(`siteKey:"${SITE.siteKey}"`));
    assert.ok(layout.includes(`gtmId:"${SITE.gtmId}"`));
    assert.ok(layout.includes(`window.API_ENDPOINT="${OPTIMIZER_API}"`));
    assert.ok(layout.includes(`window.TRACKING_API_ENDPOINT="${TRACKING_API}"`));
    assert.equal(layout.split(SITE.siteId).length - 1, 2);
    assert.ok(layout.includes(`id="optimizer-script" src="${OPTIMIZER_SRC}"`));
  });

  it("loads the universal CTM script once, afterInteractive, and no manual GTM or Meta pixel", () => {
    assert.equal(layout.split("https://572388.tctm.co/t.js").length - 1, 1);
    assert.ok(layout.includes('strategy="afterInteractive"'));
    assert.equal(/googletagmanager\.com|fbevents|pixelId/.test(layout), false);
  });

  it("declares route-local favicons that exist, without a root icon that would change /", () => {
    for (const icon of ['url: "/franklinwh/favicon.png", type: "image/png", sizes: "32x32"', 'apple: "/franklinwh/apple-touch-icon.png"']) {
      assert.ok(layout.includes(icon), icon);
    }
    for (const file of ["favicon.png", "apple-touch-icon.png"]) {
      assert.ok(existsSync(new URL(`../../public/franklinwh/${file}`, import.meta.url)), file);
    }
    for (const rootIcon of ["icon.png", "icon.svg", "apple-icon.png", "favicon.ico"]) {
      assert.equal(existsSync(new URL(`../../src/app/${rootIcon}`, import.meta.url)), false, rootIcon);
    }
  });
});
