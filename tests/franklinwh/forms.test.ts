import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LeadFormFields } from "../../src/franklinwh/components/LeadFormFields";
import { FormErrorAlert } from "../../src/franklinwh/components/FormErrorAlert";
import { FormUnknownAlert } from "../../src/franklinwh/components/FormUnknownAlert";
import { LOWER_PENINSULA, UPPER_PENINSULA } from "../../src/franklinwh/config";
import { EMPTY_VALUES } from "../../src/franklinwh/leadFields";
import { attr, elements, hasAttr, readSource, renderPage, stripTags, tags } from "./html";

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
    .map((file) => readSource(`components/${file}`))
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

describe("request outcome alerts", () => {
  for (const variant of [UPPER_PENINSULA, LOWER_PENINSULA]) {
    it(`${variant.path}: an unknown outcome offers the route phone, never a resend, and only the sending form announces it`, () => {
      const announced = renderToStaticMarkup(createElement(FormUnknownAlert, { phone: variant.phone, announce: true }));
      const quiet = renderToStaticMarkup(createElement(FormUnknownAlert, { phone: variant.phone, announce: false }));
      assert.match(announced, /^<p role="alert"/);
      assert.equal(quiet.includes("role="), false);
      const text = stripTags(announced).replace(/&#x27;|&apos;/g, "'");
      assert.match(text, /couldn't confirm/);
      assert.equal(/try again|resend|send it again|wasn't sent|was not sent|not received/i.test(text), false);
      assert.ok(announced.includes(`href="${variant.phone.href}"`) && text.includes(variant.phone.display));
    });

    it(`${variant.path}: a definite rejection still invites a retry with the route phone`, () => {
      const markup = renderToStaticMarkup(createElement(FormErrorAlert, { phone: variant.phone }));
      assert.match(markup, /role="alert"/);
      assert.match(stripTags(markup), /try again/);
      assert.ok(markup.includes(`href="${variant.phone.href}"`));
    });
  }

  it("renders the unknown alert in both forms and disables every send control while locked", () => {
    const source = readSource("components/LeadForm.tsx");
    assert.match(source, /status === "unknown" && <FormUnknownAlert phone=\{phone\} announce=\{active\} \/>\}\s*<LeadFormFields/);
    assert.match(source, /status === "unknown" \? "Request paused" : QUOTE_CTA_LABEL/);
    assert.match(source, /status === "error" && active && <FormErrorAlert/);
    assert.match(source, /disabled=\{locked\} messageRows/);
    assert.match(source, /<button type="button" onClick=\{handleClick\} disabled=\{locked\}/);
    assert.match(source, /gateSend\(status, \(\) => validateAll\(readValues\(\)\), \(\) => sendLead\(formId\)\)/);
  });
});
