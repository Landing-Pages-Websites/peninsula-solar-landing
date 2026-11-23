import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { BACKUP_BENEFITS } from "../../content";
import { IMAGES } from "../../images";
import { RULED } from "../buttonStyles";
import { ResponsiveImage } from "../ResponsiveImage";
import { RenderFloorFilter } from "./RenderFloorFilter";
import { SectionShell } from "./SectionShell";

/** One controller image anchoring three plain feature rows, each qualified by its module or setting. */
export function BackupBenefits({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="backup-benefits" tone="night" phone={phone}>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <figure className="order-2 flex items-center justify-center rounded-panel border border-gold/20 bg-glow-raised px-8 py-10 lg:order-1 lg:px-12">
          <RenderFloorFilter id="agate-render-floor" />
          <ResponsiveImage
            image={IMAGES.aGate}
            sizes="(min-width: 1200px) 440px, (min-width: 1024px) 38vw, (min-width: 544px) 440px, calc(100vw - 104px)"
            className="render-fade aspect-[60/43] h-auto w-full max-w-[440px] object-cover object-top [filter:url(#agate-render-floor)]"
          />
        </figure>
        <div data-reveal className="order-1 flex flex-col justify-center lg:order-2">
          <h2 className="text-h2">A modern alternative to a&nbsp;standby generator</h2>
          <ul className={`mt-8 ${RULED}`}>
            {BACKUP_BENEFITS.map((benefit) => (
              <li key={benefit.title} className="py-6">
                <h3 className="text-h3 text-gold">{benefit.title}</h3>
                <p className="mt-2 text-body text-mist">{benefit.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
