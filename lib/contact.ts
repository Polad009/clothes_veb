/** Support WhatsApp number used until one is saved in the admin panel. */
export const DEFAULT_WHATSAPP = '+994 10 328 31 52';

export function whatsappNumber(settings?: Record<string, any> | null): string {
  const value = typeof settings?.whatsappNumber === 'string' ? settings.whatsappNumber.trim() : '';
  return value.replace(/\D/g, '').length >= 9 ? value : DEFAULT_WHATSAPP;
}

export function whatsappLink(number: string, text?: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
