import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { verifyAdminToken } from '@/lib/adminAuth';

/** True when the current request carries a valid admin session cookie. */
export function hasAdminSession(): boolean {
  return verifyAdminToken(cookies().get('horvvalle_admin_token')?.value);
}

/**
 * Guard for admin server pages. The middleware already blocks strangers;
 * this is the second lock, so a page can never render admin data on its own.
 */
export function requireAdmin(): void {
  if (!hasAdminSession()) notFound();
}
