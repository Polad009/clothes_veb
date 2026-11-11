import type { LegalDoc } from "@/components/store/LegalPage";
import type { ShippingRates } from "@/lib/shipping";

export function termsRu(r: ShippingRates): LegalDoc {
  return {
    title: "Условия продажи",
    updated: "11 ноября 2026",
    intro: "Эти условия действуют для всех заказов на www.horwalle.com. Оформляя заказ, вы их принимаете.",
    sections: [
      { title: "Кто мы", body: ["Horwalle — бренд одежды из Баку, Азербайджан. Мы продаём готовую одежду и одежду с вашим дизайном из нашей 3D дизайн-студии и доставляем её по Азербайджану и по всему миру."] },
      {
        title: "Цены и оплата",
        body: [[
          "Цены устанавливаются в азербайджанских манатах (AZN). Суммы в других валютах пересчитаны по текущему курсу и даны для ориентира; с карты списывается сумма в валюте, указанной при оформлении.",
          "Цены для покупателей за пределами Азербайджана могут отличаться; окончательная цена определяется страной доставки.",
          "Цены включают НДС Азербайджана, где он применяется. Ввозные пошлины и налоги вашей страны в цену не входят (см. «Таможня»).",
          "Оплатить можно банковской картой онлайн. В Азербайджане может быть доступна оплата при получении.",
          "Каждому заказу присваивается номер. По нему заказ можно отследить на странице «Отследить заказ».",
        ]],
      },
      { title: "Доставка по Азербайджану", body: [["Баку и Сумгаит: 1–2 рабочих дня, бесплатно.", `Регионы: 2–4 рабочих дня. Доставка ${r.regionAZN} ₼, бесплатно для заказов от ${r.regionFreeFromAZN} ₼.`]] },
      {
        title: "Международная доставка",
        body: [[
          `Стандартная: 7–14 рабочих дней, от ${r.intlStandardAZN} ₼ ($${r.intlStandardUSD}).`,
          `Экспресс: 2–5 рабочих дней, от ${r.intlExpressAZN} ₼ ($${r.intlExpressUSD}).`,
          "Срок считается с момента отправки посылки из Баку. Изделиям с вашим дизайном нужно ещё 2–4 рабочих дня на изготовление.",
          "Каждая международная посылка отправляется с трек-номером, который мы присылаем вам на e-mail.",
          "Задержки из-за таможни, почты страны назначения или неверного адреса от нас не зависят.",
        ]],
      },
      {
        title: "Таможня, пошлины и налоги",
        body: [
          "Международные заказы отправляются на условиях DDU (пошлины не оплачены). Ввозные пошлины, НДС и сборы вашей страны оплачивает получатель при получении посылки.",
          "Эти суммы зависят от правил страны и стоимости заказа, мы не можем рассчитать их заранее. Если вы откажетесь их оплатить и посылка вернётся к нам, мы вернём стоимость товара за вычетом доставки в обе стороны.",
        ],
      },
      {
        title: "Возврат и обмен",
        body: [[
          "Готовые изделия можно вернуть или обменять в течение 14 дней после получения, если они не ношены, не стираны и с бирками.",
          "По Азербайджану мы можем забрать товар курьером. Из-за рубежа вы отправляете товар сами; доставку возврата и таможенные расходы оплачивает покупатель.",
          "Перед отправкой напишите нам с номером заказа, чтобы мы подтвердили адрес.",
          "Деньги возвращаются тем же способом оплаты в течение 10 рабочих дней после получения товара. Стоимость первоначальной доставки не возвращается, если товар не был бракованным или ошибочным.",
        ]],
      },
      {
        title: "Изделия с вашим дизайном",
        body: [
          "Одежда из 3D дизайн-студии изготавливается только для вас, поэтому её нельзя вернуть, если вы передумали. Если на изделии производственный брак или оно отличается от утверждённого дизайна, мы переделаем его или вернём деньги за свой счёт.",
          "Вы подтверждаете, что вам принадлежат или вы вправе использовать все загружаемые изображения, логотипы и тексты. Мы можем отказать в дизайне, нарушающем чужие права или оскорбительном.",
        ],
      },
      { title: "Брак или ошибка в заказе", body: ["Если товар пришёл повреждённым, бракованным или не тем, напишите нам с фото в течение 7 дней после получения. Мы заменим его или вернём деньги вместе с доставкой, где бы вы ни находились."] },
      { title: "Отмена заказа", body: ["Заказ готовых изделий можно бесплатно отменить до отправки. Заказ с вашим дизайном можно отменить только до начала производства."] },
      { title: "Применимое право", body: ["Эти условия регулируются законодательством Азербайджанской Республики. Это не ограничивает ваши права по законам о защите потребителей вашей страны."] },
    ],
  };
}

