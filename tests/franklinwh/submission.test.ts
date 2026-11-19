import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FormEvent, KeyboardEvent } from "react";
import { emptyAttribution } from "../../src/franklinwh/attribution";
import { formKeyboardHandlers } from "../../src/franklinwh/components/formKeyboardHandlers";
import { FINAL_FORM_ID, HERO_FORM_ID } from "../../src/franklinwh/config";
import { fireConversionEvents, type ConversionTarget, type MegaTagEventPayload } from "../../src/franklinwh/conversionEvents";
import { EMPTY_VALUES, LeadValidationError, validateLeadValues, type LeadFormData, type LeadValues } from "../../src/franklinwh/leadFields";
import { LeadOutcomeUnknownError, LeadRejectedError, sendLeadValues, type FetchLike } from "../../src/franklinwh/leadPayload";
import {
  createLeadController,
  gateSend,
  isSendLocked,
  runSubmission,
  type SubmissionState,
  type SubmissionStatus,
} from "../../src/franklinwh/submission";

const SENT: LeadFormData = { name: "Test MEGA QA", phone: "5555550100", email: "", utility: "", offGrid: false, message: "AUTOMATED_QA_TEST" };
const DRAFT: LeadValues = { ...EMPTY_VALUES, name: " Test MEGA QA ", phone: "(555) 555-0100", message: "AUTOMATED_QA_TEST" };
const CONTEXT = { url: "https://call.peninsula-solar.com/franklinwh", referrerUrl: null, sessionId: "sess_1", visitorId: "vis_1" };

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

  it("releases the lock after a definite rejection and fires nothing, so a retry can succeed", async () => {
    const lock = { current: false };
    let fail = true;
    const h = harness(async () => {
      if (fail) throw new LeadRejectedError("500");
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

  it("keeps the lock after an unknown outcome and fires nothing", async () => {
    const lock = { current: false };
    const h = harness(async () => {
      throw new LeadOutcomeUnknownError("lost");
    });
    await runSubmission(lock, h.steps);
    assert.equal(lock.current, true);
    assert.equal(await runSubmission(lock, h.steps), false);
    assert.equal(h.sends(), 1);
    assert.deepEqual(h.statuses, ["submitting", "unknown"]);
    assert.deepEqual(h.accepted, []);
  });

  it("keeps success and the lock when the accepted callback throws", async () => {
    const lock = { current: false };
    const statuses: SubmissionStatus[] = [];
    const steps = {
      send: async () => SENT,
      onStatus: (status: SubmissionStatus) => statuses.push(status),
      onAccepted: () => {
        throw new Error("tag blocked");
      },
    };
    assert.equal(await runSubmission(lock, steps), true);
    assert.equal(lock.current, true);
    assert.deepEqual(statuses, ["submitting", "success"]);
  });

  it("locks every entry point while pending, unconfirmed or accepted, never after a definite failure", () => {
    const expected: Record<SubmissionStatus, boolean> = { idle: false, error: false, submitting: true, unknown: true, success: true };
    for (const [status, locked] of Object.entries(expected)) assert.equal(isSendLocked(status as SubmissionStatus), locked, status);
  });
});

/** Intercepted lead API: replies in order, then repeats the last reply. No request leaves the test. */
function leadApi(...replies: (() => Promise<Response>)[]) {
  const bodies: Record<string, unknown>[] = [];
  const fetchImpl: FetchLike = async (_input, init) => {
    bodies.push(JSON.parse(String(init.body)));
    return replies[Math.min(bodies.length, replies.length) - 1]();
  };
  return { fetchImpl, bodies };
}
const json = (status: number, body: unknown) => async (): Promise<Response> => new Response(JSON.stringify(body), { status });
const offline = async (): Promise<Response> => {
  throw new TypeError("Failed to fetch");
};

/** Enter in a text input, through the form's real keydown handler. */
function pressEnter(handleClick: () => void): void {
  const event = { key: "Enter", nativeEvent: { isComposing: false }, target: { tagName: "INPUT" }, preventDefault: () => undefined };
  formKeyboardHandlers(handleClick).handleKeyDown(event as unknown as KeyboardEvent<HTMLFormElement>);
}

/** A native submit event reaching the onSubmit backstop. */
function fireNativeSubmit(handleClick: () => void): void {
  formKeyboardHandlers(handleClick).handleSubmit({ preventDefault: () => undefined } as unknown as FormEvent<HTMLFormElement>);
}

/** The page's real send path: controller -> sendLeadValues -> postLead, with the form's entry gate. */
function page(fetchImpl: FetchLike, target: ConversionTarget = {}) {
  const states: SubmissionState[] = [];
  let draft = DRAFT;
  const send = createLeadController({
    submit: (values) => sendLeadValues(values, CONTEXT, emptyAttribution(), fetchImpl),
    readValues: () => draft,
    onState: (state) => states.push(state),
    onAccepted: (formId, sent) => fireConversionEvents(formId, sent, target),
  });
  const pending: Promise<boolean>[] = [];
  const status = (): SubmissionStatus => states.at(-1)?.status ?? "idle";
  /** What LeadForm's click handler does, reading the status React last rendered. */
  const click = (formId: string, renderedStatus = status()): void =>
    gateSend(renderedStatus, () => Object.keys(validateLeadValues(draft)).length === 0, () => pending.push(send(formId)));
  return {
    states,
    status,
    click,
    enter: (formId: string) => pressEnter(() => click(formId)),
    nativeSubmit: (formId: string) => fireNativeSubmit(() => click(formId)),
    setDraft: (values: LeadValues) => (draft = values),
    settle: () => Promise.all(pending),
  };
}

function tracker(fail = false) {
  const events: [string, MegaTagEventPayload | undefined][] = [];
  const target: ConversionTarget = {
    MegaTag: {
      trackEvent: (name, payload) => {
        events.push([name, payload]);
        if (fail) throw new Error("tag blocked");
      },
    },
  };
  return { events, target };
}

describe("lead controller, end to end with an intercepted API", () => {
  it("accepts once and fires exactly one form_submit and one form_submission with the exact fields", async () => {
    const api = leadApi(json(200, { ok: true }));
    const { events, target } = tracker();
    const p = page(api.fetchImpl, target);
    p.click(FINAL_FORM_ID);
    await p.settle();
    assert.equal(api.bodies.length, 1);
    assert.deepEqual(api.bodies[0].form_data, SENT);
    assert.deepEqual(events, [["form_submit", { elementId: FINAL_FORM_ID, formData: SENT }]]);
    assert.deepEqual(target.dataLayer, [{ event: "form_submission", form_id: FINAL_FORM_ID, form_provider: "peninsula-solar-lp" }]);
    assert.deepEqual(p.states.at(-1), { status: "success", formId: FINAL_FORM_ID });
  });

  it("after an unknown outcome, further clicks, Enter, the sibling form and the native backstop send nothing", async () => {
    for (const reply of [offline, json(200, { id: "x" }), async () => new Response("<html>", { status: 200 }), json(200, null)]) {
      const api = leadApi(reply, json(200, { ok: true }));
      const { events, target } = tracker();
      const p = page(api.fetchImpl, target);
      p.click(HERO_FORM_ID);
      await p.settle();
      assert.deepEqual(p.states.at(-1), { status: "unknown", formId: HERO_FORM_ID });
      p.click(HERO_FORM_ID);
      p.enter(HERO_FORM_ID);
      p.click(FINAL_FORM_ID);
      p.enter(FINAL_FORM_ID);
      p.nativeSubmit(FINAL_FORM_ID);
      // Even a handler still holding the pre-failure render is stopped by the controller's lock.
      p.click(FINAL_FORM_ID, "idle");
      await p.settle();
      assert.equal(api.bodies.length, 1);
      assert.deepEqual(events, []);
      assert.equal(target.dataLayer, undefined);
      assert.equal(p.status(), "unknown");
    }
  });

  it("after a definite rejection, keeps the draft and lets one deliberate retry succeed", async () => {
    const api = leadApi(json(503, { ok: false }), json(200, { ok: true }));
    const { events, target } = tracker();
    const p = page(api.fetchImpl, target);
    p.click(HERO_FORM_ID);
    await p.settle();
    assert.deepEqual(p.states.at(-1), { status: "error", formId: HERO_FORM_ID });
    assert.deepEqual(events, []);
    p.enter(FINAL_FORM_ID);
    await p.settle();
    assert.equal(api.bodies.length, 2);
    assert.deepEqual(api.bodies[1].form_data, api.bodies[0].form_data);
    assert.deepEqual(events, [["form_submit", { elementId: FINAL_FORM_ID, formData: SENT }]]);
    p.click(HERO_FORM_ID);
    await p.settle();
    assert.equal(api.bodies.length, 2);
  });

  it("treats a 2xx with ok:false as a retryable rejection", async () => {
    const api = leadApi(json(200, { ok: false }), json(200, { ok: true }));
    const p = page(api.fetchImpl);
    p.click(FINAL_FORM_ID);
    await p.settle();
    assert.equal(p.status(), "error");
    p.click(FINAL_FORM_ID);
    await p.settle();
    assert.equal(p.status(), "success");
    assert.equal(api.bodies.length, 2);
  });

  it("a tracker error after acceptance neither undoes the lead nor unlocks the page", async () => {
    const api = leadApi(json(200, { ok: true }));
    const { events, target } = tracker(true);
    const p = page(api.fetchImpl, target);
    p.click(HERO_FORM_ID);
    await p.settle();
    assert.equal(p.status(), "success");
    assert.equal(events.length, 1);
    assert.equal(target.dataLayer?.length, 1);
    p.click(FINAL_FORM_ID, "idle");
    p.enter(HERO_FORM_ID);
    await p.settle();
    assert.equal(api.bodies.length, 1);
  });

  it("an invalid draft stays fixable and sends nothing", async () => {
    const api = leadApi(json(200, { ok: true }));
    const p = page(api.fetchImpl);
    p.setDraft({ ...DRAFT, phone: "(911) 555-1234" });
    p.click(HERO_FORM_ID);
    p.enter(FINAL_FORM_ID);
    await p.settle();
    assert.equal(api.bodies.length, 0);
    assert.deepEqual(p.states, []);
    p.setDraft(DRAFT);
    p.click(HERO_FORM_ID);
    await p.settle();
    assert.equal(p.status(), "success");
    assert.equal(api.bodies.length, 1);
  });

  it("a programmatic call with invalid values fails before the network and stays retryable", async () => {
    const api = leadApi(json(200, { ok: true }));
    await assert.rejects(sendLeadValues({ ...DRAFT, phone: 5555550100 }, CONTEXT, emptyAttribution(), api.fetchImpl), LeadValidationError);
    const lock = { current: false };
    const statuses: SubmissionStatus[] = [];
    await runSubmission(lock, {
      send: () => sendLeadValues({ ...DRAFT, name: "" }, CONTEXT, emptyAttribution(), api.fetchImpl),
      onStatus: (status) => statuses.push(status),
      onAccepted: () => assert.fail("must not accept"),
    });
    assert.deepEqual(statuses, ["submitting", "error"]);
    assert.equal(lock.current, false);
    assert.equal(api.bodies.length, 0);
  });
});

describe("conversion events", () => {
  it("sends one form_submit with elementId + formData and one dataLayer push", () => {
    const { events, target } = tracker();
    fireConversionEvents("final-lead-form", SENT, target);
    assert.deepEqual(events, [["form_submit", { elementId: "final-lead-form", formData: SENT }]]);
    assert.deepEqual(target.dataLayer, [{ event: "form_submission", form_id: "final-lead-form", form_provider: "peninsula-solar-lp" }]);
    const payload = events[0][1] as unknown as Record<string, unknown>;
    assert.equal("element" in payload, false);
    assert.equal("name" in payload, false);
  });

  it("never throws when the tracker fails or is missing", () => {
    const { target } = tracker(true);
    assert.doesNotThrow(() => fireConversionEvents("hero-lead-form", SENT, target));
    assert.equal(target.dataLayer?.length, 1);
    assert.doesNotThrow(() => fireConversionEvents("hero-lead-form", SENT, {}));
  });
});
