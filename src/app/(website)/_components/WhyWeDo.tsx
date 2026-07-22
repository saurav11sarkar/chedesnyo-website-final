import React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ConnectingSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 lg:py-20 py-10 ">
      <div className="container w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
        {/* Left Section - Content (60%) */}
        <div className="w-full lg:w-3/5 flex flex-col justify-center h-full space-y-6 text-center lg:text-left">
          {/* <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold px-3 py-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
            Verbinden met een klik
          </div> */}

          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl font-bold leading-snug">
            <span className="text-[#008000]">Waarom we doen wat we</span>
            <span className="text-black"> doen</span>
            <br />
            <span className="text-[#0077B6]">de reden achter elke actie</span>
          </h2>

          {/* Description */}
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            Bij DealClosed geloven we in het oplossen van echte verkoopuitdagingen
            met eenvoudige, effectieve oplossingen. Ons platform is ontstaan
            vanuit een duidelijke behoefte in de markt.
          </p>

          {/* For Businesses */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <CheckCircle2
                className="w-6 h-6 text-green-600 mt-1"
                strokeWidth={3}
              />
              <div>
                <p className="text-gray-700 leading-relaxed">
                  <span className="text-gray-700 leading-relaxed">
                    Voor bedrijven:
                  </span>
                  Veel bedrijven hebben moeite om betrouwbaar salestalent te vinden
                  zonder langlopende contracten of hoge wervingskosten. Ze hebben
                  flexibele, resultaatgerichte oplossingen nodig om omzet te laten
                  groeien zonder risico.
                </p>
              </div>
            </div>
          </div>

          {/* For Sales Agents */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <CheckCircle2
                className="w-6 h-6 text-green-600 mt-1"
                strokeWidth={3}
              />
              <div>
                <p className="text-gray-700 leading-relaxed">
                  <span className="text-gray-700 leading-relaxed">
                    Voor salesagenten:
                  </span>
                  Freelancers willen vrijheid, duidelijke kansen en eerlijke beloning
                  voor hun resultaten. DealClosed helpt hen om passende opdrachten
                  te vinden en flexibel samen te werken.
                </p>
              </div>
            </div>
          </div>

          {/* Read More Button */}
          <div className="pt-4 flex justify-center lg:block">
  <Link href="/blogs">
    <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
      Lees meer
      <ChevronRight size={20} />
    </button>
  </Link>
</div>
        </div>

        {/* Right Section - Image (40%) */}
        <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
          <div className="relative w-full h-full">
            <Image
              src="/images/connectionImage.png"
              alt="Bedrijven verbinden met freelance salesagenten"
              width={500}
              height={500}
              className="w-full h-full object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
