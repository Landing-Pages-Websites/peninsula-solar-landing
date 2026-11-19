// Identity and routing for the FranklinWH routes. These reuse the existing
// call.peninsula-solar.com registration; the literals in layout.tsx must match.

export const SITE = {
  brandName: "Peninsula Solar",
  customerId: "8bbf1dbc-49fb-44b5-8c82-e1235149e809",
  siteId: "7d905a66-6641-427b-852c-dd6bec7c1e16",
  siteKey: "sk_moeyep8q_kj6i28c0wm",
  gtmId: "GTM-WLQXZ22P",
  sourceProvider: "peninsula-solar-lp",
  origin: "https://call.peninsula-solar.com",
  contactEmail: "sales@peninsula-solar.com",
} as const;

export const LEAD_ENDPOINT = "https://analytics.gomega.ai/submission/submit";
export const OPTIMIZER_ID = "optimizer-script";
export const OPTIMIZER_SRC = "https://cdn.gomega.ai/scripts/optimizer.min.js";
export const OPTIMIZER_API = "https://optimizer.gomega.ai";
export const TRACKING_API = "https://events-api.gomega.ai";

export const PRIVACY_PATH = "/privacy";
export const QUOTE_CTA_LABEL = "Request a free quote";
export const HERO_FORM_ANCHOR = "hero-form";
export const FINAL_FORM_ANCHOR = "form";
export const HERO_FORM_ID = "hero-lead-form";
export const FINAL_FORM_ID = "final-lead-form";

export interface RoutePhone {
  display: string;
  href: string;
  office: string;
}

export interface RouteVariant {
  path: string;
  phone: RoutePhone;
}

/** Page A: Upper Peninsula campaign, Marquette office line. */
export const UPPER_PENINSULA: RouteVariant = {
  path: "/franklinwh",
  phone: { display: "(906) 235-0340", href: "tel:+19062350340", office: "Marquette office" },
};

/** Page B: northern Lower Peninsula campaign, Traverse City office line. */
export const LOWER_PENINSULA: RouteVariant = {
  path: "/franklinwh-lower-peninsula",
  phone: { display: "(231) 590-7305", href: "tel:+12315907305", office: "Traverse City office" },
};
