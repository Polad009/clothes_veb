import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { adminTokenRole, adminTokenUser, type AdminRole } from '@/lib/adminAuth';
import { staffExists } from '@/lib/adminCredentials';

/** True when the current request carries a valid admin session cookie. */
export function hasAdminSession(): boolean {
  return adminTokenRole(cookies().get('horvvalle_admin_token')?.value) !== null;
}

/** Role of a token, or null when it is invalid or belongs to a staff account that was removed. */
async function activeRole(token: string | undefined | null): Promise<AdminRole | null> {
  const role = adminTokenRole(token);
  if (role !== 'staff') return role;
  return (await staffExists(adminTokenUser(token) || '').catch(() => false)) ? 'staff' : null;
}

/** Role of the signed-in admin on a server page. */
export async function currentAdminRole(): Promise<AdminRole | null> {
  return activeRole(cookies().get('horvvalle_admin_token')?.value);
}

/** Role behind an API request (cookie or header token). */
export async function requestAdminRole(req: NextRequest): Promise<AdminRole | null> {
  const header = req.headers.get('authorization') || '';
  const bearer = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  const token = [bearer, req.headers.get('x-admin-token') || '', req.cookies.get('horvvalle_admin_token')?.value || '']
    .find((t) => t && adminTokenRole(t) !== null);
  return activeRole(token);
}

/**
 * Guard for admin server pages. The middleware already blocks strangers;
 * this is the second lock, so a page can never render admin data on its own.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await currentAdminRole())) notFound();
}

/** Owner-only pages: staff are sent back to the orders list. */
export async function requireOwner(): Promise<void> {
  const role = await currentAdminRole();
  if (!role) notFound();
  if (role !== 'owner') redirect('/admin/orders');
}
