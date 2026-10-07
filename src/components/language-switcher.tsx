"use client";

import { translationConfig } from "@/lib/translation";
import { useLanguage } from "@/provider/TranslateProvider";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div
      className="notranslate flex justify-center gap-3 p-3 flex-wrap bg-white border-t"
      translate="no"
      role="group"
      aria-label={language === "en" ? "Language" : "Taal"}
    >
      {translationConfig.languages.map(({ name, title }) => (
        <button
          key={name}
          type="button"
          lang={name}
          aria-pressed={language === name}
          onClick={() => changeLanguage(name)}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
            language === name ? "bg-orange-500 text-white" : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {title}
        </button>
      ))}
    </div>
  );
}
