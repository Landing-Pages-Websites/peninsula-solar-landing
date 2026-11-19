import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LOWER_PENINSULA, UPPER_PENINSULA } from "../../src/franklinwh/config";
import { TESTIMONIALS } from "../../src/franklinwh/content";
import { anchors, attr, elements, renderPage, sectionHtml, stripTags, tags, visibleText } from "./html";

const PAGES = [
  { variant: UPPER_PENINSULA, own: ["(906) 235-0340", "tel:+19062350340"], other: ["231", "590-7305"] },
  { variant: LOWER_PENINSULA, own: ["(231) 590-7305", "tel:+12315907305"], other: ["906", "235-0340"] },
];
const SECTION_ORDER = ["hero", "backup-benefits", "product-family", "marquette-project", "in-house-process", "customer-proof", "faq", "final-quote"];

for (const { variant, own, other } of PAGES) {
  describe(`${variant.path}`, () => {
    const html = renderPage(variant);

    it("uses only its own route phone", () => {
      for (const value of own) assert.ok(html.includes(value), value);
      for (const value of other) assert.equal(html.includes(value), false, value);
      const tels = anchors(html).map((a) => attr(a.tag, "href")).filter((href) => href?.startsWith("tel:"));
      assert.ok(tels.length >= 9);
      assert.deepEqual([...new Set(tels)], [own[1]]);
    });

    it("renders the sections in blueprint order with kebab-case anchors", () => {
      const ids = tags(html, "section").map((tag) => attr(tag, "id"));
      assert.deepEqual(ids, SECTION_ORDER);
      for (const id of ids) assert.match(id ?? "", /^[a-z]+(-[a-z]+)*$/);
    });

    it("has one h1 with the exact category headline", () => {
      assert.deepEqual(html.match(/<h1\b[^>]*>(.*?)<\/h1>/g)?.length, 1);
      assert.match(html, /<h1[^>]*>FranklinWH home battery backup<\/h1>/);
    });

    it("names every model the task lists", () => {
      for (const model of ["aGate", "aPower S", "aPower 2", "aPower X", "15 kWh", "13.6 kWh"]) assert.ok(html.includes(model), model);
    });

    it("sends CTAs forward: hero and header to the hero form, later sections to the final form", () => {
      const header = html.slice(0, html.indexOf("<main"));
      const quoteLinks = (chunk: string): (string | null)[] =>
        anchors(chunk).filter((a) => a.text.includes("Request a free quote")).map((a) => attr(a.tag, "href"));
      assert.deepEqual(quoteLinks(header), ["#hero-form"]);
      assert.deepEqual(quoteLinks(sectionHtml(html, "hero")), ["#hero-form"]);
      for (const id of SECTION_ORDER.slice(1, -1)) assert.deepEqual(quoteLinks(sectionHtml(html, id)), ["#form"], id);
      assert.deepEqual(quoteLinks(sectionHtml(html, "final-quote")), []);
      assert.ok(html.includes('id="hero-form"') && html.includes('id="form"'));
    });

    it("shows each image file once and gives every image alt text", () => {
      const sources = tags(html, "img").map((tag) => attr(tag, "src"));
      assert.equal(new Set(sources).size, sources.length);
      for (const tag of tags(html, "img")) assert.ok((attr(tag, "alt") ?? "").length > 0, tag);
    });

    it("gives every link and button an accessible name", () => {
      for (const a of anchors(html)) assert.ok(a.text.length > 0 || attr(a.tag, "aria-label"), a.tag);
      for (const button of elements(html, "button")) assert.ok(stripTags(button), button);
    });

    it("links the privacy policy under both forms and in the footer", () => {
      const privacy = anchors(html).filter((a) => attr(a.tag, "href") === "/privacy" && a.text === "Privacy Policy");
      assert.equal(privacy.length, 3);
    });

    it("narrates no sources and keeps the footer to identity, phone and legal links", () => {
      const text = visibleText(html);
      assert.equal(/google|trustindex|from reviews/i.test(text), false);
      const [footer] = elements(html, "footer");
      assert.equal(footer.includes("designs and installs"), false);
      assert.deepEqual(anchors(footer).map((a) => attr(a.tag, "href")), [own[1], "/privacy"]);
      assert.ok(footer.includes('alt="Peninsula Solar"'));
    });

    it("keeps every testimonial quote and first name", () => {
      for (const review of TESTIMONIALS) {
        assert.ok(html.includes(`&ldquo;${review.quote}&rdquo;`) || html.includes(`“${review.quote}”`), review.author);
        assert.ok(html.includes(`>${review.author}</figcaption>`), review.author);
      }
    });

    it("makes no financial, savings or runtime promises", () => {
      const text = visibleText(html).toLowerCase();
      for (const banned of ["tax credit", "savings", "save money", "roi", "financing", "payback", "%", "whole-home", "unlimited", "guarantee", "call forwarding"]) {
        assert.equal(text.includes(banned), false, banned);
      }
    });
  });
}
