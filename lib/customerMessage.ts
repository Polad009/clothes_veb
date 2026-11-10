// Ready-made WhatsApp messages the shop sends a customer about their order.

const SITE = 'https://www.horwalle.com';

/** International digits for wa.me; local Azerbaijani numbers (050…, 50…) get the 994 prefix. */
export function waDigits(phone: string): string {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('0')) d = '994' + d.slice(1);
  if (d.length === 9) d = '994' + d;
  return d;
}

export function statusMessage(input: { name: string; orderId: string; status: string; trackingCode?: string }): string {
  const first = String(input.name || '').trim().split(/\s+/)[0] || '';
  const hello = first && first !== 'Müştəri' ? `Salam, ${first}!` : 'Salam!';
  const link = `${SITE}/track?orderId=${encodeURIComponent(input.orderId)}`;
  const s = String(input.status || '').toLowerCase();

  let body: string;
  if (s.includes('ləğv')) body = `${input.orderId} nömrəli sifarişiniz ləğv edildi. Ödəniş etmisinizsə, məbləğ kartınıza qaytarılacaq. Sualınız olsa, bura yazın.`;
  else if (s.includes('çatdırıldı')) body = `${input.orderId} nömrəli sifarişiniz təhvil verildi. Bizi seçdiyiniz üçün təşəkkür edirik! Rəyinizi bilmək bizə maraqlıdır.`;
  else if (s.includes('kuryer')) body = `${input.orderId} nömrəli sifarişiniz kuryerə təhvil verildi və yoldadır.${input.trackingCode ? ` İzləmə kodu: ${input.trackingCode}.` : ''}`;
  else if (s.includes('çap') || s.includes('dərzi')) body = `${input.orderId} nömrəli sifarişiniz hazırlanır.`;
  else if (s.includes('təsdiq')) body = `${input.orderId} nömrəli sifarişiniz təsdiqləndi və hazırlanmağa başladı.`;
  else body = `${input.orderId} nömrəli sifarişinizi aldıq, təşəkkür edirik!`;

  return `${hello} HORWALLE-dən yazırıq. ${body}\n\nSifarişi izləmək: ${link}`;
}
