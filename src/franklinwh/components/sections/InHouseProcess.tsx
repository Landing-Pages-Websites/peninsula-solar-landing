import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { PROCESS_STEPS } from "../../content";
import { SectionShell } from "./SectionShell";

/** Three connected steps; numbered because they are a real sequence. */
export function InHouseProcess({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="in-house-process" tone="surface" phone={phone}>
      <h2 data-reveal className="text-h2 font-semibold">One team from first call to warranty</h2>
      <ol data-reveal className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
        {PROCESS_STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-col">
            <div className="flex items-center gap-4" aria-hidden="true">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-navy bg-paper text-label font-semibold text-navy">
                {index + 1}
              </span>
              {index < PROCESS_STEPS.length - 1 && <span className="hidden h-0.5 flex-1 bg-navy/25 lg:block" />}
            </div>
            <h3 className="mt-5 text-h3 font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-[38ch] text-body text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
