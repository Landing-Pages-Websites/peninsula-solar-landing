import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LeadFormFields } from "../../src/franklinwh/components/LeadFormFields";
import { UPPER_PENINSULA } from "../../src/franklinwh/config";
import { EMPTY_VALUES } from "../../src/franklinwh/leadFields";
import { attr, elements, hasAttr, renderPage, stripTags, tags } from "./html";

const forms = elements(renderPage(UPPER_PENINSULA), "form");
const LABELS: Record<string, string> = {
  name: "Full Name",
  phone: "Phone Number",
  email: "Email",
  utility: "Utility Company",
  offGrid: "Interested in off-grid / battery backup?",
  message: "Message",
};

describe("both lead forms", () => {
  it("render twice, with the expected ids, noValidate and no native submit control", () => {
    assert.deepEqual(forms.map((form) => attr(tags(form, "form")[0], "id")), ["hero-lead-form", "final-lead-form"]);
    for (const form of forms) {
      assert.ok(hasAttr(tags(form, "form")[0], "noValidate") || hasAttr(tags(form, "form")[0], "novalidate"));
      assert.equal(form.includes('type="submit"'), false);
      assert.deepEqual(tags(form, "button").map((b) => attr(b, "type")), ["button"]);
    }
  });

  it("use exactly the six keys, each with a visible associated label", () => {
    for (const form of forms) {
      const controls = [...tags(form, "input"), ...tags(form, "textarea")];
      assert.deepEqual(controls.map((c) => attr(c, "name")), ["name", "phone", "email", "utility", "offGrid", "message"]);
      for (const control of controls) {
        const id = attr(control, "id");
        const label = form.match(new RegExp(`<label[^>]*for="${id}"[^>]*>([\\s\\S]*?)</label>`));
        assert.ok(label, `label for ${id}`);
        assert.ok(stripTags(label[1]).includes(LABELS[attr(control, "name") ?? ""]), id ?? "");
      }
    }
  });

  it("mark only name and phone required, with canonical phone and email attributes", () => {
    for (const form of forms) {
      const byName = Object.fromEntries([...tags(form, "input"), ...tags(form, "textarea")].map((c) => [attr(c, "name"), c]));
      assert.deepEqual(Object.keys(byName).filter((k) => hasAttr(byName[k], "required")), ["name", "phone"]);
      assert.equal(attr(byName.phone, "type"), "tel");
      assert.equal(attr(byName.phone, "inputMode"), "numeric");
      assert.equal(attr(byName.phone, "autoComplete"), "tel-national");
      assert.equal(hasAttr(byName.phone, "maxLength"), false);
      assert.equal(attr(byName.email, "type"), "email");
      assert.equal(attr(byName.email, "maxLength"), "254");
      assert.equal(hasAttr(byName.message, "maxLength"), false);
      assert.equal(attr(byName.offGrid, "type"), "checkbox");
      assert.equal(hasAttr(byName.offGrid, "checked"), false);
    }
  });

  it("tie each error message to its field", () => {
    const markup = renderToStaticMarkup(
      createElement(LeadFormFields, {
        formId: "t", values: EMPTY_VALUES, errors: { name: "Enter your full name", email: "bad" }, disabled: false, messageRows: 3,
        onValue: () => undefined, onBlur: () => undefined,
      }),
    );
    for (const key of ["name", "email"]) {
      const input = tags(markup, "input").find((tag) => attr(tag, "name") === key) ?? "";
      assert.equal(attr(input, "aria-invalid"), "true");
      const describedBy = attr(input, "aria-describedby");
      assert.ok(describedBy && markup.includes(`id="${describedBy}"`), key);
    }
    const phone = tags(markup, "input").find((tag) => attr(tag, "name") === "phone") ?? "";
    assert.equal(hasAttr(phone, "aria-invalid"), false);
  });
});

describe("submit mechanics in source", () => {
  const source = ["LeadForm.tsx", "LeadFormProvider.tsx", "LeadFormFields.tsx", "formKeyboardHandlers.ts", "useLeadSubmission.ts"]
    .map((file) => readFileSync(new URL(`../../src/franklinwh/components/${file}`, import.meta.url), "utf8"))
    .join("\n");

  it("never dispatches a native submit", () => {
    assert.equal(source.includes("requestSubmit"), false);
    assert.equal(source.includes('type="submit"'), false);
  });

  it("stops Enter on keydown but keeps it for textarea, select, buttons, links and IME", () => {
    assert.match(source, /onKeyDown=\{handleKeyDown\}/);
    assert.match(source, /isComposing/);
    assert.match(source, /new Set\(\["TEXTAREA", "SELECT", "BUTTON", "A"\]\)/);
  });
});
