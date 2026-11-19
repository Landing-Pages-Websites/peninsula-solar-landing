import type { Metadata } from "next";
import { SITE, type RouteVariant } from "./config";
import { IMAGES, srcFor } from "./images";

/** Open Graph previews want ~1200px wide; the hero has a 1300px variant (4:3). */
const OG_IMAGE_WIDTH = 1300;
const OG_IMAGE_HEIGHT = 975;
const TITLE = "FranklinWH Home Battery Backup | Peninsula Solar";
const DESCRIPTION =
  "FranklinWH home battery backup for Northern Michigan homes, cabins and camps, installed by Peninsula Solar's licensed electricians. Request a free quote.";

export function pageMetadata(variant: RouteVariant): Metadata {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: variant.path },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: variant.path,
      siteName: SITE.brandName,
      type: "website",
      images: [{ url: srcFor(IMAGES.heroInstallation, OG_IMAGE_WIDTH), width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }],
    },
  };
}
