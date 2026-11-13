"use client";

import React from "react";
import { tr } from "@/components/store/i18n";
import { CONCENTRATIONS, FAMILIES, LONGEVITY, noteList, type PerfumeInfo } from "@/lib/perfume";

const P = {
  profile: { az: "Qoxu profili", en: "Scent profile", ru: "Профиль аромата", tr: "Koku profili" },
  top: { az: "Üst notlar", en: "Top notes", ru: "Верхние ноты", tr: "Üst notalar" },
  heart: { az: "Orta notlar", en: "Heart notes", ru: "Ноты сердца", tr: "Orta notalar" },
  base: { az: "Baza notlar", en: "Base notes", ru: "Базовые ноты", tr: "Alt notalar" },
  topHint: { az: "ilk dəqiqələr", en: "first minutes", ru: "первые минуты", tr: "ilk dakikalar" },
  heartHint: { az: "1–3 saat", en: "1–3 hours", ru: "1–3 часа", tr: "1–3 saat" },
  baseHint: { az: "gün boyu qalan iz", en: "the trail that lasts", ru: "шлейф на весь день", tr: "gün boyu kalan iz" },
  longevity: { az: "Davamlılıq", en: "Longevity", ru: "Стойкость", tr: "Kalıcılık" },
};

/** Concentration, scent families, longevity and the top/heart/base note pyramid. */
export function PerfumeProfile({ info, lang }: { info: PerfumeInfo; lang: string }) {
  const tiers = (
    [
      ["top", P.top, P.topHint],
      ["heart", P.heart, P.heartHint],
      ["base", P.base, P.baseHint],
    ] as const
  )
    .map(([key, title, hint]) => ({ key, title, hint, notes: noteList(info.notes[key]) }))
    .filter((t) => t.notes.length > 0);
  const conc = info.concentration ? CONCENTRATIONS[info.concentration] : null;

  if (!conc && !info.families.length && !tiers.length && !info.longevity) return null;

  return (
    <section className="mt-8 border border-white/10 p-5" aria-label={tr(lang, P.profile)}>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-dim">{tr(lang, P.profile)}</p>

      {(conc || info.families.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {conc && (
            <span className="border border-bone/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" title={tr(lang, conc.hint)}>
              {tr(lang, conc.label)}
            </span>
          )}
          {info.families.map((f) => (
            <span key={f} className="bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-bone-dim">
              {tr(lang, FAMILIES[f])}
            </span>
          ))}
        </div>
      )}
      {conc && <p className="mt-2 text-[12px] text-bone-faint">{tr(lang, conc.hint)}</p>}

      {tiers.length > 0 && (
        <ol className="mt-5 space-y-4">
          {tiers.map((t, i) => (
            <li key={t.key} className="grid grid-cols-[2.25rem_1fr] gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-white/20 text-[12px] font-black tabular-nums" aria-hidden>
                {i + 1}
              </span>
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-[0.14em]">
                  {tr(lang, t.title)} <span className="font-normal normal-case tracking-normal text-bone-faint">· {tr(lang, t.hint)}</span>
                </p>
                <p className="mt-1 text-[14px] text-bone-dim">{t.notes.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {info.longevity && (
        <p className="mt-5 border-t border-white/10 pt-4 text-[13px] text-bone-dim">
          <strong className="text-bone">{tr(lang, P.longevity)}:</strong> {tr(lang, LONGEVITY[info.longevity])}
        </p>
      )}
    </section>
  );
}
