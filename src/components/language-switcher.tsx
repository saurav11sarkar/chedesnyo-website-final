'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { parseCookies, setCookie } from 'nookies';
import { isClient } from '@/lib/utils/client-utils';

type GoogleTranslationConfig = {
  defaultLanguage: string;
  languages: { name: string; title: string }[];
};

declare global {
  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__?: GoogleTranslationConfig;
  }
}

const COOKIE_NAME = 'googtrans';

const LanguageSwitcherComponent = () => {
  const [currentLang, setCurrentLang] = useState('nl');
  const [config, setConfig] = useState<GoogleTranslationConfig | null>(null);

  useEffect(() => {
    if (!isClient) return;

    // Function to handle configuration
    const handleConfig = () => {
      const translationConfig = window.__GOOGLE_TRANSLATION_CONFIG__;
      if (!translationConfig) return;

      setConfig(translationConfig);
      const cookie = parseCookies()[COOKIE_NAME];
      const lang = cookie?.split('/')?.[2] || translationConfig.defaultLanguage;
      setCurrentLang(lang);
    };

    // Check if config already exists
    if (window.__GOOGLE_TRANSLATION_CONFIG__) {
      handleConfig();
    }

    // Listen for config ready event
    window.addEventListener('translationConfigReady', handleConfig);
    
    return () => {
      window.removeEventListener('translationConfigReady', handleConfig);
    };
  }, []);

  const switchLang = (lang: string) => {
    setCookie(undefined, COOKIE_NAME, `/auto/${lang}`, { path: '/' });
    if (isClient) {
      window.location.reload();
    }
  };

  if (!config) {
    return <div className="text-center p-2 text-xs text-gray-400">Laden...</div>;
  }

  return (
    <div className="flex justify-center gap-3 p-3 flex-wrap bg-white border-t">
      {config.languages.map((l) => (
        <button
          key={l.name}
          onClick={() => switchLang(l.name)}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
            currentLang === l.name
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {l.title}
        </button>
      ))}
    </div>
  );
};

const LanguageSwitcher = dynamic(() => Promise.resolve(LanguageSwitcherComponent), { 
  ssr: false 
});

export default LanguageSwitcher;