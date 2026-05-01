import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ALLOWED = new Set([
  'page_view',
  'ticket_button_click',
  'newsletter_signup',
  'contact_form_submit',
  'sponsor_form_submit',
  'member_registration',
  'event_popup_email_submit',
  'partner_button_click',
  'speaker_apply_click',
  'blog_like',
  'blog_share',
  'cta_click',
]);

function hashIp(ip: string, salt: string): string {
  // Lightweight, non-reversible hash. We never store the raw IP.
  let h = 0;
  const s = `${salt}|${ip}`;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return `v_${(h >>> 0).toString(36)}`;
}

function detectDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/Mobi|Android.+Mobile|iPhone|iPod/i.test(ua)) return 'mobile';
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  return 'desktop';
}

function clip(value: unknown, max = 200): string | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.trim();
  return v ? v.slice(0, max) : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      name?: string;
      page?: string;
      locale?: string;
      referrer?: string | null;
      utm?: Record<string, string | undefined>;
      source?: string;
      sessionId?: string;
      properties?: Record<string, unknown>;
    } | null;

    if (!body || !body.name || !ALLOWED.has(body.name)) {
      return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 });
    }

    const ua = req.headers.get('user-agent') || '';
    // x-forwarded-for falls back to req.ip on edge runtimes; here we only need a stable salt input.
    const ipRaw =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const today = new Date().toISOString().slice(0, 10); // rotate hash daily for unlinkability
    const visitorHash = hashIp(ipRaw, today);

    const country =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      undefined;

    let propsString: string | undefined;
    if (body.properties && typeof body.properties === 'object') {
      try {
        propsString = JSON.stringify(body.properties).slice(0, 2000);
      } catch {
        propsString = undefined;
      }
    }

    await prisma.analyticsEvent.create({
      data: {
        name: body.name,
        page: clip(body.page),
        locale: clip(body.locale, 10),
        referrer: clip(body.referrer ?? undefined, 300),
        utmSource: clip(body.utm?.utm_source, 120),
        utmMedium: clip(body.utm?.utm_medium, 120),
        utmCampaign: clip(body.utm?.utm_campaign, 120),
        utmTerm: clip(body.utm?.utm_term, 120),
        utmContent: clip(body.utm?.utm_content, 120),
        source: clip(body.source, 60),
        visitorHash,
        sessionId: clip(body.sessionId, 80),
        country: clip(country, 4),
        device: detectDevice(ua),
        properties: propsString,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api/analytics]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
