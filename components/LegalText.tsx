import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Renders a legal page written in the admin panel. The text is plain:
 * blank lines separate paragraphs and a line starting with "## " is a heading.
 * Nothing is interpreted as HTML.
 */
export function LegalText({ title, text }: { title: string; text: string }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#090707] px-4 pb-20 pt-28 text-stone-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#E6C280] transition-colors hover:text-white">
          <ArrowLeft size={14} />
          Ana Səhifəyə Qayıt
        </Link>
        <h1 className="mb-10 border-b border-white/10 pb-8 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
        <div className="space-y-5 text-sm leading-relaxed text-stone-300 sm:text-base">
          {blocks.map((block, i) =>
            block.startsWith("## ") ? (
              <h2 key={i} className="pt-4 font-serif text-xl font-bold text-white">{block.slice(3).trim()}</h2>
            ) : (
              <p key={i} className="whitespace-pre-line text-stone-400">{block}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
