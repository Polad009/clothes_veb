export function getEmailBaseWrapper(contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="az">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HORVVALLE</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1517; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #EBE4DA; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
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
      <div class="logo">HORVVALLE</div>
      <div class="tagline">Lüks Moda & Fərdi Dərzilik Atelyesi</div>
    </div>
    <div class="body-content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>HORVVALLE Baku</strong> — Nizami küç. 44, Bakı, Azərbaycan</p>
      <p style="margin: 0;">Müştəri xidməti: +994 10 328 31 52 · <a href="https://horvvalle.com" style="color: #111011; text-decoration: underline;">horvvalle.com</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateOrderConfirmationHtml(order: any): string {
  const cust = order.customer || {};
  const items = order.items || [];
  const trackingUrl = `https://horvvalle.com/track?orderId=${encodeURIComponent(order.id)}`;

  const destinationParts = [
    cust.address,
    cust.addressLine2,
    cust.city,
    cust.stateOrRegion,
    cust.postalCode,
    cust.country || "Azərbaycan",
  ].filter(Boolean);
  const destinationStr = destinationParts.join(", ") || "-";
  const carrierLabel = order.shippingMethodLabel || order.shippingMethod || "Kuryer";
  const shippingInfo = order.estimatedDelivery ? `${carrierLabel} (${order.estimatedDelivery})` : carrierLabel;
  const formatEmailPrice = (val: number) => {
    const num = Number(val || 0).toFixed(2);
    if (order.currency === "USD") return `$${num}`;
    if (order.currency === "EUR") return `€${num}`;
    return `${num} ₼`;
  };
  const shippingCostStr = Number(order.shipping || 0) === 0 ? "Pulsuz" : formatEmailPrice(order.shipping);

  const itemsRows = items
    .map(
      (item: any) => `
    <tr>
      <td>
        <strong>${item.name}</strong><br>
        <span style="font-size: 11px; color: #7A7269;">Ölçü: ${item.size || "L"} · Rəng: ${item.color || "Standart"}</span>
      </td>
      <td style="text-align: center;">${item.quantity || 1}</td>
      <td style="text-align: right; font-weight: bold;">${formatEmailPrice(item.price)}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <h2 style="font-size: 22px; margin: 0 0 10px 0; font-weight: 600; color: #111011;">Təşəkkür edirik, ${cust.fullName || "Dəyərli Müştəri"}!</h2>
    <p style="font-size: 13px; color: #5C5247; line-height: 1.6; margin: 0 0 20px 0;">
      Sifarişiniz uğurla qeydə alındı və atelyedə hazırlanmaya göndərildi. Sifarişinizi canlı izləmək üçün aşağıdakı düymədən istifadə edə bilərsiniz.
    </p>

    <div style="background-color: #FAF7F2; padding: 18px 20px; border-radius: 16px; border: 1px solid #EBE4DA; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 12px;">
        <tr>
          <td style="color: #7A7269; padding-bottom: 6px;">Sifariş Kodu:</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace; font-size: 13px;">#${order.id}</td>
        </tr>
        <tr>
          <td style="color: #7A7269; padding-bottom: 6px;">Tarix:</td>
          <td style="text-align: right;">${new Date().toLocaleDateString("az-AZ")}</td>
        </tr>
        <tr>
          <td style="color: #7A7269; padding-bottom: 6px;">Çatdırılma Ünvanı:</td>
          <td style="text-align: right;">${destinationStr}</td>
        </tr>
        <tr>
          <td style="color: #7A7269; padding-bottom: 6px;">Çatdırılma Xidməti:</td>
          <td style="text-align: right;">${shippingInfo} (${shippingCostStr})</td>
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
          <td style="text-align: right; padding-top: 10px; font-size: 12px; color: #111011;">
            ${formatEmailPrice(order.subtotal)}
          </td>
        </tr>
        ${Number(order.discount || 0) > 0 ? `
        <tr>
          <td colspan="2" style="text-align: right; padding-top: 4px; color: #16A34A; font-size: 12px;">Endirim:</td>
          <td style="text-align: right; padding-top: 4px; font-size: 12px; color: #16A34A; font-weight: bold;">
            -${formatEmailPrice(order.discount)}
          </td>
        </tr>` : ''}
        <tr>
          <td colspan="2" style="text-align: right; padding-top: 4px; color: #7A7269; font-size: 12px;">Çatdırılma:</td>
          <td style="text-align: right; padding-top: 4px; font-size: 12px; color: #111011;">
            ${shippingCostStr}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: right; padding-top: 14px; font-weight: bold; border-top: 2px solid #EBE4DA;">Yekun Cəmi:</td>
          <td style="text-align: right; padding-top: 14px; font-weight: bold; font-size: 16px; color: #111011; border-top: 2px solid #EBE4DA;">
            ${formatEmailPrice(order.total)}
          </td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${trackingUrl}" class="btn">Sifarişinizi Canlı İzləyin</a>
    </div>
  `;

  return getEmailBaseWrapper(content);
}

export function generateStatusUpdateHtml(order: any, newStatus: string): string {
  const cust = order.customer || {};
  const trackingUrl = `https://horvvalle.com/track?orderId=${encodeURIComponent(order.id)}`;

  let statusDescription = "Sifarişinizin cari mərhələsi yeniləndi.";
  if (newStatus.includes("Təsdiq")) {
    statusDescription = "Sifarişiniz menecer tərəfindən təsdiqləndi və atelyeyə yönləndirildi.";
  } else if (newStatus.includes("Çap") || newStatus.includes("Dərzi")) {
    statusDescription = "Sifarişiniz hazırda atelyedə fərdi kəsim və ya yüksək dəqiqlikli DTF çap studiyasındadır.";
  } else if (newStatus.includes("Kuryer")) {
    statusDescription = "Sifarişiniz kuryerə təhvil verildi və çatdırılma ünvanınıza doğru yoldadır.";
  } else if (newStatus.includes("Çatdır") || newStatus.includes("tamam")) {
    statusDescription = "Sifarişiniz uğurla təhvil verildi! Bizi seçdiyiniz üçün təşəkkür edirik.";
  }

  const content = `
    <h2 style="font-size: 22px; margin: 0 0 10px 0; font-weight: 600; color: #111011;">Sifarişinizin Statusu Yeniləndi</h2>
    <p style="font-size: 13px; color: #5C5247; line-height: 1.6; margin: 0 0 20px 0;">
      Hörmətli ${cust.fullName || "Müştəri"}, <strong>#${order.id}</strong> nömrəli sifarişinizin statusu dəyişdirildi.
    </p>

    <div style="text-align: center; background-color: #FAF7F2; padding: 24px 20px; border-radius: 16px; border: 1px solid #EBE4DA; margin: 24px 0;">
      <span style="font-size: 11px; text-transform: uppercase; color: #7A7269; letter-spacing: 1px; display: block; margin-bottom: 6px;">YENİ STATUS:</span>
      <span style="font-size: 18px; font-weight: bold; color: #111011; background-color: #FEF3C7; padding: 6px 18px; border-radius: 30px; display: inline-block;">
        ${newStatus}
      </span>
      <p style="font-size: 13px; color: #5C5247; margin: 12px 0 0 0; line-height: 1.5;">
        ${statusDescription}
      </p>
      ${order.shippingMethodLabel ? `<p style="font-size: 11px; color: #7A7269; margin: 10px 0 0 0;">Çatdırılma: <strong>${order.shippingMethodLabel}</strong>${order.estimatedDelivery ? ` (${order.estimatedDelivery})` : ""}</p>` : ""}
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${trackingUrl}" class="btn">Sifarişi İzlə</a>
    </div>
  `;

  return getEmailBaseWrapper(content);
}

export function generateCampaignHtml({
  headline,
  message,
  promoCode,
  ctaLink = "https://horvvalle.com/collections",
}: {
  headline: string;
  message: string;
  promoCode?: string;
  ctaLink?: string;
}): string {
  const content = `
    <div style="text-align: center;">
      <span style="display: inline-block; padding: 4px 12px; background-color: #111011; color: #E6C280; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 20px; margin-bottom: 12px;">
        Eksklüziv Kampaniya
      </span>
      <h2 style="font-size: 24px; margin: 0 0 16px 0; font-weight: 600; color: #111011;">
        ${headline}
      </h2>
      <p style="font-size: 14px; color: #5C5247; line-height: 1.7; margin: 0 auto 24px auto; max-width: 480px;">
        ${message}
      </p>

      ${
        promoCode
          ? `
        <div style="margin: 24px auto; padding: 18px 24px; background-color: #FAF7F2; border: 2px dashed #D6C2A5; border-radius: 16px; display: inline-block;">
          <span style="font-size: 11px; text-transform: uppercase; color: #7A7269; display: block; margin-bottom: 6px;">Sizin Xüsusi Promokodunuz:</span>
          <span style="font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #111011; font-family: monospace;">${promoCode}</span>
        </div>
      `
          : ""
      }

      <div style="margin-top: 24px;">
        <a href="${ctaLink}" class="btn">Kolleksiyanı Kəşf Et</a>
      </div>
    </div>
  `;

  return getEmailBaseWrapper(content);
}

