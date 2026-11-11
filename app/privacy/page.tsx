import { Metadata } from "next";
import { getStoreSnapshot } from "@/lib/storeSnapshot";
import { LegalCustom, LegalPage, legalLang, type LegalDoc } from "@/components/store/LegalPage";
import { PRIVACY_RU, PRIVACY_TR } from "./docs-ru-tr";

export const metadata: Metadata = {
  title: "Məxfilik siyasəti · Privacy Policy",
  description: "Horwalle hansı məlumatları toplayır, nə üçün istifadə edir və kimlərlə paylaşır.",
  alternates: {
    canonical: "https://www.horwalle.com/privacy",
    languages: { az: "https://www.horwalle.com/privacy?lang=az", en: "https://www.horwalle.com/privacy?lang=en", ru: "https://www.horwalle.com/privacy?lang=ru", tr: "https://www.horwalle.com/privacy?lang=tr" },
  },
};

const EN: LegalDoc = {
  title: "Privacy Policy",
  updated: "11 November 2026",
  intro: "This policy explains what personal data Horwalle collects when you use www.horwalle.com, why, and what you can do about it.",
  sections: [
    {
      title: "What we collect",
      body: [
        [
          "Order details: name, phone number, e-mail, delivery address and country.",
          "Account details, if you create an account: e-mail and order history.",
          "Designs you upload in the 3D Design Studio: images, logos and text.",
          "Messages you send us through live chat, WhatsApp or e-mail.",
          "Technical data: device and browser type, IP address and approximate country (used to show prices and delivery in your currency), and pages visited.",
        ],
      ],
    },
    {
      title: "Card payments",
      body: ["Card details are entered on our payment provider's secure page. We never see or store your full card number."],
    },
    {
      title: "Why we use it",
      body: [
        [
          "To make, ship and track your order, and to tell you about its status.",
          "To produce garments with your design.",
          "To answer your questions and handle returns.",
          "To keep the site secure and to understand, in aggregate, how it is used.",
          "To send offers by e-mail only if you agreed to it; every e-mail has an unsubscribe link.",
        ],
      ],
    },
    {
      title: "Who we share it with",
      body: [
        "Only with the services needed to complete your order, and only what they need:",
        [
          "Couriers and international carriers (name, phone, address).",
          "Customs authorities of the destination country, through the carrier, for international parcels.",
          "Our payment provider (payment amount and order number).",
          "Our hosting, database and e-mail providers, which store data on our behalf.",
        ],
        "We do not sell your data.",
      ],
    },
    {
      title: "International transfers",
      body: ["Some of these providers store data outside Azerbaijan (for example in the EU or the USA). We use providers that protect data under recognised standards."],
    },
    {
      title: "Cookies and analytics",
      body: ["We use necessary cookies (bag, language, currency, sign-in) and, only with your consent, analytics cookies (Google Analytics) to count visits. You can change your choice at any time by clearing cookies for this site."],
    },
    {
      title: "How long we keep it",
      body: ["Order records are kept as long as accounting law requires. Uploaded designs and chat messages are deleted when no longer needed for your order or support. You can ask us to delete your account at any time."],
    },
    {
      title: "Your rights",
      body: ["You can ask to see, correct or delete your personal data, or object to its use. If you are in the EU or UK, you also have rights under the GDPR, including complaining to your local data protection authority. Write to us and we will reply within 30 days."],
    },
  ],
};

