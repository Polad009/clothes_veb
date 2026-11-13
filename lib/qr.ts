import QRCode from 'qrcode';

/**
 * QR code as an SVG string that scales to its container (no fixed width/height).
 * Level M survives ~15% damage; the 4-module quiet zone is part of the image.
 */
export async function qrSvg(text: string): Promise<string> {
  const svg = await QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
  });
  return svg.replace(/\s(width|height)="[^"]*"/g, '');
}
