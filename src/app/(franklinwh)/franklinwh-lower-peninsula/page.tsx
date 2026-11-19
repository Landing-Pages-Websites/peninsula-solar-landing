import type { Metadata } from "next";
import type { ReactElement } from "react";
import { LOWER_PENINSULA } from "@/franklinwh/config";
import { FranklinPage } from "@/franklinwh/components/FranklinPage";
import { pageMetadata } from "@/franklinwh/pageMetadata";

export const metadata: Metadata = pageMetadata(LOWER_PENINSULA);

/** Page B: northern Lower Peninsula campaign, (231) 590-7305 everywhere. */
export default function FranklinLowerPeninsulaPage(): ReactElement {
  return <FranklinPage variant={LOWER_PENINSULA} />;
}
