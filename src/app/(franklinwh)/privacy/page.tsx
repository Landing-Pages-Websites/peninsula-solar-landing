import type { Metadata } from "next";
import type { ReactElement } from "react";
import { PrivacyPolicy } from "@/franklinwh/components/PrivacyPolicy";
import { SiteFooter } from "@/franklinwh/components/SiteFooter";
import { SiteHeader } from "@/franklinwh/components/SiteHeader";
import { PRIVACY_PATH } from "@/franklinwh/config";

export const metadata: Metadata = {
  title: "Privacy Policy | Peninsula Solar",
  description: "How Peninsula Solar handles information submitted through its quote request pages.",
  alternates: { canonical: PRIVACY_PATH },
};

/** Shared by both campaign routes, so it carries no route phone. */
export default function PrivacyPage(): ReactElement {
  return (
    <>
      <SiteHeader />
      <main>
        <PrivacyPolicy />
      </main>
      <SiteFooter />
    </>
  );
}
