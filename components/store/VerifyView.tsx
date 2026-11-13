"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, BadgeCheck, MessageCircle, ScanLine, ShieldX } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { tr, type Phrase } from "@/components/store/i18n";
import { QrScanner } from "@/components/store/QrScanner";

export type VerifyStatus = "genuine" | "warning" | "void" | "unknown" | "limited";

export interface VerifyData {
  status: VerifyStatus;
  code: string;
  serial?: string;
  color?: string;
  size?: string;
  firstScannedAt?: string | null;
  scanCount?: number;
  product?: {
    name: string;
    translations?: Record<string, { name?: string; composition?: string; care?: string }>;
    image: string;
    href: string | null;
    composition: string;
    care: string;
  } | null;
  supportNumber: string;
}

const P = {
  genuineTitle: { az: "Orijinal Horwalle məhsulu", en: "Genuine Horwalle product", ru: "Оригинальный товар Horwalle", tr: "Orijinal Horwalle ürünü" },
  genuineText: {
    az: "Bu kod bizim tərəfimizdən bu geyim üçün yaradılıb və sistemimizdə qeydiyyatdadır.",
    en: "This code was issued by us for this garment and is registered in our system.",
    ru: "Этот код выпущен нами для этой вещи и зарегистрирован в нашей системе.",
    tr: "Bu kod bu ürün için tarafımızdan oluşturuldu ve sistemimizde kayıtlı.",
  },
  warningTitle: { az: "Diqqət: kod çox yoxlanılıb", en: "Caution: code checked many times", ru: "Внимание: код проверяли много раз", tr: "Dikkat: kod çok kez kontrol edildi" },
  warningText: {
    az: "Bu kod mövcuddur, amma onu çox fərqli adam yoxlayıb. Etiket köçürülmüş ola bilər. Geyimi yeni almısınızsa, bizə yazın — yoxlayaq.",
    en: "This code exists, but many different people have checked it. The label may have been copied. If you just bought this garment new, message us and we will check.",
    ru: "Код существует, но его проверяли многие разные люди. Этикетка могла быть скопирована. Если вы только что купили вещь новой, напишите нам — мы проверим.",
    tr: "Bu kod mevcut, ancak birçok farklı kişi tarafından kontrol edildi. Etiket kopyalanmış olabilir. Ürünü yeni aldıysanız bize yazın, kontrol edelim.",
  },
  voidTitle: { az: "Bu kod ləğv edilib", en: "This code has been cancelled", ru: "Этот код аннулирован", tr: "Bu kod iptal edildi" },
  voidText: {
    az: "Bu kod artıq etibarlı deyil. Geyimi haradan aldığınızı bizə yazın.",
    en: "This code is no longer valid. Please tell us where you bought the garment.",
    ru: "Этот код больше не действителен. Сообщите нам, где вы купили вещь.",
    tr: "Bu kod artık geçerli değil. Ürünü nereden aldığınızı bize yazın.",
  },
  unknownTitle: { az: "Kod tapılmadı", en: "Code not found", ru: "Код не найден", tr: "Kod bulunamadı" },
  unknownText: {
    az: "Bu kod bizim sistemdə yoxdur. Məhsul saxta ola bilər. Kodu düzgün yazdığınızı yoxlayın və ya bizə bildirin.",
    en: "This code is not in our system. The product may be counterfeit. Check that the code is typed correctly, or let us know.",
    ru: "Этого кода нет в нашей системе. Товар может быть поддельным. Проверьте код или сообщите нам.",
    tr: "Bu kod sistemimizde yok. Ürün sahte olabilir. Kodu doğru yazdığınızı kontrol edin veya bize bildirin.",
  },
  limitedTitle: { az: "Çox sorğu", en: "Too many requests", ru: "Слишком много запросов", tr: "Çok fazla istek" },
  limitedText: {
    az: "Bir neçə dəqiqədən sonra yenidən yoxlayın.",
    en: "Please try again in a few minutes.",
    ru: "Попробуйте снова через несколько минут.",
    tr: "Birkaç dakika sonra tekrar deneyin.",
  },
  serial: { az: "Seriya nömrəsi", en: "Serial number", ru: "Серийный номер", tr: "Seri numarası" },
  variant: { az: "Rəng / ölçü", en: "Colour / size", ru: "Цвет / размер", tr: "Renk / beden" },
  firstCheck: { az: "İlk yoxlama", en: "First checked", ru: "Первая проверка", tr: "İlk kontrol" },
  checks: { az: "Yoxlama sayı", en: "Times checked", ru: "Проверок", tr: "Kontrol sayısı" },
  composition: { az: "Tərkib", en: "Composition", ru: "Состав", tr: "İçerik" },
  care: { az: "Qulluq", en: "Care", ru: "Уход", tr: "Bakım" },
  viewProduct: { az: "Məhsula bax və al", en: "View & buy", ru: "Смотреть и купить", tr: "Ürünü gör ve al" },
  report: { az: "Bizə bildir", en: "Contact us", ru: "Написать нам", tr: "Bize bildir" },
  shop: { az: "Mağazaya keç", en: "Go to shop", ru: "В магазин", tr: "Mağazaya git" },
  enterTitle: { az: "Məhsulun orijinallığını yoxla", en: "Check if your product is genuine", ru: "Проверьте подлинность товара", tr: "Ürünün orijinalliğini kontrol et" },
  enterText: {
    az: "Etiketdəki QR kodu telefon kamerası ilə oxudun və ya QR-ın altındakı kodu buraya yazın.",
    en: "Scan the QR code on the label with your phone camera, or type the code printed under it.",
    ru: "Отсканируйте QR-код на этикетке камерой телефона или введите код под ним.",
    tr: "Etiketteki QR kodu telefon kamerasıyla okutun veya altındaki kodu buraya yazın.",
  },
  check: { az: "Yoxla", en: "Check", ru: "Проверить", tr: "Kontrol et" },
  or: { az: "və ya kodu yazın", en: "or type the code", ru: "или введите код", tr: "veya kodu yazın" },
  codeLabel: { az: "Kod (26 simvol)", en: "Code (26 characters)", ru: "Код (26 символов)", tr: "Kod (26 karakter)" },
} satisfies Record<string, Phrase>;

