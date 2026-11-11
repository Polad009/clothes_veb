import type { LegalDoc } from "@/components/store/LegalPage";

export const PRIVACY_RU: LegalDoc = {
  title: "Политика конфиденциальности",
  updated: "11 ноября 2026",
  intro: "Здесь описано, какие персональные данные Horwalle собирает при использовании www.horwalle.com, зачем и какие у вас права.",
  sections: [
    {
      title: "Что мы собираем",
      body: [[
        "Данные заказа: имя, телефон, e-mail, адрес доставки и страна.",
        "Если вы создаёте аккаунт: e-mail и история заказов.",
        "Дизайны, загруженные в 3D дизайн-студию: изображения, логотипы и тексты.",
        "Сообщения в живом чате, WhatsApp или по e-mail.",
        "Ваш e-mail, если вы попросили сообщить о поступлении товара (используется один раз для этого письма).",
        "Технические данные: тип устройства и браузера, IP-адрес и примерная страна (чтобы показать цены и доставку в вашей валюте), просмотренные страницы.",
      ]],
    },
    { title: "Оплата картой", body: ["Данные карты вводятся на защищённой странице платёжного сервиса. Полный номер карты мы не видим и не храним."] },
    {
      title: "Зачем мы их используем",
      body: [[
        "Чтобы выполнить, отправить и отследить заказ и сообщать вам его статус.",
        "Чтобы изготовить одежду с вашим дизайном.",
        "Чтобы отвечать на вопросы и оформлять возвраты.",
        "Для безопасности сайта и общей статистики его использования.",
        "Предложения по e-mail мы отправляем только с вашего согласия; в каждом письме есть ссылка для отписки.",
      ]],
    },
    {
      title: "Кому мы их передаём",
      body: [
        "Только сервисам, нужным для выполнения заказа, и только необходимое:",
        [
          "Курьерам и международным перевозчикам (имя, телефон, адрес).",
          "Таможне страны назначения — через перевозчика, для международных посылок.",
          "Платёжному сервису (сумма и номер заказа).",
          "Хостингу, базе данных и почтовому сервису, которые хранят данные по нашему поручению.",
        ],
        "Мы не продаём ваши данные.",
      ],
    },
    { title: "Передача за границу", body: ["Некоторые из этих сервисов хранят данные за пределами Азербайджана (например, в ЕС или США). Мы используем сервисы, защищающие данные по признанным стандартам."] },
    { title: "Cookie и аналитика", body: ["Мы используем необходимые cookie (корзина, язык, валюта, вход) и, только с вашего согласия, cookie аналитики (Google Analytics) для подсчёта посещений. Вы можете изменить выбор, удалив cookie этого сайта."] },
    { title: "Сколько мы храним", body: ["Записи о заказах хранятся столько, сколько требует законодательство о бухгалтерском учёте. Загруженные дизайны и сообщения чата удаляются, когда они больше не нужны для заказа или поддержки. Вы можете в любое время попросить удалить аккаунт."] },
    { title: "Ваши права", body: ["Вы можете запросить доступ к своим данным, их исправление или удаление, а также возразить против их использования. Если вы находитесь в ЕС или Великобритании, у вас есть права по GDPR, включая жалобу в местный орган по защите данных. Напишите нам — мы ответим в течение 30 дней."] },
  ],
};

export const PRIVACY_TR: LegalDoc = {
  title: "Gizlilik politikası",
  updated: "11 Kasım 2026",
  intro: "Bu politika, www.horwalle.com'u kullanırken Horwalle'in hangi kişisel verileri topladığını, neden kullandığını ve haklarınızı açıklar.",
  sections: [
    {
      title: "Neleri topluyoruz",
      body: [[
        "Sipariş bilgileri: ad, telefon, e-posta, teslimat adresi ve ülke.",
        "Hesap açarsanız: e-posta ve sipariş geçmişi.",
        "3D Tasarım Stüdyosu'na yüklediğiniz görseller, logolar ve metinler.",
        "Canlı sohbet, WhatsApp veya e-postayla gönderdiğiniz mesajlar.",
        "Tükenen bir ürün stoğa girdiğinde haber verilmesini isterseniz e-postanız (yalnızca o e-posta için bir kez kullanılır).",
        "Teknik veriler: cihaz ve tarayıcı türü, IP adresi ve yaklaşık ülke (fiyat ve teslimatı para biriminizde göstermek için), görüntülenen sayfalar.",
      ]],
    },
    { title: "Kartla ödeme", body: ["Kart bilgileri ödeme hizmetinin güvenli sayfasında girilir. Kartın tam numarasını görmeyiz ve saklamayız."] },
    {
      title: "Neden kullanıyoruz",
      body: [[
        "Siparişinizi hazırlamak, göndermek, takip etmek ve durumu hakkında sizi bilgilendirmek için.",
        "Sizin tasarımınızla giysi üretmek için.",
        "Sorularınızı yanıtlamak ve iadeleri yönetmek için.",
        "Site güvenliği ve genel kullanım istatistikleri için.",
        "Teklifleri e-postayla yalnızca izninizle göndeririz; her e-postada abonelikten çıkma bağlantısı vardır.",
      ]],
    },
    {
      title: "Kimlerle paylaşıyoruz",
      body: [
        "Yalnızca siparişi tamamlamak için gereken hizmetlerle ve yalnızca gerektiği kadar:",
        [
          "Kuryeler ve uluslararası taşıyıcılar (ad, telefon, adres).",
          "Uluslararası paketler için, taşıyıcı aracılığıyla, varış ülkesinin gümrük yetkilileri.",
          "Ödeme hizmeti (tutar ve sipariş numarası).",
          "Verileri bizim adımıza saklayan barındırma, veritabanı ve e-posta hizmetleri.",
        ],
        "Verilerinizi satmıyoruz.",
      ],
    },
    { title: "Yurt dışına aktarım", body: ["Bu hizmetlerin bazıları verileri Azerbaycan dışında (örneğin AB veya ABD'de) saklar. Verileri tanınmış standartlarla koruyan hizmetler kullanıyoruz."] },
    { title: "Çerezler ve analitik", body: ["Zorunlu çerezleri (sepet, dil, para birimi, giriş) ve yalnızca izninizle ziyaretleri saymak için analitik çerezleri (Google Analytics) kullanırız. Bu site için çerezleri silerek seçiminizi istediğiniz zaman değiştirebilirsiniz."] },
    { title: "Ne kadar saklıyoruz", body: ["Sipariş kayıtları muhasebe mevzuatının gerektirdiği süre boyunca saklanır. Yüklenen tasarımlar ve sohbet mesajları sipariş veya destek için gerekmediğinde silinir. Hesabınızın silinmesini istediğiniz zaman talep edebilirsiniz."] },
    { title: "Haklarınız", body: ["Kişisel verilerinize erişme, düzeltme veya silme ve kullanımına itiraz etme hakkınız vardır. AB veya Birleşik Krallık'taysanız, yerel veri koruma kurumuna şikâyet dahil GDPR kapsamındaki haklarınız da vardır. Bize yazın, 30 gün içinde yanıt veririz."] },
  ],
};