export function termsTr(r: ShippingRates): LegalDoc {
  return {
    title: "Satış koşulları",
    updated: "11 Kasım 2026",
    intro: "Bu koşullar www.horwalle.com üzerinden verilen tüm siparişler için geçerlidir. Sipariş vererek bunları kabul etmiş olursunuz.",
    sections: [
      { title: "Biz kimiz", body: ["Horwalle, Bakü (Azerbaycan) merkezli bir giyim markasıdır. Hazır giyim ve 3D Tasarım Stüdyomuzda sizin tasarımınızla üretilen giysiler satıyor, Azerbaycan içine ve tüm dünyaya gönderiyoruz."] },
      {
        title: "Fiyatlar ve ödeme",
        body: [[
          "Fiyatlar Azerbaycan manatı (AZN) ile belirlenir. Diğer para birimlerindeki tutarlar güncel kurla hesaplanır ve bilgi amaçlıdır; kartınızdan ödeme sayfasında gösterilen para biriminde çekilir.",
          "Azerbaycan dışındaki alıcılar için fiyatlar farklı olabilir; son fiyat teslimat ülkesine göre belirlenir.",
          "Fiyatlara, uygulandığı durumlarda Azerbaycan KDV'si dahildir. Ülkenizin gümrük vergileri ve harçları dahil değildir (bkz. «Gümrük»).",
          "Online banka kartıyla ödeyebilirsiniz. Azerbaycan içinde kapıda ödeme de mümkün olabilir.",
          "Her siparişe bir numara verilir. Bu numarayla siparişinizi «Sipariş takibi» sayfasında izleyebilirsiniz.",
        ]],
      },
      { title: "Azerbaycan içi teslimat", body: [["Bakü ve Sumgayıt: 1–2 iş günü, ücretsiz.", `Bölgeler: 2–4 iş günü. Teslimat ${r.regionAZN} ₼, ${r.regionFreeFromAZN} ₼ ve üzeri siparişlerde ücretsiz.`]] },
      {
        title: "Uluslararası teslimat",
        body: [[
          `Standart: 7–14 iş günü, ${r.intlStandardAZN} ₼'dan ($${r.intlStandardUSD}).`,
          `Ekspres: 2–5 iş günü, ${r.intlExpressAZN} ₼'dan ($${r.intlExpressUSD}).`,
          "Süre, paketin Bakü'den çıktığı günden itibaren hesaplanır. Sizin tasarımınızla üretilen ürünler için ek 2–4 iş günü gerekir.",
          "Her uluslararası paket takip numarasıyla gönderilir ve numara size e-postayla iletilir.",
          "Gümrük, varış ülkesinin posta hizmeti veya yanlış adres kaynaklı gecikmeler bizim kontrolümüzde değildir.",
        ]],
      },
      {
        title: "Gümrük, vergi ve harçlar",
        body: [
          "Uluslararası siparişler DDU (gümrük vergisi ödenmemiş) olarak gönderilir. Ülkenizin talep ettiği gümrük vergisi, KDV ve hizmet bedelleri paket teslim edilirken alıcı tarafından ödenir.",
          "Bu tutarlar ülkenin kurallarına ve sipariş değerine bağlıdır; önceden hesaplayamayız. Ödemeyi reddederseniz ve paket bize geri dönerse, ürün bedelini iki yönlü kargo ücreti düşülerek iade ederiz.",
        ],
      },
      {
        title: "İade ve değişim",
        body: [[
          "Hazır ürünler teslimattan sonra 14 gün içinde, giyilmemiş, yıkanmamış ve etiketleri üzerinde olmak koşuluyla iade edilebilir veya değiştirilebilir.",
          "Azerbaycan içinde ürünü kuryeyle teslim alabiliriz. Yurt dışından ürünü siz gönderirsiniz; iade kargosu ve gümrük masrafları alıcıya aittir.",
          "Göndermeden önce sipariş numaranızla bize yazın, adresi teyit edelim.",
          "Para, ürün bize ulaştıktan sonra 10 iş günü içinde ödeme yaptığınız yönteme iade edilir. Ürün kusurlu veya yanlış değilse ilk kargo ücreti iade edilmez.",
        ]],
      },
      {
        title: "Sizin tasarımınızla üretilen ürünler",
        body: [
          "3D Tasarım Stüdyosu'nda üretilen giysiler yalnızca sizin için üretildiğinden fikir değişikliği nedeniyle iade edilemez. Üretim hatası varsa veya onayladığınız tasarımdan farklıysa, masrafı bize ait olmak üzere yeniden üretir veya ücretini iade ederiz.",
          "Yüklediğiniz her görsel, logo ve metnin size ait olduğunu veya kullanım hakkınız olduğunu onaylarsınız. Başkasının haklarını ihlal eden veya saldırgan tasarımları kabul etmeyebiliriz.",
        ],
      },
      { title: "Kusurlu veya yanlış ürün", body: ["Ürün hasarlı, kusurlu veya siparişten farklı gelirse, teslimattan sonra 7 gün içinde fotoğrafla bize yazın. Nerede olursanız olun, ürünü değiştirir veya kargo dahil ücretini iade ederiz."] },
      { title: "Siparişin iptali", body: ["Hazır ürün siparişini kargoya verilene kadar ücretsiz iptal edebilirsiniz. Tasarım siparişi yalnızca üretim başlamadan önce iptal edilebilir."] },
      { title: "Uygulanacak hukuk", body: ["Bu koşullar Azerbaycan Cumhuriyeti mevzuatına tabidir. Bu, kendi ülkenizin tüketici yasalarından doğan haklarınızı sınırlamaz."] },
    ],
  };
}
