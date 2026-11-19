import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { EMAIL_PATTERN, formatPhone, isValidEmail, isValidPhone, nationalDigits, normalizeEmail, phoneDigits } from "../../src/franklinwh/fields";

/** lp-starter src/lib/fields.ts at e8e8d9b5c8cd4be6d65818a914c33edecdbeed69. */
const UPSTREAM_SHA256 = "d25400ba6ee08423f81f50a3dda98d6bd8d110952edfd99f0618799aeeedfe89";
const N11 = ["211", "311", "411", "511", "611", "711", "811", "911"];

describe("fields.ts provenance", () => {
  it("is byte-identical to the pinned lp-starter file", () => {
    const bytes = readFileSync(new URL("../../src/franklinwh/fields.ts", import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), UPSTREAM_SHA256);
  });
});

describe("phone", () => {
  it("rejects every N11 area code, national and +1", () => {
    for (const code of N11) {
      assert.equal(isValidPhone(`${code}4123123`), false, code);
      assert.equal(isValidPhone(`+1 ${code} 412 3123`), false, `+1 ${code}`);
    }
  });

  it("rejects every N11 exchange, national and +1", () => {
    for (const code of N11) {
      assert.equal(isValidPhone(`413${code}3123`), false, code);
      assert.equal(isValidPhone(`+1 (413) ${code}-3123`), false, `+1 ${code}`);
    }
    assert.equal(isValidPhone("212-211-5555"), false);
    assert.equal(isValidPhone("4134111234"), false);
  });

  it("accepts ordinary national and +1 numbers and both route numbers", () => {
    for (const value of ["(413) 412-3123", "+1 (413) 412-3123", "1-413-412-3123", "906-235-0340", "+12315907305"]) {
      assert.equal(isValidPhone(value), true, value);
    }
    assert.equal(phoneDigits("+1 (413) 412-3123"), "4134123123");
  });

  it("accepts only the mandated QA number among fictional 555-01XX numbers", () => {
    assert.equal(isValidPhone("+15555550100"), true);
    assert.equal(isValidPhone("(555) 555-0100"), true);
    assert.equal(isValidPhone("(413) 555-0123"), false);
    assert.equal(isValidPhone("(555) 555-0199"), false);
  });

  it("leaves foreign, extension and overlong input untruncated and invalid", () => {
    for (const value of ["+44 7911 123456", "+52 55 1234 5678", "+1 413 412 3123 ext 45", "413412312345", "Phone #2: 413-412-3123"]) {
      assert.equal(isValidPhone(value), false, value);
      assert.equal(formatPhone(value), value, value);
      assert.equal(nationalDigits(value), null, value);
    }
  });

  it("rejects short and malformed numbers", () => {
    for (const value of ["", "41341", "(123) 456-7890", "(413) 155-1234"]) assert.equal(isValidPhone(value), false, value);
  });

  it("formats while typing", () => {
    assert.equal(formatPhone("906"), "(906");
    assert.equal(formatPhone("906235"), "(906) 235");
    assert.equal(formatPhone("9062350340"), "(906) 235-0340");
  });
});

describe("email", () => {
  it("accepts ordinary addresses and padded input", () => {
    for (const value of ["you@company.com", "  you@x.co  ", "first.last+tag@sub.example.org"]) assert.equal(isValidEmail(value), true, value);
  });

  it("rejects malformed addresses", () => {
    const bad = ["me@x", "foo@bar", "@company.com", "you@", "you company.com", "a@b@c.com", "a..b@x.com", "a@x..com", ".a@x.com", "a.@x.com", "a@-x.com", "a@x-.com", "a b@x.com"];
    for (const value of bad) assert.equal(isValidEmail(value), false, value);
  });

  it("enforces total, local-part and label length limits", () => {
    assert.equal(isValidEmail(`${"a".repeat(64)}@x.com`), true);
    assert.equal(isValidEmail(`${"a".repeat(65)}@x.com`), false);
    assert.equal(isValidEmail(`a@${"b".repeat(63)}.com`), true);
    assert.equal(isValidEmail(`a@${"b".repeat(64)}.com`), false);
    const long = `${"a".repeat(64)}@${Array.from({ length: 4 }, () => "b".repeat(60)).join(".")}.com`;
    assert.equal(long.length > 254, true);
    assert.equal(isValidEmail(long), false);
  });

  it("lowercases only the domain", () => {
    assert.equal(normalizeEmail("  Jane.Doe@Example.COM "), "Jane.Doe@example.com");
  });

  it("keeps an un-anchored pattern for the input attribute", () => {
    assert.equal(EMAIL_PATTERN.startsWith("^"), false);
  });
});
