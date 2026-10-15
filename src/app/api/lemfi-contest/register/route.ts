import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { LEMFI_MAX_PROOF_BYTES } from '@/config/lemfiContest';
import { getLemfiCopy, resolveLemfiLocale, type LemfiErrorKey } from '@/content/lemfi-contest';
import { hashProof, isContestFull, registerEntry } from '@/lib/lemfiContest';
import { deliverConfirmation, type EmailStatus } from '@/lib/lemfiContestDelivery';
import { trackingUrl } from '@/lib/lemfiContestEmail';
import {
  cleanPersonName,
  detectProofMime,
  formatLemfiNumber,
  isValidEmail,
  isValidSubmissionKey,
  normalizeEmail,
} from '@/lib/lemfiContestUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function POST(req: NextRequest) {
  const locale = resolveLemfiLocale(req.nextUrl.searchParams.get('locale'));
  const copy = getLemfiCopy(locale);
  const fail = (status: number, code: string, key: LemfiErrorKey, field?: string) =>
    NextResponse.json({ ok: false, code, error: copy.errors[key], field }, { status, headers: NO_STORE });

  const ip = getClientIp(req);
  const limit = rateLimit({ key: 'lemfi-register', id: ip, windowMs: 10 * 60_000, max: 6, blockMs: 10 * 60_000 });
  if (!limit.allowed) return fail(429, 'rate_limited', 'rate_limited');

  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > LEMFI_MAX_PROOF_BYTES + 512 * 1024) return fail(413, 'file_too_large', 'file_too_large', 'proof');

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'invalid_request', 'invalid_request');
  }

  // Champ piège : invisible pour les personnes, rempli par les robots.
  if (String(form.get('website') ?? '').trim() !== '') return fail(400, 'invalid_request', 'invalid_request');

  const turnstileConfigured = Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );
  if (turnstileConfigured) {
    const ok = await verifyTurnstileToken(String(form.get('captchaToken') ?? '') || undefined);
    if (!ok) return fail(400, 'captcha', 'captcha');
  }

  const firstName = cleanPersonName(String(form.get('firstName') ?? ''));
  if (!firstName) return fail(400, 'invalid_field', 'first_name', 'firstName');
  const lastName = cleanPersonName(String(form.get('lastName') ?? ''));
  if (!lastName) return fail(400, 'invalid_field', 'last_name', 'lastName');

  const email = normalizeEmail(String(form.get('email') ?? ''));
  if (!isValidEmail(email)) return fail(400, 'invalid_field', 'email', 'email');

  if (String(form.get('consent') ?? '') !== 'true') return fail(400, 'consent_required', 'consent', 'consent');

  const submissionKey = form.get('submissionKey');
  if (!isValidSubmissionKey(submissionKey)) return fail(400, 'invalid_request', 'invalid_request');

  const file = form.get('proof');
  if (!(file instanceof File) || file.size === 0) return fail(400, 'proof_required', 'proof_required', 'proof');
  if (file.size > LEMFI_MAX_PROOF_BYTES) return fail(413, 'file_too_large', 'file_too_large', 'proof');
  const data = Buffer.from(await file.arrayBuffer());
  const mimeType = detectProofMime(data);
  if (!mimeType) return fail(400, 'file_type', 'file_type', 'proof');

  if (await isContestFull()) return fail(409, 'full', 'full');

  let result;
  try {
    result = await registerEntry({
      firstName,
      lastName,
      email,
      submissionKey,
      locale,
      proof: { data, mimeType, hash: hashProof(data) },
    });
  } catch (e) {
    console.error('[lemfi] register failed', e instanceof Error ? e.name : 'unknown');
    return fail(500, 'server_error', 'server_error');
  }

  if (result.kind === 'full') return fail(409, 'full', 'full');
  if (result.kind === 'email_taken') return fail(409, 'email_taken', 'email_taken', 'email');

  const { entry } = result;
  let emailStatus: EmailStatus = 'sent';
  if (!entry.emailSentAt) emailStatus = await deliverConfirmation(entry);

  return NextResponse.json(
    {
      ok: true,
      number: formatLemfiNumber(entry.sequentialNumber),
      token: entry.accessToken,
      trackUrl: trackingUrl(entry.accessToken, locale),
      emailStatus,
      alreadyRegistered: result.kind === 'existing',
    },
    { status: result.kind === 'created' ? 201 : 200, headers: NO_STORE },
  );
}
