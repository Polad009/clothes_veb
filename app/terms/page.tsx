import { Metadata } from "next";
import { getStoreSnapshot } from "@/lib/storeSnapshot";
import { resolveShippingRates } from "@/lib/shipping";
import { LegalCustom, LegalPage, legalLang, type LegalDoc } from "@/components/store/LegalPage";

export const metadata: Metadata = {
  title: "İstifadə şərtləri · Terms of Sale",
  description: "Horwalle sifariş, ödəniş, çatdırılma (Azərbaycan və beynəlxalq), gömrük və qaytarma qaydaları.",
  alternates: {
    canonical: "https://www.horwalle.com/terms",
    languages: { az: "https://www.horwalle.com/terms?lang=az", en: "https://www.horwalle.com/terms?lang=en" },
  },
};

function doc(lang: "az" | "en", r: ReturnType<typeof resolveShippingRates>): LegalDoc {
  if (lang === "en") {
    return {
      title: "Terms of Sale",
      updated: "11 November 2026",
      intro: "These terms apply to every order placed on www.horwalle.com. By placing an order you accept them.",
      sections: [
        {
          title: "Who we are",
          body: ["Horwalle is a clothing brand based in Baku, Azerbaijan. We sell ready-made garments and garments made to your own design in our 3D Design Studio, and ship them within Azerbaijan and worldwide."],
        },
        {
          title: "Prices and payment",
          body: [
            [
              "Prices are set in Azerbaijani manat (AZN). Amounts shown in other currencies are converted at the current rate and are for guidance; your card is charged in the currency shown at checkout.",
              "Prices include Azerbaijani VAT where it applies. They do not include import duties or taxes in your country (see Customs below).",
              "You can pay by bank card online. Within Azerbaijan, payment on delivery may also be offered.",
              "Each order gets an order number. Keep it to track your order on the Track order page.",
            ],
          ],
        },
        {
          title: "Delivery in Azerbaijan",
          body: [
            [
              "Baku and Sumgayit: 1–2 business days, free of charge.",
              `Other regions: 2–4 business days. Delivery costs ${r.regionAZN} ₼, free for orders from ${r.regionFreeFromAZN} ₼.`,
            ],
          ],
        },
        {
          title: "International delivery",
          body: [
            [
              `Standard: 7–14 business days, from ${r.intlStandardAZN} ₼ ($${r.intlStandardUSD}).`,
              `Express: 2–5 business days, from ${r.intlExpressAZN} ₼ ($${r.intlExpressUSD}).`,
              "Delivery times start when the parcel leaves Baku. Made-to-design items need 2–4 extra business days to produce.",
              "Every international parcel is sent with a tracking number, which we e-mail to you.",
              "Delays caused by customs, the destination postal service or a wrong address are outside our control.",
            ],
          ],
        },
        {
          title: "Customs, duties and taxes",
          body: [
            "International orders are shipped DDU (Delivered Duty Unpaid). Import duties, VAT and handling fees charged by your country are paid by the recipient when the parcel arrives.",
            "These charges depend on your country's rules and the order value; we cannot calculate them in advance. If you refuse to pay them and the parcel is returned to us, we refund the goods minus the shipping cost both ways.",
          ],
        },
        {
          title: "Returns and exchanges",
          body: [
            [
              "Ready-made items can be returned or exchanged within 14 days of delivery, unworn, unwashed and with their tags.",
              "Within Azerbaijan we can arrange a courier pick-up. From abroad, you send the item back to us; return shipping and any customs on the return are paid by the buyer.",
              "Write to us before sending a return, with your order number, so we can confirm the address.",
              "Refunds are made to the original payment method within 10 business days after we receive the item. The original shipping cost is not refunded, unless the item was faulty or wrong.",
            ],
          ],
        },
        {
          title: "Items made to your design",
          body: [
            "Garments made in the 3D Design Studio are produced for you alone, so they cannot be returned for change of mind. If one arrives with a production fault or differs from the design you approved, we remake it or refund it at our cost.",
            "You confirm that you own, or have the right to use, every image, logo or text you upload. We may refuse a design that infringes others' rights or is offensive.",
          ],
        },
        {
          title: "Faulty or wrong items",
          body: ["If an item arrives damaged, faulty or not as ordered, write to us within 7 days of delivery with photos. We replace it or refund it, including shipping, wherever you are."],
        },
        {
          title: "Cancelling an order",
          body: ["You can cancel a ready-made order free of charge until it is shipped. A made-to-design order can be cancelled only before production starts."],
        },
        {
          title: "Governing law",
          body: ["These terms are governed by the laws of the Republic of Azerbaijan. This does not take away any rights you have under the consumer laws of your own country."],
        },
      ],
    };
  }

  return {
    title: "İstifadə şərtləri",
    updated: "11 noyabr 2026",
    intro: "Bu şərtlər www.horwalle.com saytında verilən bütün sifarişlərə aiddir. Sifariş verməklə onları qəbul etmiş olursunuz.",
    sections: [
      {
        title: "Biz kimik",
        body: ["Horwalle Bakıda yerləşən geyim brendidir. Hazır geyimlər və 3D Dizayn Studiyasında sizin dizaynınızla hazırlanan geyimlər satırıq; Azərbaycan daxilinə və bütün dünyaya göndəririk."],
      },
      {
        title: "Qiymət və ödəniş",
        body: [
          [
            "Qiymətlər Azərbaycan manatı (AZN) ilə müəyyən edilir. Digər valyutalarda göstərilən məbləğ cari məzənnə ilə hesablanır və məlumat xarakteri daşıyır; kartdan ödəniş səhifəsində göstərilən valyutada çıxılır.",
            "Qiymətlərə, tətbiq olunduğu halda, ƏDV daxildir. Başqa ölkənin idxal rüsumu və vergiləri daxil deyil (aşağıda «Gömrük» bölməsinə baxın).",
            "Ödənişi onlayn bank kartı ilə edə bilərsiniz. Azərbaycan daxilində çatdırılma zamanı ödəniş də mümkün ola bilər.",
            "Hər sifarişə nömrə verilir. Sifarişi «Sifarişi izlə» səhifəsində bu nömrə ilə izləyə bilərsiniz.",
          ],
        ],
      },
      {
        title: "Azərbaycan daxilində çatdırılma",
        body: [
          [
            "Bakı və Sumqayıt: 1–2 iş günü, pulsuz.",
            `Rayonlar: 2–4 iş günü. Çatdırılma ${r.regionAZN} ₼, ${r.regionFreeFromAZN} ₼-dan yuxarı sifarişlərdə pulsuzdur.`,
          ],
        ],
      },
      {
        title: "Beynəlxalq çatdırılma",
        body: [
          [
            `Standart: 7–14 iş günü, ${r.intlStandardAZN} ₼-dan ($${r.intlStandardUSD}).`,
            `Ekspress: 2–5 iş günü, ${r.intlExpressAZN} ₼-dan ($${r.intlExpressUSD}).`,
            "Müddət bağlama Bakıdan çıxdığı gündən hesablanır. Sizin dizaynınızla hazırlanan məhsullara əlavə 2–4 iş günü lazımdır.",
            "Hər beynəlxalq bağlama izləmə nömrəsi ilə göndərilir və nömrə sizə e-poçtla gəlir.",
            "Gömrük, təyinat ölkəsinin poçtu və ya səhv ünvan səbəbindən yaranan gecikmələr bizdən asılı deyil.",
          ],
        ],
      },
      {
        title: "Gömrük, rüsum və vergilər",
        body: [
          "Beynəlxalq sifarişlər DDU (rüsumu ödənilməmiş) şərti ilə göndərilir. Ölkənizin tələb etdiyi idxal rüsumu, ƏDV və xidmət haqları bağlama çatanda alıcı tərəfindən ödənilir.",
          "Bu məbləğlər ölkənin qaydalarından və sifarişin dəyərindən asılıdır, onları əvvəlcədən hesablaya bilmirik. Ödənişdən imtina edilsə və bağlama bizə qayıtsa, məhsulun dəyərini iki tərəfli göndərmə xərci çıxılmaqla qaytarırıq.",
        ],
      },
      {
        title: "Qaytarma və dəyişmə",
        body: [
          [
            "Hazır məhsullar çatdırılmadan sonra 14 gün ərzində, geyinilməmiş, yuyulmamış və etiketləri üzərində olmaqla qaytarıla və ya dəyişdirilə bilər.",
            "Azərbaycan daxilində məhsulu kuryerlə götürə bilərik. Xaricdən məhsulu siz göndərirsiniz; qaytarma göndərişi və onun gömrük xərci alıcıya aiddir.",
            "Göndərməzdən əvvəl sifariş nömrəsi ilə bizə yazın, ünvanı təsdiqləyək.",
            "Pul məhsul bizə çatdıqdan sonra 10 iş günü ərzində ödəniş etdiyiniz üsulla qaytarılır. İlkin çatdırılma haqqı qaytarılmır, məhsul qüsurlu və ya səhv olmadığı halda.",
          ],
        ],
      },
      {
        title: "Sizin dizaynınızla hazırlanan məhsullar",
        body: [
          "3D Dizayn Studiyasında hazırlanan geyimlər yalnız sizin üçün istehsal olunur, ona görə fikir dəyişikliyi səbəbilə qaytarılmır. Məhsulda istehsal qüsuru olarsa və ya təsdiqlədiyiniz dizayndan fərqlənərsə, öz hesabımıza yenidən hazırlayır və ya pulu qaytarırıq.",
          "Yüklədiyiniz hər şəkil, loqo və mətnin sizə məxsus olduğunu və ya istifadə hüququnuz olduğunu təsdiq edirsiniz. Başqasının hüququnu pozan və ya təhqiramiz dizaynı qəbul etməyə bilərik.",
        ],
      },
      {
        title: "Qüsurlu və ya səhv məhsul",
        body: ["Məhsul zədəli, qüsurlu və ya sifarişdən fərqli gələrsə, çatdırılmadan sonra 7 gün ərzində şəkillə bizə yazın. Harada olmağınızdan asılı olmayaraq dəyişirik və ya çatdırılma daxil pulu qaytarırıq."],
      },
      {
        title: "Sifarişin ləğvi",
        body: ["Hazır məhsul sifarişini göndərilənə qədər pulsuz ləğv edə bilərsiniz. Dizaynla hazırlanan sifariş yalnız istehsal başlamazdan əvvəl ləğv edilə bilər."],
      },
      {
        title: "Tətbiq olunan qanun",
        body: ["Bu şərtlər Azərbaycan Respublikasının qanunvericiliyi ilə tənzimlənir. Bu, öz ölkənizin istehlakçı qanunlarından irəli gələn hüquqlarınızı məhdudlaşdırmır."],
      },
    ],
  };
}

export default async function TermsPage({ searchParams }: { searchParams: { lang?: string } }) {
  const snap = await getStoreSnapshot();
  const custom = String(snap.content?.policies?.terms || "").trim();
  if (custom) return <LegalCustom title="İstifadə şərtləri" text={custom} />;
  const lang = legalLang(searchParams?.lang);
  const rates = resolveShippingRates((snap.settings as any)?.shipping);
  return <LegalPage doc={doc(lang, rates)} lang={lang} path="/terms" email={(snap.settings as any)?.contactEmail} />;
}
