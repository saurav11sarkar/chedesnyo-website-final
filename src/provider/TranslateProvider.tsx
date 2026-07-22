/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';

const TranslateProvider = dynamic(
  () => Promise.resolve(() => {
    if (typeof window === 'undefined') return null;

    const initTranslate = () => {
      const el = document.getElementById('google_translate_element');
      if (!el || !(window as any).__GOOGLE_TRANSLATION_CONFIG__) return;

      el.innerHTML = '';
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: (window as any).__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    (window as any).TranslateInit = initTranslate;

    const check = setInterval(() => {
      if ((window as any).google?.translate?.TranslateElement) {
        initTranslate();
        clearInterval(check);
      }
    }, 100);

    setTimeout(() => clearInterval(check), 5000);

    return null;
  }),
  { ssr: false }
);

export default TranslateProvider;
