import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fireConversionEvents, type ConversionTarget, type MegaTagEventPayload } from "../../src/franklinwh/conversionEvents";
import type { LeadFormData } from "../../src/franklinwh/leadFields";
import { runSubmission, type SubmissionStatus } from "../../src/franklinwh/submission";

const SENT: LeadFormData = { name: "Test MEGA QA", phone: "5555550100", email: "", utility: "", offGrid: false, message: "" };

function harness(send: () => Promise<LeadFormData>) {
  const statuses: SubmissionStatus[] = [];
  const accepted: LeadFormData[] = [];
  let sends = 0;
  return {
    statuses,
    accepted,
    sends: () => sends,
    steps: {
      send: () => {
        sends += 1;
        return send();
      },
      onStatus: (status: SubmissionStatus) => statuses.push(status),
      onAccepted: (data: LeadFormData) => accepted.push(data),
    },
  };
}

describe("shared submission lock", () => {
  it("lets only the first of two same-tick actions (hero + final) send", async () => {
    const lock = { current: false };
    const h = harness(async () => SENT);
    const first = runSubmission(lock, h.steps);
    const sibling = runSubmission(lock, h.steps);
    assert.equal(lock.current, true);
    assert.deepEqual(await Promise.all([first, sibling]), [true, false]);
    assert.equal(h.sends(), 1);
    assert.deepEqual(h.accepted, [SENT]);
  });

  it("keeps the lock after success: one lead per page view", async () => {
    const lock = { current: false };
    const h = harness(async () => SENT);
    await runSubmission(lock, h.steps);
    assert.equal(await runSubmission(lock, h.steps), false);
    assert.equal(h.sends(), 1);
    assert.deepEqual(h.statuses, ["submitting", "success"]);
  });

  it("releases the lock after a failure and fires nothing, so a retry can succeed", async () => {
    const lock = { current: false };
    let fail = true;
    const h = harness(async () => {
      if (fail) throw new Error("500");
      return SENT;
    });
    await runSubmission(lock, h.steps);
    assert.equal(lock.current, false);
    assert.deepEqual(h.accepted, []);
    fail = false;
    await runSubmission(lock, h.steps);
    assert.deepEqual(h.statuses, ["submitting", "error", "submitting", "success"]);
    assert.deepEqual(h.accepted, [SENT]);
  });
});

describe("conversion events", () => {
  it("sends one form_submit with elementId + formData and one dataLayer push", () => {
    const events: [string, MegaTagEventPayload | undefined][] = [];
    const target: ConversionTarget = { MegaTag: { trackEvent: (name, payload) => events.push([name, payload]) } };
    fireConversionEvents("final-lead-form", SENT, target);
    assert.deepEqual(events, [["form_submit", { elementId: "final-lead-form", formData: SENT }]]);
    assert.deepEqual(target.dataLayer, [{ event: "form_submission", form_id: "final-lead-form", form_provider: "peninsula-solar-lp" }]);
    const payload = events[0][1] as unknown as Record<string, unknown>;
    assert.equal("element" in payload, false);
    assert.equal("name" in payload, false);
  });

  it("never throws when the tracker fails or is missing", () => {
    const broken: ConversionTarget = {
      MegaTag: {
        trackEvent: () => {
          throw new Error("tag blocked");
        },
      },
    };
    assert.doesNotThrow(() => fireConversionEvents("hero-lead-form", SENT, broken));
    assert.equal(broken.dataLayer?.length, 1);
    assert.doesNotThrow(() => fireConversionEvents("hero-lead-form", SENT, {}));
  });
});
