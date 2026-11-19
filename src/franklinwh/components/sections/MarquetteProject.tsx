import type { ReactElement } from "react";
import type { RoutePhone } from "../../config";
import { IMAGES, type ResponsiveSource } from "../../images";
import { ResponsiveImage } from "../ResponsiveImage";
import { SectionShell } from "./SectionShell";

/** Landscape photos take 4/10.25 of the row on desktop. */
const LANDSCAPE_SIZES = "(min-width: 1200px) 432px, (min-width: 1024px) 37vw, calc(100vw - 40px)";

interface ProjectPhoto {
  image: ResponsiveSource;
  caption: string;
  /** Flex grow from lg equal to the photo's aspect ratio x3, so all three share one height uncropped, plus any narrow-width frame. */
  layout: string;
  sizes: string;
}

const PHOTOS: readonly ProjectPhoto[] = [
  {
    image: IMAGES.marquetteEquipment,
    caption: "FranklinWH equipment beside the main electrical panel",
    layout: "lg:flex-[4_1_0%]",
    sizes: LANDSCAPE_SIZES,
  },
  {
    image: IMAGES.marquetteArray,
    caption: "The rooftop solar array",
    layout: "lg:flex-[4_1_0%]",
    sizes: LANDSCAPE_SIZES,
  },
  {
    image: IMAGES.marquetteRacking,
    caption: "Ballasted racking under the panels",
    // Below lg the portrait is centered at no more than 750px, the widest slot its 1500px original
    // covers at 2x without upscaling.
    layout: "lg:flex-[2.25_1_0%] max-lg:mx-auto max-lg:w-full max-lg:max-w-[750px]",
    sizes: "(min-width: 1200px) 243px, (min-width: 1024px) 21vw, (min-width: 790px) 750px, calc(100vw - 40px)",
  },
];

/** The customer's own aPower S project: three original photos at their true proportions. */
export function MarquetteProject({ phone }: { phone: RoutePhone }): ReactElement {
  return (
    <SectionShell id="marquette-project" tone="paper" phone={phone}>
      <div data-reveal className="grid gap-4 lg:grid-cols-[5fr_7fr] lg:items-end lg:gap-16">
        <h2 className="text-h2 font-semibold">A FranklinWH project near Marquette</h2>
        <p className="text-body text-muted">Our aPower&nbsp;S installation pairs battery backup with rooftop solar.</p>
      </div>
      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-4">
        {PHOTOS.map((photo) => (
          <figure key={photo.image.base} className={`flex flex-col gap-3 ${photo.layout}`}>
            <ResponsiveImage image={photo.image} sizes={photo.sizes} className="h-auto w-full rounded-panel bg-hairline" />
            <figcaption className="text-small text-muted">{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}
