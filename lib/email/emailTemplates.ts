import { DEFAULT_WHATSAPP } from "@/lib/contact";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.horwalle.com").replace(/\/$/, "");
const BRAND = "HORWALLE";

/** Everything a customer typed (name, address, notes) is escaped before it goes into HTML. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain text with line breaks kept. */
function paragraphs(value: unknown): string {
  return esc(value).replace(/\r?\n/g, "<br>");
}

function safeUrl(url: string): string {
  return /^https:\/\//.test(url) ? esc(url) : `${SITE_URL}/collections`;
}

function bakuDate(value: unknown): string {
  const d = value ? new Date(String(value)) : new Date();
  const t = Number.isNaN(d.getTime()) ? new Date() : d;
  const b = new Date(t.getTime() + 4 * 3600 * 1000); // Baku time, UTC+4
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(b.getUTCDate())}.${pad(b.getUTCMonth() + 1)}.${b.getUTCFullYear()}`;
}

export interface EmailContact {
  /** Support number shown in the footer (from the admin settings). */
  phone?: string;
}

export function getEmailBaseWrapper(contentHtml: string, contact: EmailContact = {}): string {
  const phone = contact.phone || DEFAULT_WHATSAPP;
  const waDigits = phone.replace(/\D/g, "");
  return `
