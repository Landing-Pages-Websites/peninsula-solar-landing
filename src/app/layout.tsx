import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Your Free Solar Estimate | Peninsula Solar — Northern Michigan",
  description:
    "Stop paying for power you don't own. Peninsula Solar installs battery-backed solar systems for Northern Michigan homeowners — backup power, energy independence, rising utility costs solved. Free custom solar design.",
  robots: "noindex, nofollow",
  metadataBase: new URL("https://call.peninsula-solar.com"),
  alternates: {
    canonical: "https://call.peninsula-solar.com",
  },
  openGraph: {
    title: "Get Your Free Solar Estimate | Peninsula Solar",
    description:
      "Battery-backed solar — the smart alternative to a standby generator. Peninsula Solar's in-house licensed crews serve Northern Michigan. Free custom design.",
    url: "https://call.peninsula-solar.com",
    siteName: "Peninsula Solar",
    images: [
      {
        url: "/og-image.png",
        width: 512,
        height: 512,
        alt: "Peninsula Solar — Northern Michigan's Most Trusted Solar Installer",
      },
    ],
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
