import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { checkSubscribeRateLimit } from '@/lib/subscribe-rate-limit';
import { parseNameFromEmail } from '@/lib/emailName';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      consent?: boolean;
      website?: string; // honeypot
      locale?: string;
    };

    if (body.website) {
      return NextResponse.json({ ok: false, error: 'blocked' }, { status: 429 });
    }

    const email = normalizeEmail(body.email ?? '');
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }

    const h = headers();
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
    if (!checkSubscribeRateLimit(ip)) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }

    const consent = Boolean(body.consent);
    const parsedName = parseNameFromEmail(email);
    const source = 'footer_newsletter';
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
          tags: `newsletter,locale:${detectedLocale}`,
        },
      });
    } else {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          consent: consent || existing.consent,
          ...(existing.locale ? {} : { locale: detectedLocale }),
          ...(existing.firstName || existing.lastName
            ? {}
            : {
                name: existing.name ?? parsedName.fullName,
                firstName: parsedName.firstName,
                lastName: parsedName.lastName,
              }),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[newsletter-subscribe]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