<!DOCTYPE html>
<html lang="az">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1517; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #EBE4DA; overflow: hidden; }
    .header { background-color: #111011; padding: 36px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #E6C280; text-transform: uppercase; margin: 0; }
    .tagline { font-size: 10px; color: #A69D94; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; }
    .body-content { padding: 36px 32px; }
    .btn { display: inline-block; background-color: #111011; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 20px; }
    .footer { background-color: #F5EFE6; padding: 24px 30px; text-align: center; font-size: 11px; color: #7A7269; border-top: 1px solid #EBE4DA; }
    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .table th { text-align: left; padding: 10px 0; border-bottom: 2px solid #EBE4DA; font-size: 11px; text-transform: uppercase; color: #7A7269; }
    .table td { padding: 12px 0; border-bottom: 1px solid #F0EAE1; font-size: 13px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background-color: #FEF3C7; color: #92400E; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">${BRAND}</div>
      <div class="tagline">Premium Geyim Mağazası</div>
    </div>
    <div class="body-content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">Sualınız var? WhatsApp: <a href="https://wa.me/${waDigits}" style="color: #111011; text-decoration: underline;">${esc(phone)}</a></p>
      <p style="margin: 0;"><a href="${SITE_URL}" style="color: #111011; text-decoration: underline;">horwalle.com</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateOrderConfirmationHtml(order: any, contact: EmailContact = {}): string {
  const cust = order.customer || {};
  const items = order.items || [];
  const trackingUrl = `${SITE_URL}/track?orderId=${encodeURIComponent(order.id)}`;

  const destination =
    [cust.address, cust.addressLine2, cust.city, cust.stateOrRegion, cust.postalCode, cust.country || "Azərbaycan"]
      .filter(Boolean)
      .map(esc)
      .join(", ") || "-";
  const carrierLabel = esc(order.shippingMethodLabel || order.shippingMethod || "Kuryer");
  const shippingInfo = order.estimatedDelivery ? `${carrierLabel} (${esc(order.estimatedDelivery)})` : carrierLabel;
  const price = (val: number) => {
    const num = Number(val || 0).toFixed(2);
    if (order.currency === "USD") return `$${num}`;
    return `${num} ₼`;
  };
  const shippingCost = Number(order.shipping || 0) === 0 ? "Pulsuz" : price(order.shipping);

  const itemsRows = items
    .map(
      (item: any) => `
    <tr>
      <td>
        <strong>${esc(item.name)}</strong><br>
        <span style="font-size: 11px; color: #7A7269;">${[item.size && `Ölçü: ${esc(item.size)}`, item.color && `Rəng: ${esc(item.color)}`].filter(Boolean).join(" · ")}</span>
      </td>
      <td style="text-align: center;">${Number(item.quantity) || 1}</td>
      <td style="text-align: right; font-weight: bold;">${price((Number(item.price) || 0) * (Number(item.quantity) || 1))}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <h2 style="font-size: 22px; margin: 0 0 10px 0; font-weight: 600; color: #111011;">Təşəkkür edirik, ${esc(cust.fullName || "dəyərli müştəri")}!</h2>
    <p style="font-size: 13px; color: #5C5247; line-height: 1.6; margin: 0 0 20px 0;">
      Sifarişiniz qəbul edildi. Hazırlıq və çatdırılma mərhələlərini aşağıdakı düymə ilə izləyə bilərsiniz.
    </p>

    <div style="background-color: #FAF7F2; padding: 18px 20px; border-radius: 16px; border: 1px solid #EBE4DA; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 12px;">
        <tr>
          <td style="color: #7A7269; padding-bottom: 6px;">Sifariş nömrəsi:</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace; font-size: 13px;">#${esc(order.id)}</td>
        </tr>
        <tr>
          <td style="color: #7A7269; padding-bottom: 6px;">Tarix:</td>
          <td style="text-align: right;">${bakuDate(order.date)}</td>
        </tr>
        <tr>
          <td style="color: #7A7269; padding-bottom: 6px;">Çatdırılma ünvanı:</td>
          <td style="text-align: right;">${destination}</td>
        </tr>
        <tr>
          <td style="color: #7A7269; padding-bottom: 6px;">Çatdırılma:</td>
          <td style="text-align: right;">${shippingInfo} (${shippingCost})</td>
        </tr>
        <tr>
          <td style="color: #7A7269;">Status:</td>
          <td style="text-align: right;"><span class="badge">Qəbul edildi</span></td>
        </tr>
      </table>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Məhsul</th>
          <th style="text-align: center;">Say</th>
          <th style="text-align: right;">Məbləğ</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="text-align: right; padding-top: 10px; color: #7A7269; font-size: 12px;">Məhsullar:</td>
          <td style="text-align: right; padding-top: 10px; font-size: 12px; color: #111011;">${price(order.subtotal)}</td>
        </tr>
        ${Number(order.discount || 0) > 0 ? `
        <tr>
          <td colspan="2" style="text-align: right; padding-top: 4px; color: #16A34A; font-size: 12px;">Endirim${order.promoCode ? ` (${esc(order.promoCode)})` : ""}:</td>
          <td style="text-align: right; padding-top: 4px; font-size: 12px; color: #16A34A; font-weight: bold;">-${price(order.discount)}</td>
        </tr>` : ""}
        <tr>
          <td colspan="2" style="text-align: right; padding-top: 4px; color: #7A7269; font-size: 12px;">Çatdırılma:</td>
          <td style="text-align: right; padding-top: 4px; font-size: 12px; color: #111011;">${shippingCost}</td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: right; padding-top: 14px; font-weight: bold; border-top: 2px solid #EBE4DA;">Yekun:</td>
          <td style="text-align: right; padding-top: 14px; font-weight: bold; font-size: 16px; color: #111011; border-top: 2px solid #EBE4DA;">${price(order.total)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${trackingUrl}" class="btn">Sifarişi izlə</a>
    </div>
  `;

  return getEmailBaseWrapper(content, contact);
}

export function generateStatusUpdateHtml(order: any, newStatus: string, contact: EmailContact = {}): string {
  const cust = order.customer || {};
  const trackingUrl = `${SITE_URL}/track?orderId=${encodeURIComponent(order.id)}`;
  const s = String(newStatus || "").toLowerCase();

  let statusDescription = "Sifarişinizin mərhələsi yeniləndi.";
  if (s.includes("ləğv")) {
    statusDescription = "Sifarişiniz ləğv edildi. Ödəniş etmisinizsə, məbləğ kartınıza qaytarılacaq. Sualınız olsa, bizə yazın.";
  } else if (s.includes("təsdiq")) {
    statusDescription = "Sifarişiniz təsdiqləndi və hazırlanmağa başladı.";
  } else if (s.includes("çap") || s.includes("dərzi")) {
    statusDescription = "Sifarişiniz hazırlanır.";
  } else if (s.includes("kuryer")) {
    statusDescription = "Sifarişiniz kuryerə təhvil verildi və ünvanınıza yoldadır.";
  } else if (s.includes("çatdırıldı")) {
    statusDescription = "Sifarişiniz təhvil verildi. Bizi seçdiyiniz üçün təşəkkür edirik!";
  }

  const content = `
    <h2 style="font-size: 22px; margin: 0 0 10px 0; font-weight: 600; color: #111011;">Sifarişinizin statusu yeniləndi</h2>
    <p style="font-size: 13px; color: #5C5247; line-height: 1.6; margin: 0 0 20px 0;">
      Hörmətli ${esc(cust.fullName || "müştəri")}, <strong>#${esc(order.id)}</strong> nömrəli sifarişinizin statusu dəyişdi.
    </p>

    <div style="text-align: center; background-color: #FAF7F2; padding: 24px 20px; border-radius: 16px; border: 1px solid #EBE4DA; margin: 24px 0;">
      <span style="font-size: 11px; text-transform: uppercase; color: #7A7269; letter-spacing: 1px; display: block; margin-bottom: 6px;">Yeni status:</span>
      <span style="font-size: 18px; font-weight: bold; color: #111011; background-color: #FEF3C7; padding: 6px 18px; border-radius: 30px; display: inline-block;">
        ${esc(newStatus)}
      </span>
      <p style="font-size: 13px; color: #5C5247; margin: 12px 0 0 0; line-height: 1.5;">${statusDescription}</p>
      ${order.shippingMethodLabel ? `<p style="font-size: 11px; color: #7A7269; margin: 10px 0 0 0;">Çatdırılma: <strong>${esc(order.shippingMethodLabel)}</strong>${order.estimatedDelivery ? ` (${esc(order.estimatedDelivery)})` : ""}</p>` : ""}
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${trackingUrl}" class="btn">Sifarişi izlə</a>
    </div>
  `;

  return getEmailBaseWrapper(content, contact);
}

export function generateCampaignHtml(
  {
    headline,
    message,
    promoCode,
    ctaLink = `${SITE_URL}/collections`,
  }: {
    headline: string;
    message: string;
    promoCode?: string;
    ctaLink?: string;
  },
  contact: EmailContact = {}
): string {
  const content = `
    <div style="text-align: center;">
      <h2 style="font-size: 24px; margin: 0 0 16px 0; font-weight: 600; color: #111011;">${esc(headline)}</h2>
      <p style="font-size: 14px; color: #5C5247; line-height: 1.7; margin: 0 auto 24px auto; max-width: 480px;">${paragraphs(message)}</p>
      ${
        promoCode
          ? `
        <div style="margin: 24px auto; padding: 18px 24px; background-color: #FAF7F2; border: 2px dashed #D6C2A5; border-radius: 16px; display: inline-block;">
          <span style="font-size: 11px; text-transform: uppercase; color: #7A7269; display: block; margin-bottom: 6px;">Promokodunuz:</span>
          <span style="font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #111011; font-family: monospace;">${esc(promoCode)}</span>
        </div>
      `
          : ""
      }
      <div style="margin-top: 24px;">
        <a href="${safeUrl(ctaLink)}" class="btn">Kolleksiyaya bax</a>
      </div>
    </div>
  `;

  return getEmailBaseWrapper(content, contact);
}

/** Sent to the shop when an order comes in. */
export function generateNewOrderAlertHtml(order: any, contact: EmailContact = {}): string {
  const cust = order.customer || {};
  const price = (val: number) => (order.currency === "USD" ? `$${Number(val || 0).toFixed(2)}` : `${Number(val || 0).toFixed(2)} ₼`);
  const rows = (order.items || [])
    .map(
      (item: any) => `
    <tr>
      <td><strong>${esc(item.name)}</strong>${item.isCustom ? " (öz dizayn)" : ""}<br><span style="font-size: 11px; color: #7A7269;">${[item.size && `Ölçü: ${esc(item.size)}`, item.color && `Rəng: ${esc(item.color)}`].filter(Boolean).join(" · ")}</span></td>
      <td style="text-align: center;">${Number(item.quantity) || 1}</td>
      <td style="text-align: right;">${price((Number(item.price) || 0) * (Number(item.quantity) || 1))}</td>
    </tr>`
    )
    .join("");
  const address = [cust.address, cust.addressLine2, cust.city, cust.stateOrRegion, cust.postalCode, cust.country].filter(Boolean).map(esc).join(", ");

  const content = `
    <h2 style="font-size: 22px; margin: 0 0 6px 0; font-weight: 600; color: #111011;">Yeni sifariş: ${esc(order.id)}</h2>
    <p style="font-size: 13px; color: #5C5247; margin: 0 0 20px 0;">${bakuDate(order.date)} · <strong>${price(order.total)}</strong></p>

    <div style="background-color: #FAF7F2; padding: 16px 20px; border-radius: 16px; border: 1px solid #EBE4DA; font-size: 13px; line-height: 1.7;">
      <strong>${esc(cust.fullName || "Müştəri")}</strong><br>
      ${esc(cust.phone || "")}${cust.email ? ` · ${esc(cust.email)}` : ""}<br>
      ${address || "-"}<br>
      Çatdırılma: ${esc(order.shippingMethodLabel || order.shippingMethod || "-")} · Ödəniş: ${esc(order.paymentMethod || "-")}
    </div>

    <table class="table">
      <thead><tr><th>Məhsul</th><th style="text-align: center;">Say</th><th style="text-align: right;">Məbləğ</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="text-align: right; font-size: 13px; margin: 12px 0 0 0;">
      Ara cəm ${price(order.subtotal)}${Number(order.discount || 0) > 0 ? ` · Endirim −${price(order.discount)}${order.promoCode ? ` (${esc(order.promoCode)})` : ""}` : ""} · Çatdırılma ${Number(order.shipping || 0) > 0 ? price(order.shipping) : "pulsuz"}<br>
      <strong style="font-size: 16px;">Yekun ${price(order.total)}</strong>
    </p>

    <div style="text-align: center; margin-top: 28px;">
      <a href="${SITE_URL}/admin/orders/${encodeURIComponent(order.id)}" class="btn">Admin paneldə aç</a>
    </div>
  `;
  return getEmailBaseWrapper(content, contact);
}

/** Shop alert: these colour/size combinations are running out after an order. */
export function generateLowStockAlertHtml(
  rows: { name: string; color: string; size: string; left: number; adminUrl: string }[],
  contact: EmailContact = {}
): string {
  const body = rows
    .map(
      (r) => `
    <tr>
      <td><a href="${esc(r.adminUrl)}" style="color: #111011; font-weight: 600;">${esc(r.name)}</a><br><span style="font-size: 11px; color: #7A7269;">${[r.color && `Rəng: ${esc(r.color)}`, r.size && `Ölçü: ${esc(r.size)}`].filter(Boolean).join(" · ")}</span></td>
      <td style="text-align: right; font-weight: 700; color: ${r.left === 0 ? "#C0392B" : "#111011"};">${r.left === 0 ? "bitdi" : `${r.left} ədəd`}</td>
    </tr>`
    )
    .join("");
  const content = `
    <h2 style="font-size: 22px; margin: 0 0 6px 0; font-weight: 600; color: #111011;">Stok azalır</h2>
    <p style="font-size: 13px; color: #5C5247; margin: 0 0 20px 0;">Son sifarişdən sonra bu məhsullardan az qalıb. Stoku admin paneldə məhsulun səhifəsindən artırın.</p>
    <table class="table">
      <thead><tr><th>Məhsul</th><th style="text-align: right;">Qalıb</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
  return getEmailBaseWrapper(content, contact);
}