const AZ: LegalDoc = {
  title: "Məxfilik siyasəti",
  updated: "11 noyabr 2026",
  intro: "Bu siyasət www.horwalle.com saytından istifadə edərkən Horwalle-in hansı şəxsi məlumatları topladığını, nə üçün istifadə etdiyini və sizin hüquqlarınızı izah edir.",
  sections: [
    {
      title: "Nə toplayırıq",
      body: [
        [
          "Sifariş məlumatları: ad, telefon nömrəsi, e-poçt, çatdırılma ünvanı və ölkə.",
          "Hesab açsanız: e-poçt və sifariş tarixçəsi.",
          "3D Dizayn Studiyasında yüklədiyiniz şəkil, loqo və mətnlər.",
          "Canlı çat, WhatsApp və ya e-poçtla göndərdiyiniz mesajlar.",
          "Texniki məlumatlar: cihaz və brauzer növü, IP ünvanı və təxmini ölkə (qiymət və çatdırılmanı sizin valyutanızda göstərmək üçün), baxılan səhifələr.",
        ],
      ],
    },
    {
      title: "Kartla ödəniş",
      body: ["Kart məlumatları ödəniş xidmətinin təhlükəsiz səhifəsində daxil edilir. Kartın tam nömrəsini biz görmürük və saxlamırıq."],
    },
    {
      title: "Nə üçün istifadə edirik",
      body: [
        [
          "Sifarişinizi hazırlamaq, göndərmək, izləmək və statusu barədə sizə xəbər vermək üçün.",
          "Sizin dizaynınızla geyim hazırlamaq üçün.",
          "Suallarınıza cavab vermək və qaytarmaları həll etmək üçün.",
          "Saytın təhlükəsizliyi və ümumi istifadə statistikası üçün.",
          "Təklifləri e-poçtla yalnız razılıq verdiyiniz halda göndəririk; hər məktubda abunəlikdən çıxmaq linki var.",
        ],
      ],
    },
    {
      title: "Kimlərlə paylaşırıq",
      body: [
        "Yalnız sifarişi yerinə yetirmək üçün lazım olan xidmətlərlə və yalnız lazım olan qədər:",
        [
          "Kuryer və beynəlxalq daşıyıcılar (ad, telefon, ünvan).",
          "Beynəlxalq bağlamalar üçün, daşıyıcı vasitəsilə, təyinat ölkəsinin gömrük orqanları.",
          "Ödəniş xidməti (məbləğ və sifariş nömrəsi).",
          "Məlumatları bizim adımıza saxlayan hostinq, verilənlər bazası və e-poçt xidmətləri.",
        ],
        "Məlumatlarınızı satmırıq.",
      ],
    },
    {
      title: "Məlumatların xaricə ötürülməsi",
      body: ["Bu xidmətlərin bəziləri məlumatları Azərbaycandan kənarda (məsələn, Aİ və ya ABŞ-da) saxlayır. Tanınmış standartlarla məlumatı qoruyan xidmətlərdən istifadə edirik."],
    },
    {
      title: "Çərəzlər və analitika",
      body: ["Zəruri çərəzlərdən (səbət, dil, valyuta, giriş) və yalnız razılığınızla ziyarətləri saymaq üçün analitika çərəzlərindən (Google Analytics) istifadə edirik. Seçiminizi istənilən vaxt bu sayt üçün çərəzləri silməklə dəyişə bilərsiniz."],
    },
    {
      title: "Nə qədər saxlayırıq",
      body: ["Sifariş qeydləri mühasibat qanunvericiliyinin tələb etdiyi müddətdə saxlanılır. Yüklənən dizaynlar və çat mesajları sifariş və ya dəstək üçün lazım olmadıqda silinir. Hesabınızın silinməsini istənilən vaxt istəyə bilərsiniz."],
    },
    {
      title: "Hüquqlarınız",
      body: ["Şəxsi məlumatlarınızı görmək, düzəltmək və ya silmək, həmçinin istifadəsinə etiraz etmək hüququnuz var. Aİ və ya Böyük Britaniyadasınızsa, GDPR üzrə hüquqlarınız, o cümlədən yerli məlumat qoruma orqanına şikayət hüququnuz da var. Bizə yazın, 30 gün ərzində cavab veririk."],
    },
  ],
};

export default async function PrivacyPage({ searchParams }: { searchParams: { lang?: string } }) {
  const snap = await getStoreSnapshot();
  const custom = String(snap.content?.policies?.privacy || "").trim();
  if (custom) return <LegalCustom title="Məxfilik siyasəti" text={custom} />;
  const lang = legalLang(searchParams?.lang);
  return <LegalPage doc={({ az: AZ, en: EN, ru: PRIVACY_RU, tr: PRIVACY_TR } as Record<string, LegalDoc>)[lang]} lang={lang} path="/privacy" email={(snap.settings as any)?.contactEmail} />;
}
