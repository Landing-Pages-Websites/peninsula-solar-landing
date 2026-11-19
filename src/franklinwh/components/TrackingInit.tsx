"use client";

import { useEffect } from "react";
import "../conversionEvents";
import { OPTIMIZER_API, OPTIMIZER_ID, OPTIMIZER_SRC, SITE, TRACKING_API } from "../config";

/**
 * Backup layer only: the primary MegaTag config and optimizer tag live in layout.tsx <head>.
 * This loads the optimizer only if that tag is missing, so it never double-injects.
 */
export function TrackingInit(): null {
  useEffect(() => {
    if (document.getElementById(OPTIMIZER_ID)) return;
    window.MEGA_TAG_CONFIG = { siteKey: SITE.siteKey, gtmId: SITE.gtmId };
    window.API_ENDPOINT = OPTIMIZER_API;
    window.TRACKING_API_ENDPOINT = TRACKING_API;
    const script = document.createElement("script");
    script.id = OPTIMIZER_ID;
    script.src = OPTIMIZER_SRC;
    script.async = true;
    document.head.appendChild(script);
  }, []);
  return null;
}
