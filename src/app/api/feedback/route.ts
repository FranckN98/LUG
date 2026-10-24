import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { feedbackCopy } from '@/content/feedback';
import { submitFeedback } from '@/lib/feedback';
import { parseFeedbackBody } from '@/lib/feedbackUtils';
import { getClientIp, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 30_000;
const NO_STORE = { 'Cache-Control': 'no-store' };

// L'adresse IP ne sert qu'à limiter les essais, en mémoire : hachée avec un sel propre au processus, jamais écrite.
const SALT = randomBytes(16).toString('hex');
const limiterId = (req: Request) => createHash('sha256').update(SALT + getClientIp(req)).digest('hex').slice(0, 24);

const fail = (status: number, error: string, field?: string) =>
  NextResponse.json({ error, field }, { status, headers: NO_STORE });

export async function POST(req: NextRequest) {
  const limit = rateLimit({ key: 'feedback-submit', id: limiterId(req), windowMs: 15 * 60_000, max: 12, blockMs: 15 * 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: feedbackCopy.errors.rateLimited },
      { status: 429, headers: { ...NO_STORE, 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return fail(413, feedbackCopy.errors.tooLong);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, feedbackCopy.errors.generic);
  }

  // Champ piège invisible pour les personnes : un robot qui le remplit reçoit un faux succès, rien n'est enregistré.
  if (typeof body === 'object' && body !== null && (body as { website?: unknown }).website) {
    return NextResponse.json({ ok: true, newsletter: 'none' }, { headers: NO_STORE });
  }

  const parsed = parseFeedbackBody(body);
  if (!parsed.ok) {
    const message = parsed.code === 'invalid' ? feedbackCopy.errors.generic : feedbackCopy.errors[parsed.code];
    return fail(400, message, parsed.field);
  }

  const result = await submitFeedback(parsed.value);
  return NextResponse.json({ ok: true, newsletter: result.newsletter }, { headers: NO_STORE });
}
