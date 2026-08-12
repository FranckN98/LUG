import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { createAdminSession } from '@/lib/adminAuth';

/**
 * Constant-time string comparison to avoid timing side-channels on the
 * admin password check.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  // Brute-force protection: 5 attempts per 15 min per IP, then 15 min lock.
  const ip = getClientIp(req);
  const limit = rateLimit({
    key: 'admin-login',
    id: ip,
    windowMs: 15 * 60 * 1000,
    max: 5,
    blockMs: 15 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === 'string' ? body.email : undefined;
    password = typeof body?.password === 'string' ? body.password : undefined;
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
  }

  const expectedEmail = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? '';
  if (!expectedEmail || !expectedPassword) {
    return NextResponse.json({ error: 'Service indisponible.' }, { status: 503 });
  }

  const validEmail = timingSafeEqual(email.toLowerCase().trim(), expectedEmail);
  const validPassword = timingSafeEqual(password, expectedPassword);

  if (!validEmail || !validPassword) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_session', createAdminSession(), {
    httpOnly: true,
    // Always secure — admin must only be used over HTTPS.
    secure: true,
    // Strict prevents the cookie from being sent on cross-site requests,
    // which neutralises CSRF on every admin-only mutation.
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
  return res;
}
