import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";

export type LegalLang = "az" | "en";
export type LegalSection = { title: string; body: (string | string[])[] };
export type LegalDoc = { title: string; intro: string; updated: string; sections: LegalSection[] };

/** Azerbaijani for AZ visitors, English for everyone else; ?lang= overrides. */
export function legalLang(param?: string | string[]): LegalLang {
  const p = Array.isArray(param) ? param[0] : param;
  if (p === "az" || p === "en") return p;
  const saved = cookies().get("horvvalle_user_language_v1")?.value;
  return saved === "az" || !saved ? "az" : "en";
}

const UI = {
  az: { back: "Ana səhifə", updated: "Son yenilənmə", other: "English", contact: "Sualınız var?", write: "Bizə yazın" },
  en: { back: "Home", updated: "Last updated", other: "Azərbaycanca", contact: "Questions?", write: "Contact us" },
};

/** Shared layout of the terms and privacy pages. Plain text only, nothing is read as HTML. */
export function LegalPage({ doc, lang, path, email }: { doc: LegalDoc; lang: LegalLang; path: string; email?: string }) {
  const ui = UI[lang];
  return (
    <div className="min-h-screen bg-ink px-4 pb-24 pt-10 font-grotesk text-bone sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.18em] text-bone-dim">
          <Link href="/" className="transition-colors hover:text-bone">← {ui.back}</Link>
          <Link href={`${path}?lang=${lang === "az" ? "en" : "az"}`} hrefLang={lang === "az" ? "en" : "az"} className="rounded-full border border-white/15 px-3 py-1.5 transition-colors hover:border-bone hover:text-bone">
            {ui.other}
          </Link>
        </div>

        <header className="border-b border-white/10 pb-8">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">{doc.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-bone-dim sm:text-base">{doc.intro}</p>
          <p className="mt-4 text-xs text-bone-faint">{ui.updated}: {doc.updated}</p>
        </header>

        <div className="divide-y divide-white/10">
          {doc.sections.map((s, i) => (
            <section key={i} className="py-8">
              <h2 className="mb-4 text-lg font-bold sm:text-xl">
                <span className="mr-2 text-bone-faint">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-bone-dim sm:text-[15px]">
                {s.body.map((b, j) =>
                  Array.isArray(b) ? (
                    <ul key={j} className="space-y-2 pl-4">
                      {b.map((li, k) => (
                        <li key={k} className="relative before:absolute before:-left-4 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-bone-faint">{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{b}</p>
                  )
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-ink-850 p-6 sm:flex-row sm:items-center">
          <p className="text-sm text-bone-dim">{ui.contact}</p>
          <a href={`mailto:${email || "info@horwalle.com"}`} className="rounded-full bg-bone px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:bg-white">
            {ui.write}
          </a>
        </footer>
      </article>
    </div>
  );
}

/** Admin-written text (Admin → Tənzimləmələr): blank lines split paragraphs, "## " starts a heading. */
export function LegalCustom({ title, text }: { title: string; text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="min-h-screen bg-ink px-4 pb-24 pt-10 font-grotesk text-bone sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="mb-10 inline-block text-xs uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-bone">← Ana səhifə</Link>
        <h1 className="border-b border-white/10 pb-8 text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">{title}</h1>
        <div className="space-y-4 pt-8 text-sm leading-relaxed text-bone-dim sm:text-[15px]">
          {blocks.map((b, i) =>
            b.startsWith("## ") ? (
              <h2 key={i} className="pt-4 text-lg font-bold text-bone sm:text-xl">{b.slice(3).trim()}</h2>
            ) : (
              <p key={i} className="whitespace-pre-line">{b}</p>
            )
          )}
        </div>
      </article>
    </div>
  );
}
