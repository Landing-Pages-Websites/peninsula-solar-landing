// The lead request: payload shape, transport and the success contract.
import type { Attribution } from "./attribution";
import { LEAD_ENDPOINT, SITE } from "./config";
import type { LeadFormData } from "./leadFields";

export interface PageContext {
  url: string;
  referrerUrl: string | null;
  sessionId: string;
  visitorId: string;
}

export interface LeadPayload extends Attribution {
  customer_id: string;
  site_id: string;
  source_provider: string;
  form_data: LeadFormData;
  url: string;
  referrer_url: string | null;
  /** The worker's follow-up CRM path reads `referrer`; `referrer_url` is the lead column. */
  referrer: string | null;
  session_id: string;
  visitor_id: string;
}

export function buildLeadPayload(formData: LeadFormData, context: PageContext, attribution: Attribution): LeadPayload {
  return {
    customer_id: SITE.customerId,
    site_id: SITE.siteId,
    source_provider: SITE.sourceProvider,
    form_data: formData,
    url: context.url,
    referrer_url: context.referrerUrl,
    referrer: context.referrerUrl,
    session_id: context.sessionId,
    visitor_id: context.visitorId,
    ...attribution,
  };
}

export class LeadSubmitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadSubmitError";
  }
}

export function isLeadSuccessBody(body: unknown): boolean {
  return typeof body === "object" && body !== null && (body as { ok?: unknown }).ok === true;
}

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

async function send(payload: LeadPayload, fetchImpl: FetchLike): Promise<Response> {
  try {
    return await fetchImpl(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new LeadSubmitError("Lead API could not be reached");
  }
}

/** Success needs a 2xx AND a parsed body with `ok: true`; anything else is a failure. */
export async function postLead(payload: LeadPayload, fetchImpl: FetchLike = fetch): Promise<void> {
  const response = await send(payload, fetchImpl);
  if (!response.ok) throw new LeadSubmitError(`Lead API responded ${response.status}`);
  const body: unknown = await response.json().catch(() => null);
  if (!isLeadSuccessBody(body)) throw new LeadSubmitError("Lead API response did not confirm the lead");
}
