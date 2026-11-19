import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FranklinPage } from "../../src/franklinwh/components/FranklinPage";
import { LOWER_PENINSULA, UPPER_PENINSULA } from "../../src/franklinwh/config";
import { sectionHtml } from "./html";

/** Exact copy from the human send-back (task 3d9afce8, comment 3883a418), NBSPs and nowrap groups included. */
const EXPECTED: [section: string, markup: string][] = [
  ["hero", 'Serving Northern Michigan homes, <span class="whitespace-nowrap">cabins and camps</span> since\u00a02011.'],
  ["customer-proof", "They have to be the best in the business in Northern Michigan and the U.P. … I am very happy with their performance and the end\u00a0result!"],
  ["product-family", ">The FranklinWH lineup</h2>"],
  ["customer-proof", "Customer reviews"],
  ["final-quote", 'Let’s plan <span class="whitespace-nowrap">your backup power</span></h2>'],
  ["faq", "Will the batteries work through a Northern Michigan\u00a0winter?"],
  ["faq", "Yes. FranklinWH batteries have integrated heating and cooling that protects them in extreme temperatures, so they keep performing through Midwest winters and longer\u00a0outages."],
];
const RETIRED = ["For Northern Michigan homes", "Good at communication", "Meet the FranklinWH", "What our customers", "What does LFP mean"];

for (const variant of [UPPER_PENINSULA, LOWER_PENINSULA]) {
  describe(`${variant.path} send-back copy`, () => {
    const html = renderToStaticMarkup(createElement(FranklinPage, { variant }));

    it("renders each prescribed string in its section", () => {
      for (const [section, markup] of EXPECTED) assert.ok(sectionHtml(html, section).includes(markup), markup);
    });

    it("no longer renders the replaced copy", () => {
      for (const text of RETIRED) assert.equal(html.includes(text), false, text);
    });
  });
}
