"use client";

import { useEffect } from "react";
import { installGoogleTranslateDomPatch } from "@/lib/google-translate-dom";

export default function GoogleTranslatePatch() {
  useEffect(() => {
    return installGoogleTranslateDomPatch(document.body);
  }, []);

  return null;
}
