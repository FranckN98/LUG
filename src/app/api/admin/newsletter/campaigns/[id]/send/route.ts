import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCampaignEmail } from '@/lib/sendCampaignEmail';
import { parseNameFromEmail } from '@/lib/emailName';
import { pickCampaignTranslation } from '@/lib/newsletterCampaignI18n';

/**
 * Best-effort first name resolution for a newsletter subscriber.
 * Order: stored `firstName` → first token of stored `name` → derived from email local-part.
 * Returns null if nothing usable is found (recipient will get a neutral greeting).
 */
function resolveFirstName(sub: { email: string; firstName: string | null; name: string | null }): string | null {
  if (sub.firstName && sub.firstName.trim()) return sub.firstName.trim();
  if (sub.name && sub.name.trim()) {
    const first = sub.name.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return parseNameFromEmail(sub.email).firstName;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(req.url);
  const testEmail = searchParams.get('testEmail')?.trim();
  const testLocale = searchParams.get('testLocale')?.trim() || 'fr';

  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id: params.id },
    include: { translations: true },
  });
  if (!campaign) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });

  if (campaign.status === 'sent' && !testEmail) {
    return NextResponse.json({ error: 'Cette campagne a déjà été envoyée' }, { status: 400 });
  }

  const siteBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.levelupingermany.com';

  // Build per-locale content (subject/body/title/etc. come from translation; images & CTA URL are shared scalars)
  const buildContentFor = (locale: string) => {
    const tr = pickCampaignTranslation(
      {
        subject: campaign.subject,
        previewText: campaign.previewText,
        titleText: campaign.titleText,
        bodyContent: campaign.bodyContent,
        ctaLabel: campaign.ctaLabel,
        footerNote: campaign.footerNote,
        translations: campaign.translations,
      },
      locale,
    );
    return {
      subject: tr.subject,
      previewText: tr.previewText ?? undefined,
      titleText: tr.titleText ?? undefined,
      bodyContent: tr.bodyContent,
      headerImageUrl: campaign.headerImageUrl ?? undefined,
      campaignImageUrl: campaign.campaignImageUrl ?? undefined,
      ctaLabel: tr.ctaLabel ?? undefined,
      ctaUrl: campaign.ctaUrl ?? undefined,
      footerNote: tr.footerNote ?? undefined,
    };
  };

  // ── Test send ──
  if (testEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: 'Email de test invalide' }, { status: 400 });
    }
    const testContent = buildContentFor(testLocale);
    await sendCampaignEmail({
      toEmail: testEmail,
      unsubscribeToken: 'preview-only',
      siteBaseUrl,
      content: { ...testContent, subject: `[TEST ${testLocale.toUpperCase()}] ${testContent.subject}` },
      recipientFirstName: resolveFirstName({ email: testEmail, firstName: null, name: null }),
    });

    return NextResponse.json({ ok: true, testOnly: true, locale: testLocale });
  }

  // ── Real send ──
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: 'active' },
    select: { id: true, email: true, unsubscribeToken: true, firstName: true, name: true, locale: true },
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    try {
      const subLocale = sub.locale ?? 'fr';
      await sendCampaignEmail({
        toEmail: sub.email,
        unsubscribeToken: sub.unsubscribeToken ?? sub.id,
        siteBaseUrl,
        content: buildContentFor(subLocale),
        recipientFirstName: resolveFirstName(sub),
      });
      sentCount++;
    } catch (err) {
      errors.push(`${sub.email}: ${String(err)}`);
    }
  }

  await prisma.newsletterCampaign.update({
    where: { id: params.id },
    data: { status: 'sent', sentAt: new Date(), sentCount },
  });

  return NextResponse.json({
    ok: true,
    sentCount,
    ...(errors.length > 0 && { errors }),
  });
}
