"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import type { RoutePhone } from "../config";
import { EMPTY_VALUES, type FieldKey, type LeadValues } from "../leadFields";
import type { SubmissionStatus } from "../submission";
import { useLeadSubmission } from "./useLeadSubmission";

interface LeadFormContextValue {
  values: LeadValues;
  status: SubmissionStatus;
  /** The form whose request is pending, failed or accepted; null before the first attempt. */
  activeFormId: string | null;
  phone: RoutePhone;
  setValue: <K extends FieldKey>(key: K, value: LeadValues[K]) => void;
  /** Sends the shared draft for this form; a no-op while another send is pending or after success. */
  sendLead: (formId: string) => void;
}

const LeadFormContext = createContext<LeadFormContextValue | null>(null);

export function useLeadForm(): LeadFormContextValue {
  const context = useContext(LeadFormContext);
  if (!context) throw new Error("useLeadForm must be used inside LeadFormProvider");
  return context;
}

interface LeadFormProviderProps {
  phone: RoutePhone;
  children: ReactNode;
}

/** One draft and one request lock shared by the hero and final forms. */
export function LeadFormProvider({ phone, children }: LeadFormProviderProps): ReactElement {
  const [values, setValues] = useState<LeadValues>(EMPTY_VALUES);
  // The ref is the draft of record, so a send in the same tick as a keystroke never reads stale state.
  const valuesRef = useRef<LeadValues>(EMPTY_VALUES);
  const { status, formId: activeFormId, sendLead } = useLeadSubmission(valuesRef);

  const setValue = useCallback(<K extends FieldKey>(key: K, value: LeadValues[K]): void => {
    valuesRef.current = { ...valuesRef.current, [key]: value };
    setValues(valuesRef.current);
  }, []);

  const value = useMemo(
    () => ({ values, status, activeFormId, phone, setValue, sendLead }),
    [values, status, activeFormId, phone, setValue, sendLead],
  );
  return <LeadFormContext.Provider value={value}>{children}</LeadFormContext.Provider>;
}
