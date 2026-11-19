// One lead per page view, shared by every form instance on the page.
import type { LeadFormData } from "./leadFields";

export type SubmissionStatus = "idle" | "submitting" | "success" | "error";

/** Called only after the form's validate-first gate passed; nothing here dispatches a native submit. */
export interface SubmissionSteps {
  /** Resolves with the accepted `form_data`; throws on any failure. */
  send: () => Promise<LeadFormData>;
  onAccepted: (sent: LeadFormData) => void;
  onStatus: (status: SubmissionStatus) => void;
}

/**
 * The lock is taken synchronously before any state update, kept after success and released only
 * after a failed send, so a double click or a sibling form in the same tick never sends twice.
 * Returns false when another submission already owns the lock.
 */
export async function runSubmission(lock: { current: boolean }, steps: SubmissionSteps): Promise<boolean> {
  if (lock.current) return false;
  lock.current = true;
  steps.onStatus("submitting");
  let sent: LeadFormData;
  try {
    sent = await steps.send();
  } catch {
    lock.current = false;
    steps.onStatus("error");
    return true;
  }
  // Outside the try: the lead is saved, so nothing after this may release the lock.
  steps.onStatus("success");
  steps.onAccepted(sent);
  return true;
}
