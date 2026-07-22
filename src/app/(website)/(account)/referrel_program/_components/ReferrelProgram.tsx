"use client";
import React, { useState } from "react";
import { Gift, TrendingUp, BarChart3, Copy, Check } from "lucide-react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

function ReferralProgram() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const token = session?.user?.accessToken || "";
  const userRole = session?.user?.role || "";

  const { data: dashData } = useQuery({
    queryKey: ["referralDashboard", token],
    queryFn: async () => {
      const endpoint = userRole === "business" ? "/dashboard/company" : "/dashboard/freelancer";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${endpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: profileData } = useQuery({
    queryKey: ["referralProfile", token],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const referralCode = profileData?.data?.referralCode || "";
  const referralLink = referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${referralCode}`
    : "";
  const referralCount = dashData?.data?.stats?.referralCount || 0;
  const walletBalance = dashData?.data?.stats?.walletBalance ?? profileData?.data?.balance ?? 0;

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen">
      <BreadcrumbHeader
        title="Verwijzingsprogramma"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Verwijzingsprogramma", href: "/referrel_program" },
        ]}
      />
      <div className="container mx-auto py-[96px] px-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Verwijzingsprogramma - verdien geld door te delen
          </h1>
          <p className="text-gray-600 text-base">
            Help anderen werk of salestalent te vinden en verdien met hen mee!
          </p>
        </div>

        {token && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-gray-300 rounded-lg p-6 bg-white text-center">
              <p className="text-sm text-gray-500 mb-1">Uw verwijzingen</p>
              <p className="text-3xl font-bold text-gray-900">{referralCount}</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-6 bg-white text-center">
              <p className="text-sm text-gray-500 mb-1">Saldo</p>
              <p className="text-3xl font-bold text-green-600">&euro;{walletBalance.toFixed(2)}</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-6 bg-white text-center">
              <p className="text-sm text-gray-500 mb-1">Verwijzingscode</p>
              <p className="text-xl font-mono font-bold text-gray-900">{referralCode || "—"}</p>
            </div>
          </div>
        )}

        {token && referralLink && (
          <div className="border border-green-300 rounded-lg p-6 bg-green-50 mb-8">
            <p className="text-sm font-medium text-gray-700 mb-2">Uw persoonlijke verwijzingslink:</p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 font-mono"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Gekopieerd!" : "Kopieer"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <div className="flex items-start gap-3 mb-4">
              <Gift className="text-gray-700 mt-1" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Hoe werkt het?</h2>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex gap-3"><span className="text-gray-900">&bull;</span><span>Elke gebruiker krijgt een unieke verwijzingslink of code.</span></li>
              <li className="flex gap-3"><span className="text-gray-900">&bull;</span><span>Deel deze met anderen, zoals ervaren freelance salesagenten of bedrijven die hulp zoeken.</span></li>
              <li className="flex gap-3"><span className="text-gray-900">&bull;</span><span>Wanneer iemand zich via uw link aanmeldt en een deal voltooit, verdient u commissie.</span></li>
            </ul>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="text-gray-700 mt-1" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Hoeveel verdient u?</h2>
            </div>
            <div className="space-y-3">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex gap-3"><span className="text-gray-900">&bull;</span><span>DealClosed rekent 15% commissie per voltooide deal.</span></li>
                <li className="flex gap-3"><span className="text-gray-900">&bull;</span><span>U verdient 20% van die 15% telkens wanneer uw verwijzing wordt betaald.</span></li>
              </ul>
              <div className="bg-gray-100 p-4 rounded-lg mt-4 space-y-2">
                <p className="font-semibold text-gray-900 text-sm">Voorbeeld:</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>Een freelancer verdient <span className="font-semibold">&euro;1000</span></p>
                  <p>DealClosed houdt <span className="font-semibold">&euro;150 (15%)</span></p>
                  <p>U verdient <span className="font-semibold">&euro;30 (20% of &euro;150)</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <div className="flex items-start gap-3 mb-4">
              <BarChart3 className="text-gray-700 mt-1" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Uw persoonlijke verwijzingsdashboard</h2>
            </div>
            <div>
              <p className="text-gray-700 text-sm mb-3">Op uw verwijzingspagina ziet u:</p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex gap-3"><span className="text-gray-900">&bull;</span><span>Aantal succesvolle verwijzingen</span></li>
                <li className="flex gap-3"><span className="text-gray-900">&bull;</span><span>Totaal verdiende commissie</span></li>
                <li className="flex gap-3"><span className="text-gray-900">&bull;</span><span>Kopieerknop om uw unieke verwijzingslink te delen</span></li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-900 text-sm">
              <span className="font-semibold">Tip:</span> Er is geen limiet aan hoeveel mensen u kunt verwijzen. Hoe meer u deelt, hoe meer u verdient!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferralProgram;
