"use client";

import { useEffect } from "react";
import { STORAGE_KEYS } from "../attribution";

function readLandingParams(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.landingParams) ?? window.location.search;
  } catch {
    return window.location.search;
  }
}

/** Keeps the landing query string (UTMs, click ids) for the whole session. */
export function QueryParamPersistence(): null {
  useEffect(() => {
    try {
      if (window.location.search) sessionStorage.setItem(STORAGE_KEYS.landingParams, window.location.search);
    } catch {
      // Storage blocked: the live URL still carries the params.
    }

    // Hash navigation (#form) must never drop the paid-click params.
    const restoreParams = (): void => {
      const stored = readLandingParams();
      if (!stored || window.location.search) return;
      const { pathname, hash } = window.location;
      window.history.replaceState(null, "", `${pathname}${stored}${hash}`);
    };

    window.addEventListener("hashchange", restoreParams);
    return () => window.removeEventListener("hashchange", restoreParams);
  }, []);

  return null;
}
