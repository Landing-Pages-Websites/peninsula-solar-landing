import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import type { ReactElement, ReactNode } from "react";
import { QueryParamPersistence } from "@/franklinwh/components/QueryParamPersistence";
import { RevealObserver } from "@/franklinwh/components/RevealObserver";
import { TrackingInit } from "@/franklinwh/components/TrackingInit";
import { SITE } from "@/franklinwh/config";
import "./franklinwh.css";

// FranklinWH's brand manual (p.16) specifies Inter as the corporate typeface.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
// Display serif from the client's direct-mail flyer (task 45272822): upright and italic headings.
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: "variable", style: ["normal", "italic"], display: "swap" });

// MegaTag loads GTM from this config; never add a manual GTM tag. These literals must
// equal src/franklinwh/config.ts (tests/franklinwh/layoutConfig.test.ts enforces it).
const MEGA_TAG_BOOTSTRAP =
  'window.MEGA_TAG_CONFIG={siteKey:"sk_moeyep8q_kj6i28c0wm",gtmId:"GTM-WLQXZ22P"};window.API_ENDPOINT="https://optimizer.gomega.ai";window.TRACKING_API_ENDPOINT="https://events-api.gomega.ai";';

// Marks JS as available before first paint so scroll reveals never hide content without it.
const JS_FLAG = 'document.documentElement.classList.add("js");';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  robots: "noindex, nofollow",
  icons: {
    icon: [{ url: "/franklinwh/favicon.png", type: "image/png", sizes: "32x32" }],
    apple: "/franklinwh/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#172238",
};

export default function FranklinLayout({ children }: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        <script dangerouslySetInnerHTML={{ __html: MEGA_TAG_BOOTSTRAP }} />
        <meta name="mega-site-id" content="7d905a66-6641-427b-852c-dd6bec7c1e16" />
        {/* Literal id + src: the LP lint and the useTracking backup both key off them. */}
        <script id="optimizer-script" src="https://cdn.gomega.ai/scripts/optimizer.min.js" data-site-id="7d905a66-6641-427b-852c-dd6bec7c1e16" async />
      </head>
      <body>
        <QueryParamPersistence />
        <TrackingInit />
        <RevealObserver />
        {children}
        {/* Universal Mega call-tracking account: identical for every client. */}
        <Script src="https://572388.tctm.co/t.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
