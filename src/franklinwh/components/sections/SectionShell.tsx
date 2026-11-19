import type { ReactElement, ReactNode } from "react";
import { FINAL_FORM_ANCHOR, type RoutePhone } from "../../config";
import { CONTAINER } from "../buttonStyles";
import { CtaPair } from "../CtaPair";

export type SectionTone = "paper" | "surface" | "navy";

const TONES: Record<SectionTone, string> = {
  paper: "bg-paper text-ink",
  surface: "bg-surface text-ink",
  navy: "bg-navy text-paper",
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
    <section id={id} className={`${TONES[tone]} py-20 lg:py-24`}>
      <div className={CONTAINER}>
        {children}
        <div className="mt-12 lg:mt-14">
          <CtaPair phone={phone} formAnchor={FINAL_FORM_ANCHOR} surface={tone === "navy" ? "dark" : "light"} />
        </div>
      </div>
    </section>
  );
}
