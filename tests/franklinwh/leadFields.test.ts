import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMAIL_ERROR, PHONE_ERROR } from "../../src/franklinwh/fields";
import {
  EMPTY_VALUES,
  FIELD_KEYS,
  INVALID_VALUE_ERROR,
  LeadValidationError,
  MESSAGE_TOO_LONG_ERROR,
  NAME_REQUIRED_ERROR,
  OFF_GRID_ERROR,
  PHONE_REQUIRED_ERROR,
  TEXT_TOO_LONG_ERROR,
  isRequired,
  normalizeLeadValues,
  validateLeadValues,
  type LeadValues,
} from "../../src/franklinwh/leadFields";

const VALID: LeadValues = { ...EMPTY_VALUES, name: "Test MEGA QA", phone: "(555) 555-0100" };

describe("six-field contract", () => {
  it("has exactly the ordered task keys, with only name and phone required", () => {
    assert.deepEqual([...FIELD_KEYS], ["name", "phone", "email", "utility", "offGrid", "message"]);
    assert.deepEqual(FIELD_KEYS.filter(isRequired), ["name", "phone"]);
    assert.equal(EMPTY_VALUES.offGrid, false);
  });

  it("accepts name and phone alone and sends all six normalized keys", () => {
    assert.deepEqual(validateLeadValues(VALID), {});
    assert.deepEqual(normalizeLeadValues(VALID), {
      name: "Test MEGA QA", phone: "5555550100", email: "", utility: "", offGrid: false, message: "",
    });
  });

  it("requires name and phone", () => {
    assert.deepEqual(validateLeadValues(EMPTY_VALUES), { name: NAME_REQUIRED_ERROR, phone: PHONE_REQUIRED_ERROR });
    assert.deepEqual(validateLeadValues({ ...VALID, name: "   " }), { name: NAME_REQUIRED_ERROR });
  });

  it("validates phone and an optional email only when present", () => {
    assert.deepEqual(validateLeadValues({ ...VALID, phone: "(911) 555-1234" }), { phone: PHONE_ERROR });
    assert.deepEqual(validateLeadValues({ ...VALID, email: "me@x" }), { email: EMAIL_ERROR });
    assert.deepEqual(validateLeadValues({ ...VALID, email: "   " }), {});
  });

  it("normalizes every field", () => {
    const sent = normalizeLeadValues({
      name: "  Ada Lovelace ", phone: "+1 413-412-3123", email: " Ada@Example.COM ", utility: " UPPCO ", offGrid: true, message: "  Line one\nLine two  ",
    });
    assert.deepEqual(sent, {
      name: "Ada Lovelace", phone: "4134123123", email: "Ada@example.com", utility: "UPPCO", offGrid: true, message: "Line one\nLine two",
    });
  });

  it("caps short text at 200 characters and the message at 1,000", () => {
    assert.deepEqual(validateLeadValues({ ...VALID, name: "a".repeat(201) }), { name: TEXT_TOO_LONG_ERROR });
    assert.deepEqual(validateLeadValues({ ...VALID, utility: "a".repeat(201) }), { utility: TEXT_TOO_LONG_ERROR });
    assert.deepEqual(validateLeadValues({ ...VALID, message: "a".repeat(1000) }), {});
    assert.deepEqual(validateLeadValues({ ...VALID, message: "a".repeat(1001) }), { message: MESSAGE_TOO_LONG_ERROR });
  });

  it("fails closed on wrongly typed programmatic input", () => {
    const tampered = { ...VALID, offGrid: "true", phone: 5555550100 } as unknown as LeadValues;
    assert.throws(
      () => normalizeLeadValues(tampered),
      (error: unknown) =>
        error instanceof LeadValidationError &&
        JSON.stringify(error.errors) === JSON.stringify({ phone: INVALID_VALUE_ERROR, offGrid: OFF_GRID_ERROR }),
    );
    const missing = { name: "Test MEGA QA", phone: "5555550100" } as unknown as LeadValues;
    assert.throws(() => normalizeLeadValues(missing), LeadValidationError);
    assert.throws(() => normalizeLeadValues(null), LeadValidationError);
  });
});
