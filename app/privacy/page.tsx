import { whatsappLink, whatsappNumber } from "@/lib/contact";
import { getStoreSnapshot } from "@/lib/storeSnapshot";
import { LegalText } from "@/components/LegalText";
import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Məxfilik Siyasəti | Horwalle",
  description: "Horwalle-də fərdi məlumatların qorunması, çərəzlər və məxfilik siyasəti.",
  alternates: {
    canonical: "https://www.horwalle.com/privacy",
  },
};

export default async function PrivacyPage() {
  const snapshot = await getStoreSnapshot();
  const custom = String(snapshot.content?.policies?.privacy || "").trim();
  if (custom) return <LegalText title="Məxfilik Siyasəti" text={custom} />;
  const supportLink = whatsappLink(whatsappNumber(snapshot.settings));
  return (
    <div className="min-h-screen bg-[#090707] text-stone-200 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#E6C280] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Ana Səhifəyə Qayıt
        </Link>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6C280]/10 text-[#E6C280] text-xs font-semibold mb-4 border border-[#E6C280]/20">
            <ShieldCheck size={14} />
            Məlumatların Qorunması & Təhlükəsizlik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Məxfilik Siyasəti
          </h1>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Son yenilənmə tarixi: <span className="text-[#E6C280]">Noyabr 2026</span>. Horwalle olaraq fərdi məlumatlarınızın toxunulmazlığına və məxfiliyinə ən yüksək səviyyədə zəmanət veririk.
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-stone-300">
          {/* Section 1 */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Eye className="text-[#E6C280]" size={20} />
              <h2 className="text-xl font-serif font-bold">1. Hansı Məlumatları Toplayırıq?</h2>
            </div>
            <p className="mb-4 text-stone-400">
              Sifarişlərinizi vaxtında hazırlamaq və ünvana çatdırmaq üçün aşağıdakı məlumatları toplayırıq:
            </p>
            <ul className="list-disc list-inside space-y-2 text-stone-300">
              <li><strong className="text-white">Şəxsi məlumatlar:</strong> Ad, soyad, əlaqə nömrəsi, çatdırılma ünvanı.</li>
              <li><strong className="text-white">Ölçü məlumatları:</strong> Düzgün ölçü seçmək üçün könüllü təqdim etdiyiniz boy və çəki.</li>
              <li><strong className="text-white">3D Studiya dizaynları:</strong> Köynək və digər geyimlərə köçürmək üçün yüklədiyiniz fərdi loqo və qrafik təsvirlər.</li>
              <li><strong className="text-white">Texniki məlumatlar:</strong> Cihaz növü, IP ünvanı və saytdakı istifadə təcrübəsini yaxşılaşdıran anonim naviqasiya məlumatları.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Lock className="text-[#E6C280]" size={20} />
              <h2 className="text-xl font-serif font-bold">2. Ödəniş Məlumatlarının Təhlükəsizliyi</h2>
            </div>
            <p className="mb-3 text-stone-400">
              Horvvalle heç bir halda bank kartınızın 16 rəqəmli nömrəsini, CVV/CVC kodunu və ya PİN kodunu serverlərində <strong className="text-white">SAXLAMIR</strong>.
            </p>
            <p className="text-stone-400">
              Bütün onlayn əməliyyatlar beynəlxalq PCI-DSS təhlükəsizlik standartına malik rəsmi bank şlüzləri, Apple Pay və Google Pay protokolları vasitəsilə 256-bit SSL şifrələmə ilə birbaşa həyata keçirilir.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <FileText className="text-[#E6C280]" size={20} />
              <h2 className="text-xl font-serif font-bold">3. Məlumatların Üçüncü Tərəflərlə Paylaşılması</h2>
            </div>
            <p className="mb-3 text-stone-400">
              Sizin məlumatlarınız heç bir reklam şirkətinə satılmır və icarəyə verilmir. Məlumatlar yalnız sifarişin icrası üçün zəruri olan tərəfdaşlarla paylaşılır:
            </p>
            <ul className="list-disc list-inside space-y-2 text-stone-300">
              <li>Sifarişinizi ünvanınıza çatdıran rəsmi kuryer xidmətləri (yalnız ad, nömrə və ünvan).</li>
              <li>Sifariş statusunu sizə xəbər verən SMS və ya WhatsApp bildiriş sistemləri.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <HelpCircle className="text-[#E6C280]" size={20} />
              <h2 className="text-xl font-serif font-bold">4. Cookie Faylları (Cookies)</h2>
            </div>
            <p className="text-stone-400 mb-3">
              Saytımızda səbətinizin yadda saxlanması, seçdiyiniz dilin və valyutanın qorunması məqsədilə cookie fayllarından istifadə olunur. Siz istənilən vaxt brauzer nizamlamalarından cookie-ləri deaktiv edə bilərsiniz.
            </p>
          </section>

          {/* Contact Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#E6C280]/10 via-[#E6C280]/5 to-transparent border border-[#E6C280]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-serif font-bold text-lg">Məxfiliklə bağlı sualınız var?</h3>
              <p className="text-stone-400 text-xs sm:text-sm">Məlumatlarınızın silinməsi və ya dəqiqləşdirilməsi üçün birbaşa bizimlə əlaqə saxlayın.</p>
            </div>
            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#E6C280] text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors shrink-0"
            >
              WhatsApp Dəstək
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

