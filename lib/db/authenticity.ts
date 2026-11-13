import crypto from 'crypto';
import { db, isUuid, unwrap } from './client';

/** One physical garment with its own authenticity code. */
export interface ProductUnit {
  id: string;
  code: string;
  serial: string;
  productId: string | null;
  color: string;
  size: string;
  batch: string;
  status: 'active' | 'void';
  scanCount: number;
  firstScannedAt: string | null;
  lastScannedAt: string | null;
  createdAt: string;
}

export interface UnitBatch {
  batch: string;
  productId: string | null;
  color: string;
  size: string;
  count: number;
  scanned: number;
  voided: number;
  createdAt: string;
}

export interface ScanResult {
  unit: ProductUnit;
  /** Different people (and countries) that checked this code: many of them suggests a copied label. */
  visitors: number;
  countries: number;
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const CODE_RE = /^[A-Z2-7]{26}$/;
export const MAX_BATCH = 500;

/** 26 random base32 characters (130 bits): impossible to guess, and dense in a QR code. */
export function newCode(): string {
  const bytes = crypto.randomBytes(17);
  let bits = 0;
  let value = 0;
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    value = ((value << 8) | bytes[i]) & 0xffff;
    bits += 8;
    while (bits >= 5 && out.length < 26) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return out;
}

/** Codes are printed in capitals; people typing them by hand may add spaces, dashes or lower case. */
export function normalizeCode(input: string): string {
  return String(input || '').toUpperCase().replace(/[\s-]/g, '');
}

/** The address printed in the QR. Upper case keeps the QR in its dense alphanumeric mode. */
export function verifyUrl(code: string): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.horwalle.com').replace(/\/+$/, '');
  return `${site}/V/${code}`.toUpperCase();
}

function rowToUnit(r: any): ProductUnit {
  return {
    id: r.id,
    code: r.code,
    serial: r.serial,
    productId: r.product_id,
    color: r.color || '',
    size: r.size || '',
    batch: r.batch,
    status: r.status === 'void' ? 'void' : 'active',
    scanCount: Number(r.scan_count) || 0,
    firstScannedAt: r.first_scanned_at,
    lastScannedAt: r.last_scanned_at,
    createdAt: r.created_at,
  };
}

/** Creates `quantity` codes for one product variant as a new print batch. */
export async function createUnits(input: {
  productId: string;
  color?: string;
  size?: string;
  quantity: number;
}): Promise<{ batch: string; units: ProductUnit[] }> {
  if (!isUuid(input.productId)) throw new Error('Məhsul seçilməyib.');
  const quantity = Math.floor(Number(input.quantity));
  if (!(quantity >= 1 && quantity <= MAX_BATCH)) throw new Error(`Say 1 ilə ${MAX_BATCH} arasında olmalıdır.`);

  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, '');
  const batch = `${date}${newCode().slice(0, 3)}`;
  const color = String(input.color || '').trim().slice(0, 60);
  const size = String(input.size || '').trim().slice(0, 20);

  const rows = Array.from({ length: quantity }, (_, i) => ({
    code: newCode(),
    serial: `HW-${batch}-${String(i + 1).padStart(4, '0')}`,
    product_id: input.productId,
    color,
    size,
    batch,
  }));

  const inserted = unwrap(await db().from('product_units').insert(rows).select('*'), 'Kodlar yaradılmadı');
  const units = (inserted || []).map(rowToUnit).sort((a: ProductUnit, b: ProductUnit) => a.serial.localeCompare(b.serial));
  return { batch, units };
}

/** Print batches, newest first. */
export async function listBatches(): Promise<UnitBatch[]> {
  const rows = unwrap(
    await db()
      .from('product_units')
      .select('batch, product_id, color, size, status, scan_count, created_at')
      .order('created_at', { ascending: false })
      .limit(20000),
    'Partiyalar oxunmadı'
  );
  const map = new Map<string, UnitBatch>();
  for (const r of rows || []) {
    let b = map.get(r.batch);
    if (!b) {
      b = { batch: r.batch, productId: r.product_id, color: r.color, size: r.size, count: 0, scanned: 0, voided: 0, createdAt: r.created_at };
      map.set(r.batch, b);
    }
    b.count += 1;
    if (r.scan_count > 0) b.scanned += 1;
    if (r.status === 'void') b.voided += 1;
  }
  return Array.from(map.values());
}

export async function listBatchUnits(batch: string): Promise<ProductUnit[]> {
  const rows = unwrap(
    await db().from('product_units').select('*').eq('batch', batch).order('serial', { ascending: true }),
    'Kodlar oxunmadı'
  );
  return (rows || []).map(rowToUnit);
}

/** Finds a unit by its code or its printed serial (for the admin search). */
export async function findUnit(query: string): Promise<ProductUnit | null> {
  const q = String(query || '').trim();
  if (!q) return null;
  const code = normalizeCode(q);
  const res = CODE_RE.test(code)
    ? await db().from('product_units').select('*').eq('code', code).maybeSingle()
    : await db().from('product_units').select('*').eq('serial', q.toUpperCase()).maybeSingle();
  const row = unwrap(res, 'Kod axtarılmadı');
  return row ? rowToUnit(row) : null;
}

export async function setUnitStatus(id: string, status: 'active' | 'void'): Promise<ProductUnit | null> {
  if (!isUuid(id)) return null;
  const row = unwrap(
    await db().from('product_units').update({ status }).eq('id', id).select('*').maybeSingle(),
    'Kodun statusu dəyişmədi'
  );
  return row ? rowToUnit(row) : null;
}

/** Pseudonymous visitor id: an HMAC of the IP with a server secret, so the raw IP is never stored. */
export function visitorId(ip: string): string {
  const secret = `${process.env.ADMIN_JWT_SECRET || 'horwalle'}:unit-scan`;
  return crypto.createHmac('sha256', secret).update(ip || 'unknown').digest('hex').slice(0, 16);
}

/**
 * Looks a code up for the public page. When `count` is true the visit is recorded
 * (once per visitor per day); link-preview bots pass false.
 */
export async function checkUnit(
  code: string,
  visit: { count: boolean; country: string; city: string; visitor: string }
): Promise<ScanResult | null> {
  if (!CODE_RE.test(code)) return null;

  let unit: ProductUnit | null;
  if (visit.count) {
    const rows = unwrap(
      await db().rpc('register_unit_scan', {
        p_code: code,
        p_country: visit.country,
        p_city: visit.city,
        p_visitor: visit.visitor,
      }),
      'Kod yoxlanılmadı'
    ) as any[] | null;
    unit = rows && rows[0] ? rowToUnit(rows[0]) : null;
  } else {
    unit = await findUnit(code);
  }
  if (!unit) return null;

  const scans = unwrap(
    await db().from('unit_scans').select('visitor, country').eq('unit_id', unit.id).limit(1000),
    'Yoxlamalar oxunmadı'
  );
  const visitors = new Set((scans || []).map((s: any) => s.visitor)).size;
  const countries = new Set((scans || []).map((s: any) => s.country).filter(Boolean)).size;
  return { unit, visitors, countries };
}
