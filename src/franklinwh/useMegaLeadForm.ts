"use client";

import { useCallback, useEffect } from "react";
import { browserAttributionEnv, getSessionId, getVisitorId, resolveAttribution } from "./attribution";
import { normalizeLeadValues, type LeadFormData } from "./leadFields";
import { buildLeadPayload, postLead } from "./leadPayload";

interface UseMegaLeadFormReturn {
  /**
   * Resolves with the sent `form_data` only after `postLead` saw a 2xx with `ok: true`. Throws on
   * invalid input (a programmatic call can bypass the UI gate) and on every failed or unconfirmed request.
   */
  submit: (values: unknown) => Promise<LeadFormData>;
}

export function useMegaLeadForm(): UseMegaLeadFormReturn {
  // Capture first-touch attribution on load: click ids only exist on the landing URL.
  useEffect(() => {
    resolveAttribution(browserAttributionEnv());
  }, []);

  const submit = useCallback(async (values: unknown): Promise<LeadFormData> => {
    const formData = normalizeLeadValues(values);
    const env = browserAttributionEnv();
    const context = {
      url: window.location.href,
      referrerUrl: document.referrer || null,
      sessionId: getSessionId(env),
      visitorId: getVisitorId(env),
    };
    await postLead(buildLeadPayload(formData, context, resolveAttribution(env)));
    return formData;
  }, []);

  return { submit };
}
