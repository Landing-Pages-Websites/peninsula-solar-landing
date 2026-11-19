import type { ReactElement } from "react";
import { deliveryBands, largestSrc, srcSet, type ResponsiveSource } from "../images";

interface ResponsiveImageProps {
  image: ResponsiveSource;
  /** The true rendered slot width per breakpoint. */
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * A plain <img> (the project serves images unoptimized). When the image's viewport bands need
 * different srcset floors, each wider band becomes a `<source media>` in a `display: contents`
 * <picture>, so the <img> stays the flex/grid item and keeps its classes and aspect ratio.
 */
export function ResponsiveImage({ image, sizes, className = "", priority = false }: ResponsiveImageProps): ReactElement {
  const bands = deliveryBands(image);
  const narrowest = bands[bands.length - 1];
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- images are pre-sized variants; next.config sets unoptimized
    <img
      src={largestSrc(image)}
      srcSet={srcSet(image, narrowest.widths)}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
    />
  );
  if (bands.length === 1) return img;
  return (
    <picture className="contents">
      {bands.slice(0, -1).map((band) => (
        <source key={band.minViewport} media={`(min-width: ${band.minViewport}px)`} srcSet={srcSet(image, band.widths)} sizes={sizes} />
      ))}
      {img}
    </picture>
  );
}
