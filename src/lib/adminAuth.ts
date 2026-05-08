import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Single source of truth for admin session validation.
 *
 * The `/api/admin/**` routes are NOT protected by `src/middleware.ts`
 * (its matcher excludes `/api`), so every admin route handler must call
 * `requireAdmin()` (or check `isAdmin()`) before performing any work.
 */
export function isAdmin(): boolean {
  return cookies().get('admin_session')?.value === 'authenticated';
}

/**
 * Returns a 401 NextResponse if the request is not authenticated as admin,
 * otherwise returns null and the caller can continue.
 *
 * Usage:
 *   const unauth = requireAdmin();
 *   if (unauth) return unauth;
 */
export function requireAdmin(): NextResponse | null {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
