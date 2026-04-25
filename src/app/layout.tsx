import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Your Free Solar Estimate | Peninsula Solar — Northern Michigan",
  description:
    "Stop paying for power you don't own. Peninsula Solar installs battery-backed solar systems for Northern Michigan homeowners — backup power, energy independence, rising utility costs solved. Free custom solar design.",
  robots: "noindex, nofollow",
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
