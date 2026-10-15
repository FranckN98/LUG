import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { LEMFI_MAX_PROOF_BYTES } from '@/config/lemfiContest';
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

function fail(status: number, code: string, error: string, field?: string) {
  return NextResponse.json({ ok: false, code, error, field }, { status, headers: NO_STORE });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit({ key: 'lemfi-register', id: ip, windowMs: 10 * 60_000, max: 6, blockMs: 10 * 60_000 });
  if (!limit.allowed) {
    return fail(429, 'rate_limited', 'Trop de tentatives. Patientez quelques minutes avant de réessayer.');
  }

  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > LEMFI_MAX_PROOF_BYTES + 512 * 1024) {
    return fail(413, 'file_too_large', 'Fichier trop lourd. La taille maximale est de 5 Mo.', 'proof');
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'invalid_request', "Le formulaire n'a pas pu être lu. Réessayez.");
  }

  // Champ piège : invisible pour les personnes, rempli par les robots.
  if (String(form.get('website') ?? '').trim() !== '') {
    return fail(400, 'invalid_request', "Le formulaire n'a pas pu être lu. Réessayez.");
  }

  const turnstileConfigured = Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );
  if (turnstileConfigured) {
    const ok = await verifyTurnstileToken(String(form.get('captchaToken') ?? '') || undefined);
    if (!ok) return fail(400, 'captcha', 'La vérification anti-robot a échoué. Réessayez.');
  }

  const firstName = cleanPersonName(String(form.get('firstName') ?? ''));
  if (!firstName) return fail(400, 'invalid_field', 'Indiquez un prénom valide.', 'firstName');
  const lastName = cleanPersonName(String(form.get('lastName') ?? ''));
  if (!lastName) return fail(400, 'invalid_field', 'Indiquez un nom valide.', 'lastName');

  const email = normalizeEmail(String(form.get('email') ?? ''));
  if (!isValidEmail(email)) return fail(400, 'invalid_field', 'Indiquez une adresse e-mail valide.', 'email');

  if (String(form.get('consent') ?? '') !== 'true') {
    return fail(400, 'consent_required', 'Cochez la case de confirmation pour participer.', 'consent');
  }

  const submissionKey = form.get('submissionKey');
  if (!isValidSubmissionKey(submissionKey)) {
    return fail(400, 'invalid_request', "Le formulaire n'a pas pu être lu. Rechargez la page.");
  }

  const file = form.get('proof');
  if (!(file instanceof File) || file.size === 0) {
    return fail(400, 'proof_required', 'Ajoutez la capture de confirmation du transfert.', 'proof');
  }
  if (file.size > LEMFI_MAX_PROOF_BYTES) {
    return fail(413, 'file_too_large', 'Fichier trop lourd. La taille maximale est de 5 Mo.', 'proof');
  }
  const data = Buffer.from(await file.arrayBuffer());
  const mimeType = detectProofMime(data);
  if (!mimeType) {
    return fail(400, 'file_type', 'Format non accepté. Utilisez une image JPG, PNG ou WebP.', 'proof');
  }

  if (await isContestFull()) {
    return fail(409, 'full', 'Inscriptions complètes');
  }

  let result;
  try {
    result = await registerEntry({
      firstName,
      lastName,
      email,
      submissionKey,
      proof: { data, mimeType, hash: hashProof(data) },
    });
  } catch (e) {
    console.error('[lemfi] register failed', e instanceof Error ? e.name : 'unknown');
    return fail(500, 'server_error', "L'enregistrement a échoué. Vos informations sont conservées : réessayez dans un instant.");
  }

  if (result.kind === 'full') return fail(409, 'full', 'Inscriptions complètes');
  if (result.kind === 'email_taken') {
    return fail(409, 'email_taken', 'Cette adresse e-mail est déjà inscrite. Une seule participation est possible par adresse.', 'email');
  }

  const { entry } = result;
  let emailStatus: EmailStatus = 'sent';
  if (!entry.emailSentAt) emailStatus = await deliverConfirmation(entry);

  return NextResponse.json(
    {
      ok: true,
      number: formatLemfiNumber(entry.sequentialNumber),
      token: entry.accessToken,
      trackUrl: trackingUrl(entry.accessToken),
      emailStatus,
      alreadyRegistered: result.kind === 'existing',
    },
    { status: result.kind === 'created' ? 201 : 200, headers: NO_STORE },
  );
}
