"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = "[data-reveal]:not([data-shown])";
/** Start the fade a little before a block enters, so it is opaque by the time it is read. */
const ROOT_MARGIN = "0px 0px -8% 0px";

/** One IntersectionObserver for every `data-reveal` block; each fades in once and stays. */
export function RevealObserver(): null {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: ROOT_MARGIN },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