const TONE = {
  genuine: { icon: BadgeCheck, ring: "border-emerald-400/40 bg-emerald-400/10", text: "text-emerald-300", title: P.genuineTitle, body: P.genuineText },
  warning: { icon: AlertTriangle, ring: "border-amber-400/40 bg-amber-400/10", text: "text-amber-300", title: P.warningTitle, body: P.warningText },
  void: { icon: ShieldX, ring: "border-red-400/40 bg-red-400/10", text: "text-red-300", title: P.voidTitle, body: P.voidText },
  unknown: { icon: ShieldX, ring: "border-red-400/40 bg-red-400/10", text: "text-red-300", title: P.unknownTitle, body: P.unknownText },
  limited: { icon: AlertTriangle, ring: "border-white/20 bg-white/5", text: "text-bone", title: P.limitedTitle, body: P.limitedText },
} as const;

function whatsapp(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

// Browsers often lack Azerbaijani month names ("2026 M11 13"), so they are spelled out here.
const AZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];

function formatDate(iso: string, lang: string) {
  const locale = { en: "en-GB", ru: "ru-RU", tr: "tr-TR" }[lang];
  try {
    if (!locale) {
      const [y, m, d] = new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Baku" }).split("-").map(Number);
      return `${d} ${AZ_MONTHS[m - 1]} ${y}`;
    }
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Baku" });
  } catch {
    return iso.slice(0, 10);
  }
}

