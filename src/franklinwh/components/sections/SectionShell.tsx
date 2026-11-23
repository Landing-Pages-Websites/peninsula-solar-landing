import type { ReactElement, ReactNode } from "react";
import { FINAL_FORM_ANCHOR, type RoutePhone } from "../../config";
import { CONTAINER } from "../buttonStyles";
import { CtaPair } from "../CtaPair";

export type SectionTone = "night" | "raised" | "dusk";

/** Three navy grounds from the flyer: night and raised harbor with a headline glow, and the dusk band. */
const TONES: Record<SectionTone, string> = {
  night: "bg-glow",
  raised: "bg-glow-raised",
  dusk: "bg-dusk-fade",
};

interface SectionShellProps {
  id: string;
  tone: SectionTone;
  phone: RoutePhone;
  children: ReactNode;
}

/** A content section that always ends with the centered, forward-only quote + call pair. */
export function SectionShell({ id, tone, phone, children }: SectionShellProps): ReactElement {
  return (
    <section id={id} className={`${TONES[tone]} py-20 lg:py-28`}>
      <div className={CONTAINER}>
        {children}
        <div className="mt-12 lg:mt-14">
          <CtaPair phone={phone} formAnchor={FINAL_FORM_ANCHOR} />
        </div>
      </div>
    </section>
  );
}
