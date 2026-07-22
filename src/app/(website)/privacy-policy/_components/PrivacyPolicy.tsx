"use client";
import React from "react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

function PrivacyPolicy() {
  const { data, isLoading } = useQuery({
    queryKey: ["privacyPolicy"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/legal/privacy`
      );
      if (!res.ok) throw new Error("Failed to fetch privacy policy");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen">
      <BreadcrumbHeader
        title="Privacybeleid"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Privacybeleid", href: "/privacy-policy" },
        ]}
      />
      <div className="container mx-auto px-6 lg:px-10 py-16">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div
            className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: data?.data?.content || "<p>Privacybeleid wordt binnenkort gepubliceerd.</p>",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PrivacyPolicy;
