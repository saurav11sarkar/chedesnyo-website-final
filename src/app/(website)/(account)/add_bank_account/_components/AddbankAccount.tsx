"use client";

import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import StripeAccountPanel from "@/components/stripe/StripeAccountPanel";
import { useLanguage } from "@/provider/TranslateProvider";

export default function AddbankAccount() {
  const { language } = useLanguage();
  const title = language === "en" ? "Add bank account" : "Bankrekening toevoegen";
  return (
    <div translate="no" className="notranslate min-h-screen">
      <BreadcrumbHeader
        title={title}
        breadcrumbs={[
          { label: language === "en" ? "Home" : "Startpagina", href: "/" },
          { label: title, href: "/add_bank_account" },
        ]}
      />
      <main className="container mx-auto px-6 py-20">
        <StripeAccountPanel />
      </main>
    </div>
  );
}
