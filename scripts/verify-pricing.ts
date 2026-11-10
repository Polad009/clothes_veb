// Pure checks of the server-side price rules. Touches no database.
//   npx tsx scripts/verify-pricing.ts

import { resolveUnitPrice } from '@/lib/db/products';
import { customPrintPrice, GARMENTS, PLACEMENTS } from '@/lib/studio/catalog';

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`, ok ? '' : detail ?? '');
  if (!ok) failed++;
}

const garment = GARMENTS[0];
const paid = PLACEMENTS.find((p) => p.extraPrice > 0)!;
const free = PLACEMENTS.find((p) => p.extraPrice === 0)!;

check('catalogue is loaded', GARMENTS.length > 5 && PLACEMENTS.length > 1);
check('garment + free placement', customPrintPrice(garment.id, free.id) === garment.basePrice);
check('garment + paid placement', customPrintPrice(garment.id, paid.id) === garment.basePrice + paid.extraPrice);
check('unknown placement = standard', customPrintPrice(garment.id, 'nope') === garment.basePrice);
check('unknown garment rejected', customPrintPrice('free-stuff', free.id) === null);
check('missing garment rejected', customPrintPrice(undefined, undefined) === null);

const base = customPrintPrice(garment.id, paid.id)!;
check('custom item: honest AZN price accepted', resolveUnitPrice({ price: base }, 'AZN', base) === base);
check('custom item: tampered price replaced', resolveUnitPrice({ price: base }, 'AZN', 0.5) === base);
check('custom item: USD conversion accepted', resolveUnitPrice({ price: base }, 'USD', base / 1.7) === Math.round((base / 1.7) * 100) / 100);
check('custom item: AZN number claimed as USD rejected', resolveUnitPrice({ price: base }, 'USD', 1) === Math.round((base / 1.7) * 100) / 100);

console.log(failed === 0 ? '\nALL CHECKS PASSED' : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
