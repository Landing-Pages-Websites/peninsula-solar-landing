import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyAttribution } from "../../src/franklinwh/attribution";
import { LEAD_ENDPOINT, SITE } from "../../src/franklinwh/config";
import {
  LeadOutcomeUnknownError,
  LeadRejectedError,
  LeadSubmitError,
  buildLeadPayload,
  isLeadRejectionBody,
  isLeadSuccessBody,
  postLead,
  type FetchLike,
} from "../../src/franklinwh/leadPayload";

const FORM_DATA = { name: "Test MEGA QA", phone: "5555550100", email: "", utility: "", offGrid: false, message: "AUTOMATED_QA_TEST" };
const CONTEXT = { url: "https://call.peninsula-solar.com/franklinwh?gclid=x", referrerUrl: null, sessionId: "sess_1", visitorId: "vis_1" };
const PAYLOAD = buildLeadPayload(FORM_DATA, CONTEXT, { ...emptyAttribution(), gclid: "x" });

/** Intercepted transport: no request ever leaves the test. */
function respond(status: number, body: string | null): { fetch: FetchLike; calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    fetch: async (input) => {
      calls.push(input);
      return new Response(body, { status, headers: { "Content-Type": "application/json" } });
    },
  };
}

describe("lead payload", () => {
  it("carries the shared site identity, six form keys and attribution", () => {
    assert.equal(PAYLOAD.customer_id, SITE.customerId);
    assert.equal(PAYLOAD.site_id, SITE.siteId);
    assert.equal(PAYLOAD.source_provider, "peninsula-solar-lp");
    assert.deepEqual(Object.keys(PAYLOAD.form_data), ["name", "phone", "email", "utility", "offGrid", "message"]);
    assert.equal(PAYLOAD.gclid, "x");
    assert.equal(PAYLOAD.referrer, null);
  });
});

describe("response contract", () => {
  it("succeeds only on a 2xx with ok === true", async () => {
    const transport = respond(200, JSON.stringify({ ok: true, id: "lead_1" }));
    await postLead(PAYLOAD, transport.fetch);
    assert.deepEqual(transport.calls, [LEAD_ENDPOINT]);
  });

  // A definite "no": nothing was saved, so the visitor may retry.
  const rejections: [string, number, string][] = [
    ["ok false", 200, JSON.stringify({ ok: false })],
    ["server error with ok true", 500, JSON.stringify({ ok: true })],
    ["client error", 400, JSON.stringify({ ok: false })],
    ["server error with unreadable body", 502, "<html>"],
  ];
  for (const [label, status, body] of rejections) {
    it(`rejects definitely on ${label}`, async () => {
      await assert.rejects(postLead(PAYLOAD, respond(status, body).fetch), LeadRejectedError);
    });
  }

  // No confirmation either way: the lead may be saved, so this is never a retryable failure.
  const unknowns: [string, number, string | null][] = [
    ["ok missing", 200, JSON.stringify({ id: "x" })],
    ["ok as a string", 200, JSON.stringify({ ok: "true" })],
    ["ok as 1", 201, JSON.stringify({ ok: 1 })],
    ["null body", 200, "null"],
    ["invalid JSON", 200, "<html>"],
    ["empty body", 200, ""],
    ["no-content success", 204, null],
  ];
  for (const [label, status, body] of unknowns) {
    it(`leaves the outcome unknown on ${label}`, async () => {
      await assert.rejects(postLead(PAYLOAD, respond(status, body).fetch), LeadOutcomeUnknownError);
    });
  }

  it("leaves the outcome unknown when the fetch rejects or the body stream is lost", async () => {
    const offline: FetchLike = async () => {
      throw new TypeError("Failed to fetch");
    };
    await assert.rejects(postLead(PAYLOAD, offline), LeadOutcomeUnknownError);
    const lostBody: FetchLike = async () =>
      new Response(new ReadableStream({ start: (controller) => controller.error(new TypeError("network reset")) }), { status: 200 });
    await assert.rejects(postLead(PAYLOAD, lostBody), LeadOutcomeUnknownError);
  });

  it("keeps both outcomes under one LeadSubmitError base", () => {
    assert.ok(new LeadRejectedError("x") instanceof LeadSubmitError);
    assert.ok(new LeadOutcomeUnknownError("x") instanceof LeadSubmitError);
    assert.equal(new LeadRejectedError("x") instanceof LeadOutcomeUnknownError, false);
  });

  it("recognizes only a literal false as an explicit rejection", () => {
    assert.equal(isLeadRejectionBody({ ok: false }), true);
    for (const body of [null, undefined, {}, { ok: 0 }, { ok: "false" }, { ok: true }]) assert.equal(isLeadRejectionBody(body), false);
  });

  it("recognizes only a literal true", () => {
    assert.equal(isLeadSuccessBody({ ok: true }), true);
    for (const body of [null, undefined, "ok", { ok: 1 }, { ok: "true" }, []]) assert.equal(isLeadSuccessBody(body), false);
  });
});
