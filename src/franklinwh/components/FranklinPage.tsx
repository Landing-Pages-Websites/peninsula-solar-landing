import type { ReactElement } from "react";
import type { RouteVariant } from "../config";
import { FloatingCta } from "./FloatingCta";
import { LeadFormProvider } from "./LeadFormProvider";
import { BackupBenefits } from "./sections/BackupBenefits";
import { CustomerProof } from "./sections/CustomerProof";
import { Faq } from "./sections/Faq";
import { FinalQuote } from "./sections/FinalQuote";
import { Hero } from "./sections/Hero";
import { InHouseProcess } from "./sections/InHouseProcess";
import { MarquetteProject } from "./sections/MarquetteProject";
import { ProductFamily } from "./sections/ProductFamily";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** The one FranklinWH page. Route variants differ only in their phone line. */
export function FranklinPage({ variant }: { variant: RouteVariant }): ReactElement {
  const { phone } = variant;
  return (
    <LeadFormProvider phone={phone}>
      <SiteHeader phone={phone} />
      <main>
        <Hero phone={phone} />
        <BackupBenefits phone={phone} />
        <ProductFamily phone={phone} />
        <MarquetteProject phone={phone} />
        <InHouseProcess phone={phone} />
        <CustomerProof phone={phone} />
        <Faq phone={phone} />
        <FinalQuote />
      </main>
      <SiteFooter phone={phone} />
      <FloatingCta />
    </LeadFormProvider>
  );
}
