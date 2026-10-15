import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import { getLemfiCopy, resolveLemfiLocale } from '@/content/lemfi-contest';
import { getRegisteredEntryByToken } from '@/lib/lemfiContest';
import { deliverConfirmation } from '@/lib/lemfiContestDelivery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** Nouvelle tentative d'envoi de l'e-mail de confirmation, sans recréer de participation. */
export async function POST(req: NextRequest) {
  const copy = getLemfiCopy(resolveLemfiLocale(req.nextUrl.searchParams.get('locale')));

  const ip = getClientIp(req);
  const limit = rateLimit({ key: 'lemfi-resend', id: ip, windowMs: 10 * 60_000, max: 5, blockMs: 10 * 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: copy.errors.rate_limited }, { status: 429, headers: NO_STORE });
  }

  let token = '';
  try {
    const body = (await req.json()) as { token?: unknown };
    token = typeof body.token === 'string' ? body.token : '';
  } catch {
    /* corps invalide : traité comme un lien inconnu */
  }

  const entry = await getRegisteredEntryByToken(token);
  if (!entry) {
    return NextResponse.json({ ok: false, error: copy.errors.invalid_link }, { status: 404, headers: NO_STORE });
  }

  const tooSoon = entry.emailLastAttemptAt && Date.now() - entry.emailLastAttemptAt.getTime() < 15_000;
  if (tooSoon || entry.emailAttempts >= 8) {
    return NextResponse.json({ ok: false, error: copy.errors.resend_wait }, { status: 429, headers: NO_STORE });
  }

  const emailStatus = await deliverConfirmation(entry);
  return NextResponse.json({ ok: true, emailStatus }, { headers: NO_STORE });
}
