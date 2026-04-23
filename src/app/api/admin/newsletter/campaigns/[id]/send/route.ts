import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCampaignEmail } from '@/lib/sendCampaignEmail';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(req.url);
  const testEmail = searchParams.get('testEmail')?.trim();

  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: params.id } });
  if (!campaign) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });

  if (campaign.status === 'sent' && !testEmail) {
    return NextResponse.json({ error: 'Cette campagne a déjà été envoyée' }, { status: 400 });
  }

  const siteBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://levelupingermany.de';

  const content = {
    subject: campaign.subject,
    previewText: campaign.previewText ?? undefined,
    titleText: campaign.titleText ?? undefined,
    bodyContent: campaign.bodyContent,
    headerImageUrl: campaign.headerImageUrl ?? undefined,
    campaignImageUrl: campaign.campaignImageUrl ?? undefined,
    ctaLabel: campaign.ctaLabel ?? undefined,
    ctaUrl: campaign.ctaUrl ?? undefined,
    footerNote: campaign.footerNote ?? undefined,
  };

  // ── Test send ──
  if (testEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: 'Email de test invalide' }, { status: 400 });
    }

    await sendCampaignEmail({
      toEmail: testEmail,
      unsubscribeToken: 'preview-only',
      siteBaseUrl,
      content: { ...content, subject: `[TEST] ${content.subject}` },
    });

    return NextResponse.json({ ok: true, testOnly: true });
  }

  // ── Real send ──
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: 'active' },
    select: { id: true, email: true, unsubscribeToken: true },
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    try {
      await sendCampaignEmail({
        toEmail: sub.email,
        unsubscribeToken: sub.unsubscribeToken ?? sub.id,
        siteBaseUrl,
        content,
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
