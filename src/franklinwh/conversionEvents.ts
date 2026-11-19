// Conversion events, fired only after the lead API confirmed the lead.
import { SITE } from "./config";
import type { LeadFormData } from "./leadFields";

/** The only keys sent: the optimizer reads `elementId` and `formData` and drops anything else. */
export interface MegaTagEventPayload {
  elementId: string;
  formData: LeadFormData;
}

export interface MegaTagApi {
  trackEvent?: (eventName: string, payload?: MegaTagEventPayload) => unknown;
}

export interface ConversionTarget {
  MegaTag?: MegaTagApi;
  dataLayer?: Record<string, unknown>[];
}

declare global {
  interface Window extends ConversionTarget {
    MEGA_TAG_CONFIG?: { siteKey: string; gtmId?: string };
    API_ENDPOINT?: string;
    TRACKING_API_ENDPOINT?: string;
  }
}

function attempt(fire: () => void): void {
  try {
    fire();
  } catch {
    // The lead is already saved; a tag failure must never read as a failed submit.
  }
}

/** One MegaTag `form_submit` and one dataLayer `form_submission`, each carrying the actual form id. */
export function fireConversionEvents(formId: string, formData: LeadFormData, target: ConversionTarget): void {
  attempt(() => target.MegaTag?.trackEvent?.("form_submit", { elementId: formId, formData: { ...formData } }));
  attempt(() => {
    target.dataLayer = target.dataLayer || [];
    target.dataLayer.push({ event: "form_submission", form_id: formId, form_provider: SITE.sourceProvider });
  });
}
