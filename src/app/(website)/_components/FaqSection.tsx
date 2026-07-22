"use client"
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Hoe werkt DealClosed voor bedrijven?",
      answer:
        "Bedrijven plaatsen een opdracht, kiezen een geschikte freelance salesagent en betalen op basis van de afgesproken voorwaarden wanneer resultaten worden behaald.",
    },
    {
      question: "Hoe kunnen salesagenten opdrachten vinden?",
      answer:
        "Salesagenten kunnen beschikbare opdrachten bekijken, zich aanmelden voor passende deals en rechtstreeks samenwerken met bedrijven via het platform.",
    },
    {
      question: "Wanneer worden betalingen verwerkt?",
      answer:
        "Betalingen worden verwerkt volgens de gekozen betaalmethode en de voorwaarden van de opdracht of cursus.",
    },
    {
      question: "Kan ik mijn profiel promoten?",
      answer:
        "Ja, u kunt uw profiel, opdracht of cursus promoten om meer zichtbaarheid te krijgen binnen het platform.",
    },
    {
      question: "Is DealClosed geschikt voor kleine bedrijven?",
      answer:
        "Ja, DealClosed is geschikt voor kleine en groeiende bedrijven die flexibel willen samenwerken met freelance salesprofessionals.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="lg:py-20 py-10 bg-white">
      <div className="max-w-5xl mx-auto lg:px-6 px-3">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">
            Veelgestelde <span className="text-green-600">vragen</span>
          </h2>
          <p className="text-gray-600 mt-4 leading-relaxed">
            Vind snel antwoorden op veelgestelde vragen over opdrachten,
            cursussen, betalingen en samenwerking via DealClosed.
            <br />
            Staat uw vraag er niet bij, neem dan gerust contact met ons op.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-green-600 rounded-lg overflow-hidden"
            >
              {/* Question */}
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <span className="text-left text-gray-900 font-semibold text-base">
                  {faq.question}
                </span>
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={16} className="text-white" />
                </div>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="px-6 pb-6 bg-gray-50">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
