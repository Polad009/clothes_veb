import crypto from 'crypto';
import { db, unwrap } from '@/lib/db/client';
import { verifyAdminCredentials } from '@/lib/adminAuth';

// Admin login details changed in the admin panel live in site_settings (server-only, RLS):
//   admin_auth   { username, passwordHash }   — replaces ADMIN_USERNAME / ADMIN_PASSWORD
//   admin_access { key }                      — replaces ADMIN_ACCESS_KEY (read by middleware.ts)
// Until something is saved there, the Vercel environment variables apply.

const AUTH_KEY = 'admin_auth';
export const ACCESS_SETTING_KEY = 'admin_access';
export const ACCESS_KEY_RE = /^[A-Za-z0-9_-]{8,64}$/;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function checkPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

async function readSetting(key: string): Promise<Record<string, any> | null> {
  const row = unwrap(await db().from('site_settings').select('value').eq('key', key).maybeSingle(), 'Admin məlumatı oxunmadı');
  return (row?.value as Record<string, any>) || null;
}

async function writeSetting(key: string, value: Record<string, any>) {
  unwrap(
    await db().from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    'Admin məlumatı yazılmadı'
  );
}

export async function currentAdminUsername(): Promise<string> {
  const stored = await readSetting(AUTH_KEY);
  return stored?.username || (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
}

export async function currentAccessKey(): Promise<string> {
  const stored = await readSetting(ACCESS_SETTING_KEY);
  return stored?.key || (process.env.ADMIN_ACCESS_KEY || '').trim();
}

/** Login check: the password saved in the admin panel wins; otherwise the Vercel values. */
export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  const stored = await readSetting(AUTH_KEY);
  if (stored?.passwordHash) {
    const userOk = String(username || '').trim().toLowerCase() === String(stored.username || '').toLowerCase();
    // Always run the hash so a wrong username takes as long as a wrong password
    const passOk = checkPassword(String(password || ''), stored.passwordHash);
    return userOk && passOk;
  }
  return verifyAdminCredentials(username, password);
}

export function passwordProblem(password: string): string | null {
  if (password.length < 10) return 'Şifrə ən azı 10 simvol olmalıdır.';
  if (password.length > 128) return 'Şifrə çox uzundur.';
  if (!/[A-Za-zƏəÖöÜüĞğİıŞşÇç]/.test(password) || !/\d/.test(password)) return 'Şifrədə həm hərf, həm rəqəm olsun.';
  return null;
}

export async function changeAdminPassword(input: { currentPassword: string; username: string; newPassword: string }) {
  const currentUser = await currentAdminUsername();
  if (!(await verifyAdminLogin(currentUser, input.currentPassword))) throw new Error('Hazırkı şifrə yanlışdır.');

  const username = String(input.username || '').trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) throw new Error('İstifadəçi adı 3–32 simvol: latın hərfləri, rəqəm, nöqtə, tire.');
  const problem = passwordProblem(String(input.newPassword || ''));
  if (problem) throw new Error(problem);

  await writeSetting(AUTH_KEY, { username, passwordHash: hashPassword(input.newPassword) });
}

export async function changeAccessKey(input: { currentPassword: string; accessKey: string }) {
  const currentUser = await currentAdminUsername();
  if (!(await verifyAdminLogin(currentUser, input.currentPassword))) throw new Error('Hazırkı şifrə yanlışdır.');
  const key = String(input.accessKey || '').trim();
  if (!ACCESS_KEY_RE.test(key)) throw new Error('Link kodu 8–64 simvol olmalıdır: latın hərfləri, rəqəm, tire, alt xətt.');
  await writeSetting(ACCESS_SETTING_KEY, { key });
}

// ─── Staff accounts ──────────────────────────────────────────────────────────
// site_settings.admin_staff { users: [{ username, name, passwordHash, createdAt }] }
// Staff see orders, print jobs, live chat and products; everything else is owner-only.

const STAFF_KEY = 'admin_staff';
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

export interface StaffUser { username: string; name: string; createdAt: string }

async function readStaff(): Promise<(StaffUser & { passwordHash: string })[]> {
  const stored = await readSetting(STAFF_KEY);
  return Array.isArray(stored?.users) ? stored!.users : [];
}

export async function listStaff(): Promise<StaffUser[]> {
  return (await readStaff()).map(({ username, name, createdAt }) => ({ username, name, createdAt }));
}

export async function staffExists(username: string): Promise<boolean> {
  const u = String(username || '').trim().toLowerCase();
  return (await readStaff()).some((s) => s.username === u);
}

/** Owner or staff login. Returns the role, or null when the details are wrong. */
export async function verifyAnyAdminLogin(username: string, password: string): Promise<'owner' | 'staff' | null> {
  if (await verifyAdminLogin(username, password)) return 'owner';
  const u = String(username || '').trim().toLowerCase();
  const staff = (await readStaff()).find((s) => s.username === u);
  if (staff && checkPassword(String(password || ''), staff.passwordHash)) return 'staff';
  return null;
}

export async function addStaff(input: { currentPassword: string; username: string; name: string; password: string }) {
  const owner = await currentAdminUsername();
  if (!(await verifyAdminLogin(owner, input.currentPassword))) throw new Error('Hazırkı şifrə yanlışdır.');
  const username = String(input.username || '').trim().toLowerCase();
  if (!USERNAME_RE.test(username)) throw new Error('İstifadəçi adı 3–32 simvol: latın hərfləri, rəqəm, nöqtə, tire.');
  if (username === owner) throw new Error('Bu ad sahibin hesabındadır.');
  const problem = passwordProblem(String(input.password || ''));
  if (problem) throw new Error(problem);
  const users = await readStaff();
  if (users.some((s) => s.username === username)) throw new Error('Bu istifadəçi adı artıq var.');
  if (users.length >= 20) throw new Error('Ən çox 20 işçi hesabı ola bilər.');
  users.push({ username, name: String(input.name || '').trim().slice(0, 60) || username, passwordHash: hashPassword(input.password), createdAt: new Date().toISOString() });
  await writeSetting(STAFF_KEY, { users });
}

export async function removeStaff(input: { currentPassword: string; username: string }) {
  const owner = await currentAdminUsername();
  if (!(await verifyAdminLogin(owner, input.currentPassword))) throw new Error('Hazırkı şifrə yanlışdır.');
  const username = String(input.username || '').trim().toLowerCase();
  const users = await readStaff();
  await writeSetting(STAFF_KEY, { users: users.filter((s) => s.username !== username) });
}
