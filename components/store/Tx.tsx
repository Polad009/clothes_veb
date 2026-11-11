"use client";

import { useLanguage } from "@/context/LanguageContext";
import { tr, type Phrase } from "@/components/store/i18n";

/** Text in the visitor's language, for pages rendered on the server. */
export function Tx({ p }: { p: Phrase }) {
  const { language } = useLanguage();
  return <>{tr(language, p)}</>;
}
