"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

interface FAQItem {
  id: string;
  q: { az: string; en: string; ru: string; tr: string };
  a: { az: string; en: string; ru: string; tr: string };
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "delivery",
    q: {
      az: "Sifarişlərin çatdırılması neçə gün çəkir və ödənişlidirmi?",
      en: "How long does delivery take and is it free?",
      ru: "Сколько длится доставка и бесплатна ли она?",
      tr: "Teslimat kaç gün sürer ve kargo ücretsiz mi?",
    },
    a: {
      az: "Bakı şəhəri daxilində çatdırılma tamamilə PULSUZDUR və 24 saat ərzində həyata keçirilir. Azərbaycanın bütün regionlarına isə 2-3 iş günü ərzində operativ poçt/kuryer xidməti ilə çatdırılır.",
      en: "Delivery within Baku is completely FREE and fulfilled within 24 hours. Delivery across all regions takes 2-3 business days via courier/postal service.",
      ru: "Доставка по Баку абсолютно БЕСПЛАТНАЯ и выполняется в течение 24 часов. Доставка во все регионы занимает 2-3 рабочих дня.",
      tr: "Bakü içi teslimat tamamen ÜCRETSİZDİR ve 24 saat içinde gerçekleştirilir. Tüm bölgelere ise 2-3 iş günü içinde ulaştırılır.",
    },
  },
  {
    id: "sizing",
    q: {
      az: "Bədən ölçümü necə dəqiq seçə bilərəm?",
      en: "How can I choose the exact right size?",
      ru: "Как правильно подобрать размер?",
      tr: "Bedenimi nasıl doğru seçebilirim?",
    },
    a: {
      az: "Hər bir məhsul səhifəsində dəqiq santimetrlərlə ölçü cədvəli qeyd olunub. Əlavə olaraq Horvvalle atelye xidməti sayəsində sifariş zamanı boy və çəkinizi qeyd edərək geyimin bədəninizə tam oturmasını sifariş edə bilərsiniz.",
      en: "Each product page contains an exact measurement chart. Furthermore, our atelier allows you to input your height and weight at checkout for tailored fitting.",
      ru: "На странице каждого товара указана точная таблица размеров. Кроме того, наше ателье позволяет указать ваш рост и вес для идеальной индивидуальной посадки.",
      tr: "Her ürün sayfasında detaylı beden tablosu mevcuttur. Ayrıca atölyemiz sayesinde sipariş verirken boy ve kilonuzu belirterek özel kesim talep edebilirsiniz.",
    },
  },
  {
    id: "studio-print",
    q: {
      az: "3D Studiyada hazırladığım dizayn paltara necə çap olunur?",
      en: "How is my 3D Studio custom design printed on the garment?",
      ru: "Как наносится принт, созданный в 3D студии?",
      tr: "3D Stüdyoda hazırladığım tasarım kıyafete nasıl basılır?",
    },
    a: {
      az: "3D studiyada köynəyə yerləşdirdiyiniz loqo və ya qrafika İtaliya istehsalı olan premium DTF və termo-transfer texnologiyası ilə parçaya dərindən hopdurulur. Yuyulma zamanı qətiyyən solmur, rəngini və elastikliyini itirmir.",
      en: "Your uploaded graphics or text are transferred using Italian premium DTF and thermal transfer technology. The print will not crack, fade, or lose elasticity after washing.",
      ru: "Ваш дизайн переносится с использованием премиальной итальянской DTF-технологии. Принт не трескается, не выцветает и выдерживает многократные стирки.",
      tr: "Yüklediğiniz logo veya grafik İtalyan DTF teknolojisiyle kumaşa işlenir. Yıkamada kesinlikle solmaz, çatlamaz ve elastikiyetini korur.",
    },
  },
  {
    id: "returns",
    q: {
      az: "Ölçü uyğun gəlməzsə dəyişdirmək və ya qaytarmaq mümkündürmü?",
      en: "Can I exchange or return an item if the size does not fit?",
      ru: "Можно ли обменять или вернуть товар, если размер не подошел?",
      tr: "Beden uymazsa değişim veya iade mümkün mü?",
    },
    a: {
      az: "Bəli, sifarişinizi təhvil aldığınız andan etibarən 14 gün ərzində istifadə edilmədən və etiketləri qorunmaqla asanlıqla ölçünü dəyişdirə və ya məbləği tam geri ala bilərsiniz.",
      en: "Yes, you can easily exchange the size or request a full refund within 14 days of delivery, provided the tags are intact and the garment is unworn.",
      ru: "Да, вы можете легко обменять размер или оформить возврат в течение 14 дней с момента получения при сохранении бирок и первоначального вида.",
      tr: "Evet, teslim aldığınız tarihten itibaren 14 gün içinde etiketleri korunmak şartıyla kolayca değişim veya para iadesi yapabilirsiniz.",
    },
  },
  {
    id: "payments",
    q: {
      az: "Hansı ödəniş üsullarından istifadə edə bilərəm?",
      en: "Which payment methods are accepted?",
      ru: "Какие способы оплаты вы принимаете?",
      tr: "Hangi ödeme yöntemlerini kullanabilirim?",
    },
    a: {
      az: "Apple Pay, Google Pay, Visa və Mastercard bank kartları ilə 256-bit SSL təhlükəsizliklə onlayn ödəniş edə, həmçinin kuryer ünvana çatdırdıqda qapıda nağd və ya kartla ödəyə bilərsiniz.",
      en: "We accept Apple Pay, Google Pay, Visa, and Mastercard with 256-bit SSL encryption, as well as Cash-on-Delivery or mobile POS upon courier arrival.",
      ru: "Мы принимаем Apple Pay, Google Pay, Visa и Mastercard с 256-битным SSL-шифрованием, а также оплату наличными или картой при получении курьеру.",
      tr: "Apple Pay, Google Pay, Visa ve Mastercard ile güvenli online ödeme yapabilir, dilerseniz kapıda nakit veya kartla ödeyebilirsiniz.",
    },
  },
];

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("delivery");
  const { language } = useLanguage();

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  // Structured Data Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      "name": item.q.az,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a.az,
      },
    })),
  };

  return (
    <section className="py-20 bg-[#0C0A0A] border-t border-white/5 relative overflow-hidden">
      {/* Schema injection for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6C280]/10 text-[#E6C280] text-xs font-semibold uppercase tracking-widest mb-4 border border-[#E6C280]/20">
            <Sparkles size={13} />
            {language === "en" ? "Help Center" : language === "ru" ? "Частые вопросы" : language === "tr" ? "Yardım Merkezi" : "Kömək Mərkəzi"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            {language === "en" ? "Frequently Asked Questions" : language === "ru" ? "Часто задаваемые вопросы" : language === "tr" ? "Sıkça Sorulan Sorular" : "Tez-tez Verilən Suallar"}
          </h2>
          <p className="mt-3 text-stone-400 text-sm max-w-xl mx-auto">
            {language === "en"
              ? "Everything you need to know about Horvvalle atelier tailoring, delivery, and 3D studio."
              : language === "ru"
              ? "Всё, что вам нужно знать о пошиве в ателье, доставке и 3D студии."
              : language === "tr"
              ? "Horvvalle atölye kesimi, teslimat ve 3D stüdyo hakkında merak ettiğiniz her şey."
              : "Horvvalle fərdi atelye tikilişi, operativ çatdırılma və 3D studiya haqqında ən çox soruşulanlar."}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            const langKey = (["az", "en", "ru", "tr"].includes(language) ? language : "az") as "az" | "en" | "ru" | "tr";
            const questionText = item.q[langKey] || item.q.az;
            const answerText = item.a[langKey] || item.a.az;

            return (
              <div
                key={item.id}
                className="border border-white/10 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif font-medium text-base sm:text-lg text-white">
                    {questionText}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-[#E6C280] transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#E6C280]/20" : ""
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-5 text-sm sm:text-base text-stone-300 leading-relaxed border-t border-white/5 pt-3">
                        {answerText}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 text-center text-xs text-stone-400">
          {language === "en"
            ? "Still have questions? "
            : language === "ru"
            ? "Остались вопросы? "
            : language === "tr"
            ? "Başka bir sorunuz mu var? "
            : "Cavabını tapmadığınız başqa sualınız var? "}
          <a
            href="https://wa.me/994557669050"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E6C280] font-semibold underline underline-offset-4 hover:text-white transition"
          >
            {language === "en"
              ? "Contact Atelier Specialist on WhatsApp"
              : language === "ru"
              ? "Связаться со специалистом ателье в WhatsApp"
              : language === "tr"
              ? "WhatsApp ile Atölye Uzmanına Ulaşın"
              : "WhatsApp Atelye Mütəxəssisi ilə əlaqə saxlayın"}
          </a>
        </div>
      </div>
    </section>
  );
}

