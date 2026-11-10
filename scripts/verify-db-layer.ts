// End-to-end check of lib/db against the real database.
// Everything it creates is flagged as a test record and removed again.
//   npx tsx --env-file=.env.local scripts/verify-db-layer.ts

import { deleteProduct, findProduct, listProducts, resolveUnitPrice, saveProduct } from '@/lib/db/products';
import {
  createOrder,
  createPodOrder,
  deleteOrder,
  findOrder,
  findPodOrderByOrderId,
  findRecentDuplicate,
  listOrders,
  listPodOrders,
  OutOfStockError,
  searchOrders,
  updateOrder,
  updatePodOrderStatus,
} from '@/lib/db/orders';
import {
  checkPromo,
  deleteCategory,
  deletePromo,
  findPromo,
  getContent,
  getSettings,
  incrementPromoUses,
  listCategories,
  listPromos,
  saveCategory,
  saveContent,
  savePromo,
} from '@/lib/db/site';

let failed = 0;
function check(name: string, ok: unknown, detail?: unknown) {
  if (ok) {
    console.log(`  ok    ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}`, detail ?? '');
  }
}

async function main() {
  console.log('products');
  const before = await listProducts();
  check('list returns products', before.length > 0, before.length);
  check('fields are mapped', before.every((p) => p.name && p.price > 0 && p.colors.length > 0 && p.image));

  const created = await saveProduct({
    name: 'ZZ Sınaq Məhsulu Şəkər Çörəyi',
    price: 12.5,
    category: 'koynek',
    compareAtPrice: 20,
    internationalPrice: 9,
    colors: [{ name: 'Qara', hex: '#000000', image: '/x.png' }],
    sizes: ['M'],
    description: 'sınaq',
    inStock: false,
  });
  check('create: slug is transliterated', created.slug === 'zz-sinaq-mehsulu-seker-coreyi', created.slug);
  check('create: values stored', created.price === 12.5 && created.compareAtPrice === 20 && created.internationalPrice === 9 && !created.inStock);

  const twin = await saveProduct({ name: 'ZZ Sınaq Məhsulu Şəkər Çörəyi', price: 1 });
  check('create: duplicate name gets its own slug', twin.slug === 'zz-sinaq-mehsulu-seker-coreyi-2' && twin.id !== created.id, twin.slug);

  const updated = await saveProduct({ ...created, price: 15, internationalPrice: null });
  check('update: same row, new price', updated.id === created.id && updated.price === 15);
  check('update: omitted compareAtPrice kept when sent, intl cleared', updated.compareAtPrice === 20 && updated.internationalPrice === undefined);
  check('update: untouched fields kept', updated.description === 'sınaq' && updated.sizes[0] === 'M' && updated.colors.length === 1);
  check('find by slug', (await findProduct(created.slug))?.id === created.id);

  check('price: AZN', resolveUnitPrice({ price: 34, internationalPrice: 25 }, 'AZN', 34) === 34);
  check('price: USD international', resolveUnitPrice({ price: 34, internationalPrice: 25 }, 'USD', 25) === 25);
  check('price: USD domestic conversion', resolveUnitPrice({ price: 34, internationalPrice: 25 }, 'USD', 20) === 20);
  check('price: tampered falls back', resolveUnitPrice({ price: 34, internationalPrice: 25 }, 'AZN', 0.01) === 34);

  check('delete', (await deleteProduct(created.id)) && (await deleteProduct(twin.slug)));
  check('catalogue restored', (await listProducts()).length === before.length);

  console.log('orders');
  const ordersBefore = (await listOrders()).length;
  const order = await createOrder({
    userId: '00000000-0000-4000-8000-000000000000', // no such profile: must still save
    customer: {
      fullName: 'Sınaq Müştəri',
      phone: '+994 50 000 00 01',
      email: 'verify-db-layer@example.com',
      address: 'Test küç. 1',
      city: 'Bakı',
      country: 'Azərbaycan',
      countryCode: 'AZ',
    },
    items: [
      { productId: before[0].id, name: before[0].name, size: 'M', color: 'Qara', price: 10, quantity: 2 },
      { productId: '', name: 'Fərdi', size: 'L', color: 'Ağ', price: 5, quantity: 1, isCustom: true, customData: { placement: 'Sinə' } },
    ],
    paymentMethod: 'Bank Kartı (Visa/Mastercard)',
    paymentStatus: 'pending_payment',
    orderStatus: 'Yeni Sifariş',
    subtotal: 25,
    shipping: 3,
    shippingMethod: 'domestic_baku_sumgayit',
    discount: 2,
    total: 26,
    isTest: true,
    provider: 'mock',
    promoCode: 'X',
    currency: 'AZN',
  });
  try {
    check('create: number and tracking code', /^VTX-ORD-\d{6}$/.test(order.id) && /^AZ-EXP-\d{6}$/.test(order.trackingCode || ''), order.id);
    check('create: items and totals', order.items.length === 2 && order.total === 26 && order.subtotal === 25 && order.shipping === 3 && order.discount === 2);
    check('create: custom item keeps its design', order.items.some((i) => i.isCustom && i.customData?.placement === 'Sinə'));
    check('create: unknown account does not block the order', order.userId === undefined);

    check('find by number', (await findOrder(order.id))?.id === order.id);
    check('find by tracking code', (await findOrder(order.trackingCode!))?.id === order.id);
    check('search by e-mail', (await searchOrders({ email: 'VERIFY-db-layer@example.com' })).some((o) => o.id === order.id));
    check('search by phone, other formatting', (await searchOrders({ phoneDigits: '0500000001' })).some((o) => o.id === order.id));
    check('search by partial code', (await searchOrders({ code: order.id.slice(-6) })).some((o) => o.id === order.id));
    check('search ignores filter injection', (await searchOrders({ code: 'x,id.neq.0)' })).length === 0);
    check('duplicate guard', (await findRecentDuplicate('050 000 00 01'.replace(/^0/, '+994 '), 26))?.id === order.id);

    const patched = await updateOrder(order.id, { orderStatus: 'Təsdiqləndi', paymentStatus: 'test_paid' });
    check('status update persists', patched?.orderStatus === 'Təsdiqləndi' && (await findOrder(order.id))?.paymentStatus === 'test_paid');

    const pod = await createPodOrder({
      orderId: order.id, customerName: 'Sınaq', customerPhone: '+994500000001', customerEmail: '',
      garmentType: 'Tee', garmentColor: 'Ağ', size: 'L', price: 5, frontDesign: { a: 1 }, backDesign: {}, status: 'Pending Print',
    });
    check('pod: created and linked', /^POD-\d{6}$/.test(pod.id) && (await findPodOrderByOrderId(order.id))?.id === pod.id);
    check('pod: status update', (await updatePodOrderStatus(pod.id, 'Printed'))?.status === 'Printed');
  } finally {
    check('delete order', await deleteOrder(order.id));
  }
  check('order, items and pod job are gone',
    (await listOrders()).length === ordersBefore && !(await findOrder(order.id)) && !(await listPodOrders()).some((p) => p.orderId === order.id));

  console.log('stock');
  const tracked = await saveProduct({
    name: 'ZZ Stok Sınağı',
    price: 10,
    category: 'koynek',
    inStock: false, // never visible to shoppers while the test runs
    trackStock: true,
    colors: [{ name: 'Qara', hex: '#000000', image: '/x.png' }],
    sizes: ['M', 'L'],
    stock: { 'Qara|M': 2, 'Qara|L': 0 },
  });
  const stockOf = async () => (await findProduct(tracked.id))!.stock;
  const stockOrder = (qty: number) =>
    createOrder({
      customer: { fullName: 'Stok Sınaq', phone: '+994 50 000 00 02', email: 'verify-stock@example.com', address: 'x', city: 'Bakı', country: 'Azərbaycan' },
      items: [{ productId: tracked.id, name: tracked.name, size: 'M', color: 'Qara', price: 10, quantity: qty }],
      paymentMethod: 'Bank Kartı (Visa/Mastercard)',
      paymentStatus: 'pending_payment',
      orderStatus: 'Yeni Sifariş',
      subtotal: 10 * qty,
      shipping: 0,
      discount: 0,
      total: 10 * qty,
      isTest: true,
      currency: 'AZN',
    });
  const placed: string[] = [];
  try {
    check('stock: counts stored per colour/size', JSON.stringify(await stockOf()) === JSON.stringify({ 'Qara|M': 2, 'Qara|L': 0 }), await stockOf());

    const first = await stockOrder(2);
    placed.push(first.id);
    check('stock: order takes the units', (await stockOf())['Qara|M'] === 0);

    let blocked: unknown = null;
    try {
      placed.push((await stockOrder(1)).id);
    } catch (e) {
      blocked = e;
    }
    check('stock: over-selling is refused', blocked instanceof OutOfStockError && (blocked as OutOfStockError).available === 0, String(blocked));
    check('stock: refused order is not stored', (await searchOrders({ email: 'verify-stock@example.com' })).length === 1);
    check('stock: product shows as sold out', (await findProduct(tracked.id))!.inStock === false);

    await updateOrder(first.id, { orderStatus: 'Ləğv edildi' });
    check('stock: cancelling gives units back', (await stockOf())['Qara|M'] === 2);
    await updateOrder(first.id, { orderStatus: 'Ləğv edildi' });
    check('stock: cancelling twice does not double them', (await stockOf())['Qara|M'] === 2);
    await updateOrder(first.id, { orderStatus: 'Təsdiqləndi' });
    check('stock: reopening takes them again', (await stockOf())['Qara|M'] === 0);
    await updateOrder(first.id, { paymentStatus: 'failed' });
    check('stock: failed payment gives units back', (await stockOf())['Qara|M'] === 2);
    await updateOrder(first.id, { paymentStatus: 'paid' });
    check('stock: paid again takes them again', (await stockOf())['Qara|M'] === 0);

    await deleteOrder(first.id);
    placed.splice(placed.indexOf(first.id), 1);
    check('stock: deleting the order gives units back', (await stockOf())['Qara|M'] === 2);

    const untracked = await saveProduct({ id: tracked.id, name: tracked.name, price: 10, trackStock: false });
    check('stock: switched off = unlimited', untracked.trackStock === false && Object.keys(untracked.stock).length === 0);
  } finally {
    for (const id of placed) await deleteOrder(id).catch(() => {});
    await deleteProduct(tracked.id);
  }

  console.log('promo codes');
  const promosBefore = await listPromos();
  check('seeded promos present', promosBefore.length >= 6, promosBefore.length);
  const promo = await savePromo({ code: ' zzverify ', type: 'percent', value: 10, minAmount: 20, active: true, maxUses: 1 });
  try {
    check('saved upper-cased', promo.code === 'ZZVERIFY' && promo.maxUses === 1);
    const good = await checkPromo('zzverify', 50);
    check('valid: 10% of 50', good.ok && good.discount === 5);
    const low = await checkPromo('ZZVERIFY', 10);
    check('below minimum rejected', !low.ok && low.reason === 'min_amount');
    await incrementPromoUses('ZZVERIFY');
    const maxed = await checkPromo('ZZVERIFY', 50);
    check('usage limit enforced', !maxed.ok && maxed.reason === 'maxed');
    await savePromo({ id: promo.id, code: 'ZZVERIFY', active: false });
    const off = await checkPromo('ZZVERIFY', 50);
    check('inactive rejected, other fields kept', !off.ok && off.reason === 'invalid' && (await findPromo('ZZVERIFY'))?.value === 10);
    const none = await checkPromo('NO-SUCH-CODE', 50);
    check('unknown rejected', !none.ok);
  } finally {
    await deletePromo(promo.id!);
  }
  check('promo removed', (await listPromos()).length === promosBefore.length);

  console.log('content & categories');
  const content = await getContent();
  const settings = await getSettings();
  check('content has hero and categories', Boolean(content.hero?.headline) && (content.categories || []).length >= 4);
  check('settings loaded', Boolean(settings.storeName && settings.contactEmail));

  const cat = await saveCategory({ id: 'zz-verify', title: 'Sınaq', desc: 'd', image: '/i.png' });
  try {
    check('category saved', cat.title === 'Sınaq' && (await listCategories()).some((c) => c.id === 'zz-verify'));
    const edited = await saveCategory({ id: 'zz-verify', active: false });
    check('category partial update', edited.active === false && edited.title === 'Sınaq');
  } finally {
    await deleteCategory('zz-verify');
  }
  check('category removed', !(await listCategories()).some((c) => c.id === 'zz-verify'));

  const originalTag = content.hero.tag;
  const saved = await saveContent({ hero: { tag: 'ZZ-VERIFY' } });
  check('content: nested patch keeps siblings', saved.hero.tag === 'ZZ-VERIFY' && saved.hero.headline === content.hero.headline);
  const restored = await saveContent({ hero: { tag: originalTag } });
  check('content restored', restored.hero.tag === originalTag && JSON.stringify(restored.announcements) === JSON.stringify(content.announcements));

  console.log(failed === 0 ? '\nALL CHECKS PASSED' : `\n${failed} CHECK(S) FAILED`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('\nABORTED:', e);
  process.exit(1);
});
