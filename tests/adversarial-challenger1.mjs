import fs from 'fs';
import assert from 'assert';

console.log('=== TEST 1: Phone Masking in app/api/orders/track/route.ts ===');
const trackRouteContent = fs.readFileSync('app/api/orders/track/route.ts', 'utf8');

// Extract maskPhone function body using regex and strip TypeScript type annotations
const maskPhoneMatch = trackRouteContent.match(/function maskPhone\([\s\S]*?\n\}/);
if (!maskPhoneMatch) {
  throw new Error('Could not find maskPhone in track route');
}
const jsFunction = maskPhoneMatch[0]
  .replace(/function maskPhone\(phone:\s*string\):\s*string/, 'return function maskPhone(phone)')
  .replace(/phone:\s*string/g, 'phone');

const createMaskPhone = new Function(jsFunction);
const maskPhone = createMaskPhone();

const testCases = [
  { input: '+12125551234', expectForeign: true, countryCode: '+1' },
  { input: '+1 212 555 1234', expectForeign: true, countryCode: '+1' },
  { input: '+905321234567', expectForeign: true, countryCode: '+90' },
  { input: '+90 532 123 4567', expectForeign: true, countryCode: '+90' },
  { input: '+447911123456', expectForeign: true, countryCode: '+44' },
  { input: '+44 7911 123456', expectForeign: true, countryCode: '+44' },
  { input: '+4915123456789', expectForeign: true, countryCode: '+49' },
  { input: '+994501234567', expectForeign: false, countryCode: '+994' },
  { input: '+994 50 123 45 67', expectForeign: false, countryCode: '+994' },
  { input: '0501234567', expectForeign: false, countryCode: '+994' },
];

testCases.forEach(tc => {
  const result = maskPhone(tc.input);
  console.log('Input:', tc.input.padEnd(20), '-> Masked:', result);
  if (tc.expectForeign) {
    assert(!result.startsWith('+994'), `Foreign phone ${tc.input} MUST NOT start with +994, got: ${result}`);
    assert(result.startsWith(tc.countryCode) || result.startsWith('+'), `Foreign phone must retain international prefix`);
  } else {
    assert(result.startsWith('+994'), `Domestic phone ${tc.input} must start with +994, got: ${result}`);
  }
});
console.log('PASS: All phone masking assertions passed!\n');

console.log('=== TEST 2: Scroll Mechanics ===');
const globalsCss = fs.readFileSync('app/globals.css', 'utf8');
assert(globalsCss.includes('scroll-behavior: auto;'), 'app/globals.css must contain scroll-behavior: auto;');
console.log('PASS: app/globals.css has scroll-behavior: auto;');

const heroTsx = fs.readFileSync('components/Hero.tsx', 'utf8');
const heroSectionMatch = heroTsx.match(/id=["']hero-section["'][\s\S]*?>/);
assert(heroSectionMatch, 'Must find hero-section in Hero.tsx');
assert(!heroSectionMatch[0].includes('lg:overflow-hidden'), 'hero-section MUST NOT have lg:overflow-hidden');
assert(!heroTsx.includes('lg:overflow-hidden'), 'Hero.tsx MUST NOT contain lg:overflow-hidden anywhere');
console.log('PASS: hero-section has no desktop overflow lock (lg:overflow-hidden is absent).\n');

console.log('=== TEST 3: Hero Section Reversion & Video Removal ===');
assert(!heroTsx.includes('HeroVideo'), 'Hero.tsx must not import or reference HeroVideo');
assert(!heroTsx.includes('heroMode'), 'Hero.tsx must not have heroMode state');
assert(!heroTsx.includes('Kino'), 'Hero.tsx must not mention Kino');
assert(!heroTsx.includes('Vitrin'), 'Hero.tsx must not mention Vitrin');
assert(!heroTsx.includes('<video'), 'Hero.tsx must not contain <video tag');
console.log('PASS: Hero.tsx has no video mounted, no heroMode, no Kino/Vitrin pills.\n');

console.log('=== TEST 4: Social Media Links Exclusivity ===');
const instagramUrl = 'https://www.instagram.com/horwalle?vrfl=dGJ0anppbmYyeXRy&utm_source=qr';
const tiktokUrl = 'https://www.tiktok.com/@horwalle';

assert(heroTsx.includes(instagramUrl), 'Hero.tsx must contain exact Instagram URL');
assert(heroTsx.includes(tiktokUrl), 'Hero.tsx must contain exact TikTok URL');

const footerTsx = fs.readFileSync('components/Footer.tsx', 'utf8');
assert(footerTsx.includes(instagramUrl), 'Footer.tsx must contain exact Instagram URL');
assert(footerTsx.includes(tiktokUrl), 'Footer.tsx must contain exact TikTok URL');

const layoutTsx = fs.readFileSync('app/layout.tsx', 'utf8');
assert(layoutTsx.includes(instagramUrl), 'app/layout.tsx must contain exact Instagram URL');
assert(layoutTsx.includes(tiktokUrl), 'app/layout.tsx must contain exact TikTok URL');

const forbidden = ['facebook.com', 'twitter.com', 'x.com', 'youtube.com', 'linkedin.com', 'pinterest.com'];
forbidden.forEach(domain => {
  assert(!heroTsx.toLowerCase().includes(domain), `Hero.tsx must not contain ${domain}`);
  assert(!footerTsx.toLowerCase().includes(domain), `Footer.tsx must not contain ${domain}`);
  assert(!layoutTsx.toLowerCase().includes(domain), `app/layout.tsx must not contain ${domain}`);
});
console.log('PASS: Only Instagram and TikTok exist with exact URLs. No prohibited networks found.\n');

console.log('=== TEST 5: International Address Persistence & Country Registry Contract ===');
const { getCountryByCode } = await import('../lib/countries.ts');
const { calculateShippingOptions } = await import('../lib/shipping.ts');

// Test US, TR, GB, DE, AZ
const countriesToTest = ['US', 'TR', 'GB', 'DE', 'AZ'];
countriesToTest.forEach(code => {
  const c = getCountryByCode(code);
  assert(c, `Country ${code} must exist in registry`);
  console.log(`Verified country: ${c.code} (${c.name}) - dialCode: ${c.dialCode}, requiresPostal: ${c.requiresPostalCode}`);
  
  const options = calculateShippingOptions(code, 150, 'USD');
  assert(options.length > 0, `Country ${code} must have shipping options`);
  options.forEach(opt => {
    assert(typeof opt.price === 'number' && opt.price >= 0, `Option ${opt.id} must have valid non-negative price`);
    assert(opt.estimatedDays, `Option ${opt.id} must have delivery estimate`);
  });
});
console.log('PASS: International address registry and shipping calculation verified.\n');

console.log('ALL ADVERSARIAL CHALLENGER TESTS PASSED SUCCESSFULLY!');
