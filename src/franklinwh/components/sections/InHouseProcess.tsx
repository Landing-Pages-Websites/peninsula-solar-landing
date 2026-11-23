import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { PROCESS_STEPS } from "../../content";
import { RULED } from "../buttonStyles";
import { SectionShell } from "./SectionShell";

/** Three ruled steps, like the flyer's three-up panel; numbered because they are a real sequence. */
export function InHouseProcess({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="in-house-process" tone="raised" phone={phone}>
      <h2 data-reveal className="title-rule text-h2">One team from first call to warranty</h2>
      <ol data-reveal className={`mt-12 grid ${RULED} lg:grid-cols-3 lg:divide-x lg:divide-y-0`}>
        {PROCESS_STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-col py-8 lg:px-8 lg:py-10 lg:first:pl-0 lg:last:pr-0">
            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-gold font-display text-h4 text-gold">
              {index + 1}
            </span>
            <h3 className="mt-5 text-h3">{step.title}</h3>
            <p className="mt-2 max-w-[38ch] text-body text-mist">{step.body}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
