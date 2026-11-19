// The lead request: payload shape, transport and the success contract.
import type { Attribution } from "./attribution";
import { LEAD_ENDPOINT, SITE } from "./config";
import { normalizeLeadValues, type LeadFormData } from "./leadFields";

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
    this.name = new.target.name;
  }
}

/** The API definitely did not take the lead (non-2xx, or a body with `ok: false`): safe to retry. */
export class LeadRejectedError extends LeadSubmitError {}

/**
 * The request may have reached the API, but nothing confirms or rejects it: the fetch failed or
 * the response was lost, unreadable, null, or a 2xx without an explicit `ok`. The lead might be
 * saved, so a blind resend could duplicate it.
 */
export class LeadOutcomeUnknownError extends LeadSubmitError {}

function bodyOk(body: unknown): unknown {
  return typeof body === "object" && body !== null ? (body as { ok?: unknown }).ok : undefined;
}

export function isLeadSuccessBody(body: unknown): boolean {
  return bodyOk(body) === true;
}

/** Only a literal `ok: false` is an explicit rejection; a missing or odd `ok` proves nothing. */
export function isLeadRejectionBody(body: unknown): boolean {
  return bodyOk(body) === false;
}

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

async function send(body: string, fetchImpl: FetchLike): Promise<Response> {
  try {
    return await fetchImpl(LEAD_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body });
  } catch {
    throw new LeadOutcomeUnknownError("Lead API response was lost; the lead may have been saved");
  }
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Resolves only on a 2xx whose parsed body has `ok === true`. A non-2xx or `ok: false` throws
 * LeadRejectedError; every other outcome throws LeadOutcomeUnknownError.
 */
export async function postLead(payload: LeadPayload, fetchImpl: FetchLike = fetch): Promise<void> {
  const response = await send(JSON.stringify(payload), fetchImpl);
  if (!response.ok) throw new LeadRejectedError(`Lead API responded ${response.status}`);
  const body = await readBody(response);
  if (isLeadSuccessBody(body)) return;
  if (isLeadRejectionBody(body)) throw new LeadRejectedError("Lead API rejected the lead");
  throw new LeadOutcomeUnknownError("Lead API response did not confirm the lead");
}

/**
 * Validates and normalizes first (a LeadValidationError means nothing was sent), then posts.
 * Resolves with the sent `form_data` only once the API confirmed it.
 */
export async function sendLeadValues(
  values: unknown,
  context: PageContext,
  attribution: Attribution,
  fetchImpl: FetchLike = fetch,
): Promise<LeadFormData> {
  const formData = normalizeLeadValues(values);
  await postLead(buildLeadPayload(formData, context, attribution), fetchImpl);
  return formData;
}
