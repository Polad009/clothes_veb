// Pure checks of the server-side price rules. Touches no database.
//   npx tsx scripts/verify-pricing.ts

import { resolveUnitPrice } from '@/lib/db/products';
import { customPrintPrice, STUDIO_MARKUP, STUDIO_PRODUCTS, studioProduct } from '@/lib/studio/catalog';

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`, ok ? '' : detail ?? '');
  if (!ok) failed++;
}

const tee = studioProduct('tshirt-regular-suprem')!;
const cap = studioProduct('kepka-nazik')!;

check('catalogue is loaded', STUDIO_PRODUCTS.length >= 27);
check('price list + markup: tee one side', customPrintPrice(tee.id, { printType: 'one' }) === 14 + STUDIO_MARKUP);
check('price list + markup: tee both sides', customPrintPrice(tee.id, { printType: 'two' }) === 15 + STUDIO_MARKUP);
check('price list + markup: tee small logo', customPrintPrice(tee.id, { printType: 'small' }) === 12 + STUDIO_MARKUP);
check('extra spots add 1 each', customPrintPrice(tee.id, { printType: 'one', extras: ['sleeveLeft', 'neck'] }) === 14 + STUDIO_MARKUP + 2);
check('duplicate / foreign extras ignored', customPrintPrice(tee.id, { printType: 'one', extras: ['neck', 'neck', 'pocket'] }) === 14 + STUDIO_MARKUP + 1);
check('cap has no two-sided print', customPrintPrice(cap.id, { printType: 'two' }) === null);
check('half price cap kept', customPrintPrice(cap.id, { printType: 'one' }) === 6.5 + STUDIO_MARKUP);
check('legacy placement key still priced', customPrintPrice(tee.id, 'both-sides') === 15 + STUDIO_MARKUP);
check('unknown product rejected', customPrintPrice('free-stuff', { printType: 'one' }) === null);
check('missing product rejected', customPrintPrice(undefined, undefined) === null);

const base = customPrintPrice(tee.id, { printType: 'two' })!;
check('custom item: honest AZN price accepted', resolveUnitPrice({ price: base }, 'AZN', base) === base);
check('custom item: tampered price replaced', resolveUnitPrice({ price: base }, 'AZN', 0.5) === base);
check('custom item: USD conversion accepted', resolveUnitPrice({ price: base }, 'USD', base / 1.7) === Math.round((base / 1.7) * 100) / 100);

console.log(failed === 0 ? '\nALL CHECKS PASSED' : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
