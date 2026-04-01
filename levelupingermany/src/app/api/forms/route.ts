import { NextResponse } from 'next/server';
import type { FormPayload } from '@/types/form-payload';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { sendFormSubmissionEmail } from '@/lib/sendFormEmail';

const MIN_COMPLETION_MS = 800;

function isLikelySpam(payload: FormPayload) {
  if (payload.meta.honeypot) return true;
  if (!payload.meta.consent) return true;
  const elapsed = payload.meta.submittedAt - payload.meta.startedAt;
  if (elapsed < MIN_COMPLETION_MS) return true;
  return false;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FormPayload;

    if (!body?.type || !body?.values || !body?.meta) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
    }

    if (isLikelySpam(body)) {
      return NextResponse.json({ ok: false, error: 'blocked' }, { status: 429 });
    }

    const captchaOk = await verifyTurnstileToken(body.captchaToken);
    if (!captchaOk) {
      return NextResponse.json({ ok: false, error: 'captcha_failed' }, { status: 400 });
    }

    try {
      await sendFormSubmissionEmail(body);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'email_error';
      if (msg === 'email_not_configured') {
        return NextResponse.json({ ok: false, error: 'email_not_configured' }, { status: 503 });
      }
      // eslint-disable-next-line no-console
      console.error('[forms] email send failed', e);
      return NextResponse.json({ ok: false, error: 'email_send_failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, message: 'submission_received' });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
