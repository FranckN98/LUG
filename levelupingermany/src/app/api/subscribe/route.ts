import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { EventEdition } from '@/content/events';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { prisma } from '@/lib/prisma';
import { sendNewsletterPdfEmail } from '@/lib/sendNewsletterPdfEmail';
import { EVENT_PDF_PATH, EVENT_SOURCE_LABEL, absolutePdfUrl } from '@/lib/event-pdf-config';
import { checkSubscribeRateLimit } from '@/lib/subscribe-rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_COMPLETION_MS = 600;

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

function isEdition(v: unknown): v is EventEdition {
  return v === '2025' || v === '2026';
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      edition?: string;
      consent?: boolean;
      captchaToken?: string;
      website?: string;
      startedAt?: number;
      submittedAt?: number;
    };

    if (body.website) {
      return NextResponse.json({ ok: false, error: 'blocked' }, { status: 429 });
    }

    const started = body.startedAt ?? 0;
    const submitted = body.submittedAt ?? Date.now();
    if (submitted - started < MIN_COMPLETION_MS) {
      return NextResponse.json({ ok: false, error: 'blocked' }, { status: 429 });
    }

    const email = normalizeEmail(body.email ?? '');
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }

    const edition: EventEdition = isEdition(body.edition) ? body.edition : '2025';
    const pdfPath = EVENT_PDF_PATH[edition];
    const source = EVENT_SOURCE_LABEL[edition];

    const h = headers();
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
    if (!checkSubscribeRateLimit(ip)) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }

    const turnstileConfigured = Boolean(
      process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
    );
    if (turnstileConfigured) {
      const captchaOk = await verifyTurnstileToken(body.captchaToken);
      if (!captchaOk) {
        return NextResponse.json({ ok: false, error: 'captcha_failed' }, { status: 400 });
      }
    }

    const consent = Boolean(body.consent);

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (!existing) {
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          source,
          consent,
          tags: 'levelup_event',
        },
      });
    } else if (consent && !existing.consent) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { consent: true },
      });
    }

    const pdfAbsolute = absolutePdfUrl(pdfPath);
    await sendNewsletterPdfEmail(email, pdfAbsolute);

    return NextResponse.json({ ok: true, pdfPath });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'email_not_configured') {
      return NextResponse.json({ ok: false, error: 'email_not_configured' }, { status: 503 });
    }
    if (msg.startsWith('resend_failed')) {
      return NextResponse.json({ ok: false, error: 'email_send_failed' }, { status: 502 });
    }
    // Prisma / DB (ex. DATABASE_URL manquant ou fichier SQLite illisible)
    // eslint-disable-next-line no-console
    console.error('[subscribe]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
