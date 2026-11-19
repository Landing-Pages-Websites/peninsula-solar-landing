"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { FINAL_FORM_ANCHOR, QUOTE_CTA_LABEL } from "../config";
import { CARD_SELECTOR, HERO_SELECTOR, OBSTRUCTION_SELECTOR, shouldShowFloating, type Box } from "../floatingVisibility";
import { buttonClass } from "./buttonStyles";

function rect(el: Element | null): Box | null {
  return el ? el.getBoundingClientRect() : null;
}

function rects(selector: string): Box[] {
  return Array.from(document.querySelectorAll(selector), (el) => el.getBoundingClientRect());
}

function measure(lane: HTMLElement | null): boolean {
  return shouldShowFloating({
    viewportHeight: window.innerHeight,
    hero: rect(document.querySelector(HERO_SELECTOR)),
    cards: rects(CARD_SELECTOR),
    lane: rect(lane),
    obstructions: () => rects(OBSTRUCTION_SELECTOR),
  });
}

/** Re-checks on scroll, resize and content changes, at most once per frame. */
function useFloatingVisibility(laneRef: { current: HTMLElement | null }): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible(measure(laneRef.current)));
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [laneRef]);
  return visible;
}

/** Form-only floating action. It paints only in a real gap and is inert whenever it would cover anything. */
export function FloatingCta(): ReactElement {
  const laneRef = useRef<HTMLDivElement>(null);
  const visible = useFloatingVisibility(laneRef);
  return (
    <div
      ref={laneRef}
      data-floating-cta-lane
      inert={!visible}
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 transition-opacity duration-200 ease-brand sm:inset-x-auto sm:bottom-6 sm:right-6 sm:p-0 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <a href={`#${FINAL_FORM_ANCHOR}`} className={buttonClass("primary", "w-full shadow-float sm:w-auto")}>
        {QUOTE_CTA_LABEL}
      </a>
    </div>
  );
}
