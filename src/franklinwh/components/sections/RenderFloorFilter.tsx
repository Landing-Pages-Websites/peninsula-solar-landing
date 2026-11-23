import type { ReactElement } from "react";

/**
 * An SVG alpha threshold for the manufacturer renders: their faint floor shadow (alpha below ~15%)
 * was drawn for white pages and shows as a hard-edged light band on navy. Opaque product pixels and
 * the darker contact shadow survive; reference it with `[filter:url(#id)]` on the render.
 */
export function RenderFloorFilter({ id }: { id: string }): ReactElement {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0">
      <filter id={id} colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncA type="linear" slope="1.6" intercept="-0.25" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
