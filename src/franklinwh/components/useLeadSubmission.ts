"use client";

import { useCallback, useRef, useState } from "react";
import { fireConversionEvents } from "../conversionEvents";
import type { LeadValues } from "../leadFields";
import { createLeadController, type SubmissionState } from "../submission";
import { useMegaLeadForm } from "../useMegaLeadForm";

interface LeadSubmission extends SubmissionState {
  sendLead: (formId: string) => void;
}

type SendLead = ReturnType<typeof createLeadController>;

/** One controller (and so one request lock) for the whole page view, created on the first send. */
export function useLeadSubmission(valuesRef: { current: LeadValues }): LeadSubmission {
  const { submit } = useMegaLeadForm();
  const [state, setState] = useState<SubmissionState>({ status: "idle", formId: null });
  const controllerRef = useRef<SendLead | null>(null);

  const sendLead = useCallback((formId: string): void => {
    controllerRef.current ??= createLeadController({
      // submit() resolves only after postLead confirmed a 2xx with ok === true.
      submit,
      readValues: () => valuesRef.current,
      onState: setState,
      onAccepted: (id, sent) => fireConversionEvents(id, sent, window),
    });
    void controllerRef.current(formId);
  }, [submit, valuesRef]);

  return { ...state, sendLead };
}
