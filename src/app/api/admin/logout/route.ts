import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const res = NextResponse.json({ success: true });
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const secureCookie = forwardedProto ? forwardedProto === 'https' : new URL(req.url).protocol === 'https:';
  res.cookies.set('admin_session', '', { httpOnly: true, secure: secureCookie, sameSite: 'strict', maxAge: 0, path: '/' });
  return res;
}
