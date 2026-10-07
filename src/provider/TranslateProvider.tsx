"use client";

import Script from "next/script";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Language, readLanguage, saveLanguage, translationConfig } from "@/lib/translation";

type TranslateElementConstructor = new (
  options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean; multilanguagePage: boolean },
  elementId: string,
) => unknown;

declare global {
  interface Window {
    TranslateInit?: () => void;
    google?: { translate?: { TranslateElement?: TranslateElementConstructor } };
    __GOOGLE_TRANSLATION_CONFIG__?: typeof translationConfig;
  }
}

type LanguageContextValue = {
  language: Language;
  changeLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: translationConfig.defaultLanguage,
  changeLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function TranslateProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(translationConfig.defaultLanguage);
  const [mounted, setMounted] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const initialized = useRef(false);

  const initialize = useCallback(() => {
    const element = document.getElementById("google_translate_element");
    const TranslateElement = window.google?.translate?.TranslateElement;
    if (!element || !TranslateElement || initialized.current) return;

    // Reuse a widget across development effect replays and script callbacks.
    if (element.querySelector(".goog-te-combo")) {
      initialized.current = true;
      return;
    }

    initialized.current = true;
    try {
      new TranslateElement({
        pageLanguage: translationConfig.defaultLanguage,
        includedLanguages: translationConfig.languages.map(({ name }) => name).join(","),
        autoDisplay: false,
        multilanguagePage: true,
      }, "google_translate_element");
    } catch {
      initialized.current = false;
      setScriptFailed(true);
    }
  }, []);

  useEffect(() => {
    const selectedLanguage = readLanguage(document.cookie);
    saveLanguage(selectedLanguage);
    setLanguage(selectedLanguage);
    document.documentElement.lang = selectedLanguage;
    window.__GOOGLE_TRANSLATION_CONFIG__ = translationConfig;

    const previousCallback = window.TranslateInit;
    window.TranslateInit = initialize;
    initialize();
    // Load the script only after hydration and the callback are ready.
    setMounted(true);

    return () => {
      if (window.TranslateInit === initialize) window.TranslateInit = previousCallback;
    };
  }, [initialize]);

  const changeLanguage = useCallback((nextLanguage: Language) => {
    if (nextLanguage === language) return;
    saveLanguage(nextLanguage);
    // Reload the same URL to restore the original React DOM before translating.
    // This also reliably restores Dutch after the widget has replaced text nodes.
    window.location.reload();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      <div id="google_translate_element" className="notranslate" translate="no" aria-hidden="true" />
      {children}
      {scriptFailed && language !== translationConfig.defaultLanguage && (
        <p role="status" className="notranslate fixed bottom-3 left-3 z-50 rounded bg-white p-3 text-sm shadow" translate="no">
          Translation could not be loaded. Please refresh to try again.
        </p>
      )}
      {mounted && (
        <Script
          id="google-translate-script"
          src="https://translate.google.com/translate_a/element.js?cb=TranslateInit"
          strategy="afterInteractive"
          onReady={initialize}
          onError={() => setScriptFailed(true)}
        />
      )}
    </LanguageContext.Provider>
  );
}
