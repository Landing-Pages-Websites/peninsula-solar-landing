import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { BACKUP_BENEFITS } from "../../content";
import { IMAGES } from "../../images";
import { ResponsiveImage } from "../ResponsiveImage";
import { SectionShell } from "./SectionShell";

/** One controller image anchoring three plain feature rows, each qualified by its module or setting. */
export function BackupBenefits({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="backup-benefits" tone="paper" phone={phone}>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <figure className="order-2 flex items-center justify-center rounded-panel bg-surface px-8 py-10 lg:order-1 lg:px-12">
          <ResponsiveImage
            image={IMAGES.aGate}
            sizes="(min-width: 1200px) 440px, (min-width: 1024px) 38vw, calc(100vw - 104px)"
            className="h-auto w-full max-w-[440px]"
          />
        </figure>
        <div data-reveal className="order-1 flex flex-col justify-center lg:order-2">
          <h2 className="text-h2 font-semibold">A modern alternative to a standby generator</h2>
          <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
            {BACKUP_BENEFITS.map((benefit) => (
              <li key={benefit.title} className="py-6">
                <h3 className="text-h3 font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-body text-muted">{benefit.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
