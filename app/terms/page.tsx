import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Scale, ArrowLeft, RefreshCw, Truck, CreditCard, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "İstifadə Şərtləri & Qaydalar | Horwalle Atelier",
  description: "Horwalle Atelier onlayn mağaza və atelye xidmətlərinin istifadə şərtləri, qaytarılma və çatdırılma qaydaları.",
  alternates: {
    canonical: "https://www.horwalle.com/terms",
  },
};

export default function TermsPage() {
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
            <Scale size={14} />
            Hüquqi Qaydalar & Müqavilə
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            İstifadə Şərtləri
          </h1>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Horwalle Atelier veb-saytından istifadə etməklə və ya sifariş verməklə aşağıdakı rəsmi şərtləri qəbul etmiş sayılırsınız.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-stone-300">
          {/* Section 1 */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <ShieldCheck className="text-[#E6C280]" size={20} />
              <h2 className="text-xl font-serif font-bold">1. Ümumi Müddəalar</h2>
            </div>
            <p className="mb-3 text-stone-400">
              Bu müqavilə Horwalle Atelier ilə alıcı arasında bağlanmış rəsmi elektron təklif (oferta) xarakteri daşıyır.
            </p>
            <p className="text-stone-400">
              Alıcı sayt üzərindən hazır kolleksiyadan geyim sifariş edə və ya 3D İnteraktiv Çap Studiyasından istifadə edərək fərdi dizaynlı məhsul hazırlada bilər.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <CreditCard className="text-[#E6C280]" size={20} />
              <h2 className="text-xl font-serif font-bold">2. Qiymətlər və Ödəniş Üsulları</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-stone-300">
              <li>Bütün qiymətlər rəsmi olaraq Azərbaycan Manatı (AZN) ilə göstərilir, xarici müştərilər üçün USD, EUR və digər valyutalarda ekvivalent əks olunur.</li>
              <li>Ödənişlər Visa, Mastercard, Apple Pay, Google Pay və ya kuryerlə çatdırılma zamanı qapıda nağd/POS-terminal vasitəsilə həyata keçirilir.</li>
              <li>Sifariş təsdiq edildikdən sonra müştəriyə unikal izləmə kodu (məs: <span className="text-[#E6C280] font-mono">HV-XXXX</span>) təqdim olunur.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Truck className="text-[#E6C280]" size={20} />
              <h2 className="text-xl font-serif font-bold">3. Çatdırılma Şərtləri</h2>
            </div>
            <p className="mb-3 text-stone-400">
              Bakı şəhəri daxilində çatdırılma <strong className="text-white">PULSUZDUR</strong> və 24 saat ərzində yerinə yetirilir.
            </p>
            <p className="text-stone-400">
              Azərbaycanın bütün bölgələrinə çatdırılma poçt və ya xüsusi kuryer xidməti ilə 2-3 iş günü ərzində təmin edilir.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <RefreshCw className="text-[#E6C280]" size={20} />
              <h2 className="text-xl font-serif font-bold">4. Qaytarılma və Dəyişdirilmə Qaydaları (14 Gün Zəmanət)</h2>
            </div>
            <p className="mb-3 text-stone-400">
              Müştəri məmnuniyyəti bizim prioritetimizdir. "İstehlakçıların hüquqlarının müdafiəsi haqqında" qanuna uyğun olaraq:
            </p>
            <ul className="list-disc list-inside space-y-2 text-stone-300">
              <li>Hazır kolleksiya məhsulları alındığı tarixdən etibarən <strong className="text-white">14 gün ərzində</strong> istifadə edilmədən, etiketləri zədələnmədən asanlıqla dəyişdirilə və ya qaytarıla bilər.</li>
              <li>Müştərinin sifarişi əsasında fərdi bədən ölçüləri ilə tikilmiş və ya 3D studiyada fərdi ad/loqo ilə çap edilmiş eksklüziv məhsullarda yalnız istehsal qüsuru (defekt) aşkarlandıqda ödənişsiz yenidən hazırlanır və ya qaytarılır.</li>
            </ul>
          </section>

          {/* Support button */}
          <div className="pt-4 flex justify-end">
            <Link
              href="/collections"
              className="px-6 py-3 rounded-xl bg-[#E6C280] text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors"
            >
              Kolleksiyaya Keç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

