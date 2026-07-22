"use client";
import React from "react";
import { CheckCircle, Star, Zap } from "lucide-react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";

function ProfilePromotion() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb Header */}
      <BreadcrumbHeader
        title="Uitleg over profielpromotie"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Uitleg over profielpromotie", href: "/profile_promotion" },
        ]}
      />
      <div className="container mx-auto px-10 py-[96px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Promoot uw profiel, opdracht of cursus
          </h1>
          <p className="text-gray-600 text-sm">
            Krijg meer zichtbaarheid - val op en groei!
          </p>
        </div>

        <div className="space-y-6">
          {/* What Can You Promote */}
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle
                className="text-red-500 mt-0.5 flex-shrink-0"
                size={20}
              />
              <h2 className="text-lg font-semibold text-gray-900">
                Wat kunt u promoten?
              </h2>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>
                  <span className="font-medium">Freelancerprofielen</span> -
                  ideaal voor nieuwkomers of wie meer zichtbaarheid wil.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>
                  <span className="font-medium">Bedrijfspagina&apos;s</span> - bouw
                  vertrouwen op en trek freelancers aan.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>
                  <span className="font-medium">Opdrachten</span> - ontvang meer
                  biedingen en betere voorstellen.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>
                  <span className="font-medium">Cursussen</span> - promoot uw
                  salestraining bij de juiste doelgroep.
                </span>
              </li>
            </ul>
          </div>

          {/* What Does Promotion Include */}
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <div className="flex items-start gap-3 mb-4">
              <Star
                className="text-yellow-500 mt-0.5 flex-shrink-0"
                size={20}
              />
              <h2 className="text-lg font-semibold text-gray-900">
                Wat houdt promotie in?
              </h2>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>
                  <span className="font-medium">
                    Toppositie in zoekresultaten
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>
                  <span className="font-medium">Een promotielabel</span> voor
                  zichtbaarheid en aandacht.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>
                  <span className="font-medium">
                    Binnenkort: uitgelichte plekken op de homepage
                  </span>{" "}
                  en aanbevolen content.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>
                  U kunt kiezen uit dagelijkse, wekelijkse of maandelijkse
                  promotiepakketten.
                </span>
              </li>
            </ul>
          </div>

          {/* Why Promote */}
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <div className="flex items-start gap-3 mb-4">
              <Zap className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">
                Waarom promoten?
              </h2>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>Meer reacties op uw opdrachten</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>Meer zichtbaarheid en profielweergaven</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900">•</span>
                <span>Meer cursusweergaven en verkopen</span>
              </li>
            </ul>
          </div>

          {/* Visibility Banner */}
          <div className="bg-green-100 border border-green-300 rounded-lg p-6 text-center">
            <p className="text-green-900 text-sm font-medium">
              Zichtbaarheid = kans. Promoot nu en vergroot uw succesfactor!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePromotion;
