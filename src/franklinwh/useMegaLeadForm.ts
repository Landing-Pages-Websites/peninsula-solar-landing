"use client";

import { useCallback, useEffect } from "react";
import { browserAttributionEnv, getSessionId, getVisitorId, resolveAttribution } from "./attribution";
import type { LeadFormData } from "./leadFields";
import { sendLeadValues } from "./leadPayload";

interface UseMegaLeadFormReturn {
  /**
   * Resolves with the sent `form_data` only after `postLead` saw a 2xx with `ok: true`. Throws
   * LeadValidationError on invalid input before any request (a programmatic call can bypass the
   * UI gate), LeadRejectedError on a definite rejection and LeadOutcomeUnknownError otherwise.
   */
  submit: (values: unknown) => Promise<LeadFormData>;
}

export function useMegaLeadForm(): UseMegaLeadFormReturn {
  // Capture first-touch attribution on load: click ids only exist on the landing URL.
  useEffect(() => {
    resolveAttribution(browserAttributionEnv());
  }, []);

  const submit = useCallback((values: unknown): Promise<LeadFormData> => {
    const env = browserAttributionEnv();
    const context = {
      url: window.location.href,
      referrerUrl: document.referrer || null,
      sessionId: getSessionId(env),
      visitorId: getVisitorId(env),
    };
    return sendLeadValues(values, context, resolveAttribution(env));
  }, []);

  return { submit };
}
