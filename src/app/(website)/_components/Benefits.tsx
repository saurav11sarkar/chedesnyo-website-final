import React from 'react';
import { TrendingUp, Briefcase, BarChart3, Zap, Target } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export default function Benefits() {
  const freelanceBenefits = [
    {
      title: 'Werk overal vandaan',
      description: 'vanuit huis, een cafe of tijdens het reizen - u kiest waar en wanneer u werkt.'
    },
    {
      title: 'Verdien aantrekkelijke commissies',
      description: 'Ontvang een eerlijke vergoeding per gesloten deal. Uw succes ligt in uw handen'
    },
    {
      title: 'Diverse kansen',
      description: 'Ontdek een breed aanbod aan projecten en bedrijven die passen bij uw vaardigheden en interesses'
    }
  ];

  const businessBenefits = [
    {
      title: 'Meer verkoop, minder risico',
      description: 'Betaal alleen voor resultaten. Geen vaste salarissen of wervingskosten - alleen een duidelijke commissie per gesloten deal.'
    },
    {
      title: 'Toegang tot ervaren salesagenten',
      description: 'Kom in contact met gemotiveerde freelancers die klaar zijn om uw bedrijf te laten groeien.'
    },
    {
      title: 'Snelle en eenvoudige samenwerking',
      description: 'Plaats uw opdracht, selecteer de juiste salesagent en laat de deals binnenkomen.'
    }
  ];

  const whyChooseUs = [
    {
      icon: BarChart3,
      title: 'Transparantie',
      description: 'Met een eenvoudige vergoeding van 15% op succesvolle deals zorgen we voor eerlijkheid en duidelijkheid bij elke transactie'
    },
    {
      icon: Zap,
      title: 'Flexibiliteit',
      description: 'Wij omarmen de toekomst van werk en geven salesagenten en bedrijven vrijheid en keuze.'
    },
    {
      icon: Target,
      title: 'Focus op resultaten',
      description: 'Wij geloven in het belonen van resultaten, niet alleen inspanning, en creeren zo een prestatiegerichte cultuur voor iedereen.'
    }
  ];

  return (
    <section className="px-4 lg:py-20">
      <div className="container mx-auto">
        {/* Top Benefits Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Freelance Sales Agents Benefits */}
          <div className="bg-white border-b-4 border-green-600 rounded-3xl p-8 lg:shadow-[0px_8px_32px_0px_#00000029]">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center border-2 border-green-600">
                <TrendingUp className="w-8 h-8 text-green-600" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">Voordelen voor freelance salesagenten</h3>

            <ul className="space-y-4">
              {freelanceBenefits.map((benefit, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-green-600 font-bold text-xl flex-shrink-0">•</span>
                  <div>
                    <span className="font-bold text-gray-900">{benefit.title}:</span>
                    <span className="text-gray-700"> {benefit.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Benefits */}
          <div className="bg-white border-b-4 border-green-600 rounded-3xl p-8 lg:shadow-[0px_8px_32px_0px_#00000029]">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center border-2 border-green-600">
                <Briefcase className="w-8 h-8 text-green-600" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">Voordelen voor bedrijven</h3>

            <ul className="space-y-4">
              {businessBenefits.map((benefit, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-green-600 font-bold text-xl flex-shrink-0">•</span>
                  <div>
                    <span className="font-bold text-gray-900">{benefit.title}:</span>
                    <span className="text-gray-700"> {benefit.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left - Why Choose Us Card */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white lg:shadow-xl lg:row-span-1 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-4xl font-bold mb-6">Waarom voor ons kiezen?</h2>
              <p className="text-green-100 leading-relaxed mb-8">
                We hebben DealClosed ontwikkeld om deze kloof te overbruggen. Door bedrijven te verbinden met gemotiveerde freelance salesagenten bieden we een win-winoplossing: bedrijven vergroten hun omzet zonder onnodige overhead en salesagenten krijgen de flexibiliteit om te werken hoe, wanneer en waar ze willen.
              </p>
            </div>
            <button className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all self-start">
              Meer informatie
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Right - Why Choose Us Features */}
          {whyChooseUs.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white border-b-4 border-green-600 rounded-3xl p-8 lg:shadow-[0px_8px_32px_0px_#00000029] h-full flex flex-col justify-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center border-2 border-green-600">
                    <IconComponent className="w-8 h-8 text-green-600" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-700 text-center text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
