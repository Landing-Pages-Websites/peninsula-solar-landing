// One lead per page view, shared by every form instance on the page.
import { LeadOutcomeUnknownError } from "./leadPayload";
import type { LeadFormData, LeadValues } from "./leadFields";

/**
 * `error`: nothing was saved (invalid input or a definite API rejection), so a retry is allowed.
 * `unknown`: the request may have saved the lead; this page view never sends again.
 */
export type SubmissionStatus = "idle" | "submitting" | "success" | "error" | "unknown";

export interface SubmissionState {
  status: SubmissionStatus;
  /** The form whose request is pending, failed, unconfirmed or accepted; null before the first attempt. */
  formId: string | null;
}

/** Statuses in which every form on the page refuses to send (success swaps the forms out). */
export function isSendLocked(status: SubmissionStatus): boolean {
  return status === "submitting" || status === "unknown" || status === "success";
}

/**
 * Every form entry point (click, Enter, native submit backstop) goes through here: refuse while
 * locked without touching field errors, validate first, and only then send.
 */
export function gateSend(status: SubmissionStatus, validate: () => boolean, send: () => void): void {
  if (isSendLocked(status) || !validate()) return;
  send();
}

/** Called only after the form's validate-first gate passed; nothing here dispatches a native submit. */
export interface SubmissionSteps {
  /** Resolves with the accepted `form_data`; throws on any failure. */
  send: () => Promise<LeadFormData>;
  onAccepted: (sent: LeadFormData) => void;
  onStatus: (status: SubmissionStatus) => void;
}

/**
 * The lock is taken synchronously before any state update, so a double click or a sibling form in
 * the same tick never sends twice. It is released only after a failure that proves nothing was
 * saved; success and an unknown outcome keep it for the rest of the page view.
 * Returns false when another submission already owns the lock.
 */
export async function runSubmission(lock: { current: boolean }, steps: SubmissionSteps): Promise<boolean> {
  if (lock.current) return false;
  lock.current = true;
  steps.onStatus("submitting");
  let sent: LeadFormData;
  try {
    sent = await steps.send();
  } catch (error) {
    const unknown = error instanceof LeadOutcomeUnknownError;
    if (!unknown) lock.current = false;
    steps.onStatus(unknown ? "unknown" : "error");
    return true;
  }
  // Outside the try: the lead is saved, so nothing after this may release the lock.
  steps.onStatus("success");
  try {
    steps.onAccepted(sent);
  } catch {
    // Telemetry can never undo a confirmed lead.
  }
  return true;
}

export interface LeadControllerDeps {
  submit: (values: LeadValues) => Promise<LeadFormData>;
  readValues: () => LeadValues;
  onState: (state: SubmissionState) => void;
  onAccepted: (formId: string, sent: LeadFormData) => void;
}

/** The page's single send path: one lock for every form instance, created once per page view. */
export function createLeadController(deps: LeadControllerDeps): (formId: string) => Promise<boolean> {
  const lock = { current: false };
  return (formId) =>
    runSubmission(lock, {
      send: () => deps.submit(deps.readValues()),
      onStatus: (status) => deps.onState({ status, formId }),
      onAccepted: (sent) => deps.onAccepted(formId, sent),
    });
}
