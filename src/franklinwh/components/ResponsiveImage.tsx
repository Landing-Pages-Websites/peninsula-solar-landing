import type { ReactElement } from "react";
import { largestSrc, srcSet, type ResponsiveSource } from "../images";

interface ResponsiveImageProps {
  image: ResponsiveSource;
  /** The rendered slot width per breakpoint, so the browser picks a 2x-sharp variant. */
  sizes: string;
  className?: string;
  priority?: boolean;
}

/** A plain <img> with a width-described srcset (the project serves images unoptimized). */
export function ResponsiveImage({ image, sizes, className = "", priority = false }: ResponsiveImageProps): ReactElement {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- images are pre-sized variants; next.config sets unoptimized
    <img
      src={largestSrc(image)}
      srcSet={srcSet(image)}
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
}
