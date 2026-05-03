import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { prisma } from '@/lib/prisma';
import { sendNewsletterPdfEmail } from '@/lib/sendNewsletterPdfEmail';
import { EVENT_PDF_PATH, EVENT_SOURCE_LABEL, absolutePdfUrl } from '@/lib/event-pdf-config';
import { checkSubscribeRateLimit } from '@/lib/subscribe-rate-limit';
import { parseNameFromEmail } from '@/lib/emailName';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_COMPLETION_MS = 600;

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

function isKnownEdition(value: string): value is keyof typeof EVENT_PDF_PATH {
  return value === '2025' || value === '2026';
}

function isSafePdfPath(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  return /^https?:\/\//i.test(trimmed);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      edition?: string;
      pdfPath?: string;
      consent?: boolean;
      captchaToken?: string;
      website?: string;
      startedAt?: number;
      submittedAt?: number;
      locale?: string;
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
    const parsedName = parseNameFromEmail(email);

    const edition = typeof body.edition === 'string' && body.edition.trim() ? body.edition.trim() : '2025';
    const knownEdition = isKnownEdition(edition) ? edition : null;
    const pdfPath = isSafePdfPath(body.pdfPath)
      ? body.pdfPath.trim()
      : knownEdition
        ? EVENT_PDF_PATH[knownEdition]
        : EVENT_PDF_PATH['2025'];
    const source = knownEdition ? EVENT_SOURCE_LABEL[knownEdition] : `Event ${edition}`;

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

    const acceptLang = (h.get('accept-language') ?? '').toLowerCase();
    const detectedLocale: 'fr' | 'en' | 'de' =
      body.locale === 'de' || body.locale === 'fr' || body.locale === 'en'
        ? body.locale
        : acceptLang.startsWith('de')
          ? 'de'
          : acceptLang.startsWith('en')
            ? 'en'
            : 'fr';

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (!existing) {
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          name: parsedName.fullName,
          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          source,
          consent,
          locale: detectedLocale,
          tags: 'levelup_event',
        },
      });
    } else if (consent && !existing.consent) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          consent: true,
          ...(existing.locale ? {} : { locale: detectedLocale }),
        },
      });
    } else if (!existing.firstName && !existing.lastName && parsedName.firstName) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          name: existing.name ?? parsedName.fullName,
          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          ...(existing.locale ? {} : { locale: detectedLocale }),
        },
      });
    } else if (!existing.locale) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { locale: detectedLocale },
      });
    }

    const pdfAbsolute = /^https?:\/\//i.test(pdfPath) ? pdfPath : absolutePdfUrl(pdfPath);
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
