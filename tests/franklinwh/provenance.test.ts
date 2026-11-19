import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { HERO_FORM_ID, FINAL_FORM_ID, LOWER_PENINSULA, SITE, UPPER_PENINSULA } from "../../src/franklinwh/config";
import { FAQS, PRODUCT_MODELS, TESTIMONIALS } from "../../src/franklinwh/content";
import { FIELD_KEYS, isRequired } from "../../src/franklinwh/leadFields";

interface TaskSpec {
  scope: { routes: string[]; notCovered: { route: string } };
  site: { siteId: string; siteKey: string };
  tracking: { gtm: string };
  routeVariants: Record<string, { phone_routing_number: string | null; tel?: string }>;
  form: { fields: { key: (typeof FIELD_KEYS)[number]; required: boolean }[]; instances: { formId: string }[]; sourceProvider: string };
  brand: { colors: Record<string, string> };
}
interface ContentSources {
  claims: { claim: string; sources: string[] }[];
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8")) as T;
const spec = readJson<TaskSpec>("task-spec.json");
const sources = readJson<ContentSources>("content-sources.json");
const css = readFileSync(new URL("../../src/app/(franklinwh)/franklinwh.css", import.meta.url), "utf8").toLowerCase();

describe("task-spec.json", () => {
  it("matches the form keys, requiredness and form ids in code", () => {
    assert.deepEqual(spec.form.fields.map((f) => f.key), [...FIELD_KEYS]);
    for (const field of spec.form.fields) assert.equal(field.required, isRequired(field.key), field.key);
    assert.deepEqual(spec.form.instances.map((i) => i.formId), [HERO_FORM_ID, FINAL_FORM_ID]);
    assert.equal(spec.form.sourceProvider, SITE.sourceProvider);
  });

  it("matches each route's phone and the shared identity", () => {
    for (const variant of [UPPER_PENINSULA, LOWER_PENINSULA]) {
      assert.equal(spec.routeVariants[variant.path].phone_routing_number, variant.phone.display);
      assert.equal(spec.routeVariants[variant.path].tel, variant.phone.href);
    }
    assert.equal(spec.site.siteId, SITE.siteId);
    assert.equal(spec.site.siteKey, SITE.siteKey);
    assert.equal(spec.tracking.gtm, SITE.gtmId);
  });

  it("uses the brand colors the stylesheet defines", () => {
    for (const hex of Object.values(spec.brand.colors)) assert.ok(css.includes(hex.toLowerCase()), hex);
  });

  it("states that the protected root is not covered", () => {
    assert.equal(spec.scope.notCovered.route, "/");
    assert.equal(spec.scope.routes.includes("/"), false);
  });
});

describe("content-sources.json", () => {
  const text = JSON.stringify(sources.claims);
  it("sources every testimonial, FAQ and product model with a URL", () => {
    for (const review of TESTIMONIALS) assert.ok(text.includes(`Testimonial, ${review.author}`) && text.includes(review.quote), review.author);
    for (const faq of FAQS) assert.ok(text.includes(`FAQ: ${faq.question}`), faq.question);
    for (const model of PRODUCT_MODELS) assert.ok(text.includes(`${model.name}:`), model.name);
    for (const claim of sources.claims) assert.ok(claim.sources.length > 0, claim.claim);
    for (const claim of sources.claims.filter((c) => /^(Testimonial|FAQ)/.test(c.claim))) {
      assert.ok(claim.sources.some((s) => s.startsWith("https://")), claim.claim);
    }
  });
});
