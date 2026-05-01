import { NextResponse } from 'next/server';
import type { FormPayload } from '@/types/form-payload';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { sendFormSubmissionEmail } from '@/lib/sendFormEmail';
import { prisma } from '@/lib/prisma';

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

    // Persist (so admin can see contact form submissions in the notification bell)
    try {
      const v = body.values as Record<string, string | undefined>;
      const name = (v.name || v.fullName || v.firstName || v.organization || 'Contact').toString().slice(0, 200);
      const email = (v.email || '').toString().slice(0, 200);
      const messageParts: string[] = [];
      if (body.type !== 'contact') messageParts.push(`[${body.type}]`);
      for (const [k, val] of Object.entries(body.values)) {
        if (k === 'name' || k === 'email') continue;
        if (val == null || val === '') continue;
        messageParts.push(`${k}: ${val}`);
      }
      const message = messageParts.join('\n').slice(0, 4000) || '(no content)';
      if (email) {
        await prisma.contactMessage.create({ data: { name, email, message } });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[forms] DB persist failed (non-blocking)', e);
    }

    return NextResponse.json({ ok: true, message: 'submission_received' });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
