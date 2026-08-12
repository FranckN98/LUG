import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function signingSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function sign(payload: string): string {
  return createHmac('sha256', signingSecret()).update(payload).digest('base64url');
}

export function createAdminSession(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function isValidSession(value: string | undefined): boolean {
  if (!value || !signingSecret()) return false;
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra) return false;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: unknown };
    return typeof parsed.exp === 'number' && parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/**
 * Single source of truth for admin session validation.
 *
 * The `/api/admin/**` routes are NOT protected by `src/middleware.ts`
 * (its matcher excludes `/api`), so every admin route handler must call
 * `requireAdmin()` (or check `isAdmin()`) before performing any work.
 */
export function isAdmin(): boolean {
  return isValidSession(cookies().get(SESSION_COOKIE)?.value);
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
