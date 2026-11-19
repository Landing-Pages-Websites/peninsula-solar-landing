import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UPPER_PENINSULA } from "@/franklinwh/config";
import { FranklinPage } from "@/franklinwh/components/FranklinPage";
import { pageMetadata } from "@/franklinwh/pageMetadata";

export const metadata: Metadata = pageMetadata(UPPER_PENINSULA);

/** Page A: Upper Peninsula campaign, (906) 235-0340 everywhere. */
export default function FranklinUpperPeninsulaPage(): ReactElement {
  return <FranklinPage variant={UPPER_PENINSULA} />;
}