export function VerifyResult({ data }: { data: VerifyData }) {
  const { language: lang } = useLanguage();
  const tone = TONE[data.status];
  const Icon = tone.icon;
  const p = data.product;
  const local = p?.translations?.[lang];
  const name = local?.name || p?.name || "";
  const composition = local?.composition || p?.composition || "";
  const care = local?.care || p?.care || "";
  const reportText = `${tr(lang, P.report)} — ${data.serial || data.code}`;
  const showProduct = (data.status === "genuine" || data.status === "warning") && p;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16 pt-10 font-grotesk text-bone sm:pt-16">
      <div className={`rounded-2xl border p-5 ${tone.ring}`} role="status">
        <div className="flex items-start gap-3">
          <Icon className={`mt-0.5 h-7 w-7 shrink-0 ${tone.text}`} aria-hidden />
          <div>
            <h1 className={`text-xl font-black uppercase tracking-tight [font-stretch:110%] ${tone.text}`}>{tr(lang, tone.title)}</h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-bone-dim">{tr(lang, tone.body)}</p>
          </div>
        </div>
      </div>

      {showProduct && p && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {p.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={name} className="aspect-[4/5] w-full object-cover" />
          )}
          <div className="p-5">
            <h2 className="text-lg font-extrabold uppercase tracking-tight">{name}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
              {data.serial && (
                <div className="col-span-2">
                  <dt className="text-bone-dim">{tr(lang, P.serial)}</dt>
                  <dd className="font-mono text-[14px]">{data.serial}</dd>
                </div>
              )}
              {(data.color || data.size) && (
                <div>
                  <dt className="text-bone-dim">{tr(lang, P.variant)}</dt>
                  <dd>{[data.color, data.size].filter(Boolean).join(" / ")}</dd>
                </div>
              )}
              {data.firstScannedAt && (
                <div>
                  <dt className="text-bone-dim">{tr(lang, P.firstCheck)}</dt>
                  <dd>{formatDate(data.firstScannedAt, lang)}</dd>
                </div>
              )}
              {composition && (
                <div className="col-span-2">
                  <dt className="text-bone-dim">{tr(lang, P.composition)}</dt>
                  <dd>{composition}</dd>
                </div>
              )}
              {care && (
                <div className="col-span-2">
                  <dt className="text-bone-dim">{tr(lang, P.care)}</dt>
                  <dd>{care}</dd>
                </div>
              )}
            </dl>
            {p.href && (
              <Link
                href={p.href}
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-bone px-6 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white"
              >
                {tr(lang, P.viewProduct)} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {data.status !== "genuine" && data.status !== "limited" && (
          <a
            href={whatsapp(data.supportNumber, reportText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.16em] hover:border-bone"
          >
            <MessageCircle className="h-4 w-4" aria-hidden /> {tr(lang, P.report)}
          </a>
        )}
        <Link href="/collections" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.16em] hover:border-bone">
          {tr(lang, P.shop)}
        </Link>
      </div>

      {(data.status === "unknown" || data.status === "limited") && <CodeEntry initial={data.code} />}
    </div>
  );
}

/** Manual entry for a damaged or unreadable QR. */
export function CodeEntry({ initial = "", standalone = false }: { initial?: string; standalone?: boolean }) {
  const { language: lang } = useLanguage();
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const form = (
    <form
      className="mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (clean) router.push(`/v/${clean}`);
      }}
    >
      <label htmlFor="hw-code" className="block text-[12px] uppercase tracking-[0.14em] text-bone-dim">
        {tr(lang, P.codeLabel)}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="hw-code"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={40}
          className="min-w-0 flex-1 rounded-full border border-white/20 bg-transparent px-4 py-3 font-mono text-[14px] uppercase tracking-wider text-bone outline-none focus:border-bone"
        />
        <button type="submit" disabled={!clean} className="rounded-full bg-bone px-6 text-[12px] font-extrabold uppercase tracking-[0.14em] text-ink disabled:opacity-40">
          {tr(lang, P.check)}
        </button>
      </div>
    </form>
  );

  if (!standalone) return form;
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16 pt-12 font-grotesk text-bone sm:pt-20">
      <ScanLine className="h-10 w-10 text-bone-dim" aria-hidden />
      <h1 className="mt-4 text-3xl font-black uppercase tracking-tight [font-stretch:112%]">{tr(lang, P.enterTitle)}</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-bone-dim">{tr(lang, P.enterText)}</p>
      <div className="mt-8">
        <QrScanner onCode={(code) => router.push(`/v/${code}`)} />
      </div>
      <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-bone-dim" aria-hidden>
        <span className="h-px flex-1 bg-white/15" /> {tr(lang, P.or)} <span className="h-px flex-1 bg-white/15" />
      </div>
      {form}
    </div>
  );
}
