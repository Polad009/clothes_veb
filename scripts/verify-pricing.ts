// Pure checks of the server-side price rules. Touches no database.
//   npx tsx scripts/verify-pricing.ts

import { resolveUnitPrice } from '@/lib/db/products';
import { foreignMarkup } from '@/lib/pricing';
import { customPrintPrice, STUDIO_MARKUP, STUDIO_PRODUCTS, studioProduct } from '@/lib/studio/catalog';

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`, ok ? '' : detail ?? '');
  if (!ok) failed++;
}

const tee = studioProduct('tshirt-regular-suprem')!;
const cap = studioProduct('kepka-nazik')!;
const admin = { markup: 12, extra: 2, items: { 'tshirt-regular-suprem': { small: 10, one: 13, two: null }, 'balonka': { active: false } } };

check('catalogue is the 20 studio products', STUDIO_PRODUCTS.length === 20);
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

check('admin price + admin markup', customPrintPrice(tee.id, { printType: 'one' }, admin) === 13 + 12);
check('admin extra spot price', customPrintPrice(tee.id, { printType: 'one', extras: ['neck'] }, admin) === 13 + 12 + 2);
check('admin removed a print type', customPrintPrice(tee.id, { printType: 'two' }, admin) === null);
check('hidden product rejected', customPrintPrice('balonka', { printType: 'one' }, admin) === null);
check('other products keep list prices', customPrintPrice('polo-uzunqol', { printType: 'two' }, admin) === 21 + 12);
check('removed products are gone', customPrintPrice('fincan-sade', { printType: 'one' }) === null);

const base = customPrintPrice(tee.id, { printType: 'two' })!;
const AZ = { foreign: false, markupPct: 20 }, ABROAD = { foreign: true, markupPct: 20 };
check('AZ delivery: manat price', resolveUnitPrice({ price: base }, 'AZN', AZ) === base);
check('AZ delivery in USD: plain conversion', resolveUnitPrice({ price: base }, 'USD', AZ) === Math.round((base / 1.7) * 100) / 100);
check('abroad: markup applied (USD)', resolveUnitPrice({ price: base }, 'USD', ABROAD) === Math.round(((base * 1.2) / 1.7) * 100) / 100);
check('abroad: own foreign price wins', resolveUnitPrice({ price: 34, internationalPrice: 29 }, 'USD', ABROAD) === 29);
check('abroad shown in AZN', resolveUnitPrice({ price: 34, internationalPrice: 29 }, 'AZN', ABROAD) === 49.3);
check('abroad costs more than AZ', resolveUnitPrice({ price: 34 }, 'AZN', ABROAD) > resolveUnitPrice({ price: 34 }, 'AZN', AZ));
check('markup 0 = same price', resolveUnitPrice({ price: 34 }, 'AZN', { foreign: true, markupPct: 0 }) === 34);
check('markup from settings: default 20', foreignMarkup({}) === 20 && foreignMarkup({ regionPricing: { foreignMarkupPercent: 35 } }) === 35);

console.log(failed === 0 ? '\nALL CHECKS PASSED' : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
