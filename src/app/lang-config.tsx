'use client';

import { useEffect } from "react";
import { translationConfig } from "@/lib/translation";

export default function LangConfig() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Set configuration immediately
    window.__GOOGLE_TRANSLATION_CONFIG__ = translationConfig;

    // Create a custom event to notify components that config is ready
    const event = new Event('translationConfigReady');
    window.dispatchEvent(event);
  }, []);

  return null;
}
