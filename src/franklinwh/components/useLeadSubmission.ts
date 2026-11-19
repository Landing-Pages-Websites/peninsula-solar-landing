"use client";

import { useCallback, useRef, useState } from "react";
import { fireConversionEvents } from "../conversionEvents";
import type { LeadValues } from "../leadFields";
import { runSubmission, type SubmissionStatus } from "../submission";
import { useMegaLeadForm } from "../useMegaLeadForm";

export interface SubmissionState {
  status: SubmissionStatus;
  /** The form whose request is pending, failed or accepted; null before the first attempt. */
  formId: string | null;
}

interface LeadSubmission extends SubmissionState {
  sendLead: (formId: string) => void;
}

/** One request lock for the whole page, taken synchronously (in runSubmission) before any state update. */
export function useLeadSubmission(valuesRef: { current: LeadValues }): LeadSubmission {
  const { submit } = useMegaLeadForm();
  const lockRef = useRef(false);
  const [state, setState] = useState<SubmissionState>({ status: "idle", formId: null });

  const sendLead = useCallback((formId: string): void => {
    void runSubmission(lockRef, {
      // submit() resolves only after postLead confirmed a 2xx with ok === true.
      send: () => submit(valuesRef.current),
      onStatus: (status) => setState({ status, formId }),
      onAccepted: (sent) => fireConversionEvents(formId, sent, window),
    });
  }, [submit, valuesRef]);

  return { ...state, sendLead };
}
