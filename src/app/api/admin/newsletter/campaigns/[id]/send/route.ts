import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMultilingualCampaignEmail, type MultilingualSection } from '@/lib/sendCampaignEmail';
import { parseNameFromEmail } from '@/lib/emailName';
import { CAMPAIGN_LOCALES, type CampaignLocale, pickCampaignTranslation } from '@/lib/newsletterCampaignI18n';
import { resolveAttachmentsForResend } from '@/lib/newsletterAttachments';
import { getInlineLogoAttachment, loadHeaderImageAsInline } from '@/lib/emailLogoAttachment';

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
    include: {
      translations: true,
      attachments: { orderBy: { position: 'asc' } },
    },
  });
  if (!campaign) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });

  if (campaign.status === 'sent' && !testEmail) {
    return NextResponse.json({ error: 'Cette campagne a déjà été envoyée' }, { status: 400 });
  }

  const siteBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.levelupingermany.com';

  // Resolve attachments once (read URLs → base64) and reuse for every recipient
  const resolvedAttachments = await resolveAttachmentsForResend(
    campaign.attachments.map((a) => ({ filename: a.filename, url: a.url, size: a.size })),
    siteBaseUrl,
  );

  // Inline brand logo (cid:lug-logo) so it renders in clients that block
  // remote images. If the campaign has a custom header image (uploaded by
  // the admin), use that; otherwise fall back to the default brand logo.
  let inlineLogo = undefined;
  if (campaign.headerImageUrl) {
    inlineLogo = (await loadHeaderImageAsInline(campaign.headerImageUrl, siteBaseUrl)) ?? undefined;
    if (!inlineLogo) {
      console.warn('[newsletter] Custom header image could not be loaded, falling back to default logo:', campaign.headerImageUrl);
    }
  }
  if (!inlineLogo) {
    inlineLogo = (await getInlineLogoAttachment(siteBaseUrl)) ?? undefined;
  }

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

  // Determine which locales actually have a usable translation row
  const availableLocales: CampaignLocale[] = CAMPAIGN_LOCALES.filter((l) =>
    campaign.translations.some(
      (t) => t.locale === l && !!t.subject?.trim() && !!t.bodyContent?.trim(),
    ),
  );
  // If the campaign has no translation rows at all, fall back to FR using the legacy scalar fields
  const effectiveLocales: CampaignLocale[] = availableLocales.length > 0 ? availableLocales : ['fr'];

  /**
   * Build the ordered section list for one recipient: their preferred locale
   * comes first, then the rest (in canonical FR/EN/DE order).
   */
  const buildSectionsFor = (preferred: string): MultilingualSection[] => {
    const pref: CampaignLocale = (CAMPAIGN_LOCALES as readonly string[]).includes(preferred)
      ? (preferred as CampaignLocale)
      : 'fr';
    const ordered: CampaignLocale[] = [
      ...(effectiveLocales.includes(pref) ? [pref] : []),
      ...effectiveLocales.filter((l) => l !== pref),
    ];
    return ordered.map((locale) => ({ locale, content: buildContentFor(locale) }));
  };

  // ── Test send ──
  if (testEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: 'Email de test invalide' }, { status: 400 });
    }
    const sections = buildSectionsFor(testLocale);
    // Prefix the (primary) subject with [TEST]
    const primary = sections[0];
    const testedSections: MultilingualSection[] = [
      {
        locale: primary.locale,
        content: {
          ...primary.content,
          subject: `[TEST ${primary.locale.toUpperCase()}] ${primary.content.subject}`,
        },
      },
      ...sections.slice(1),
    ];
    try {
      await sendMultilingualCampaignEmail({
        toEmail: testEmail,
        unsubscribeToken: 'preview-only',
        siteBaseUrl,
        sections: testedSections,
        recipientFirstName: resolveFirstName({ email: testEmail, firstName: null, name: null }),
        attachments: resolvedAttachments,
        inlineLogo,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[newsletter] Test send failed:', message);
      return NextResponse.json(
        { error: `Échec de l’envoi du test : ${message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      testOnly: true,
      primaryLocale: primary.locale,
      includedLocales: sections.map((s) => s.locale),
    });
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
      await sendMultilingualCampaignEmail({
        toEmail: sub.email,
        unsubscribeToken: sub.unsubscribeToken ?? sub.id,
        siteBaseUrl,
        sections: buildSectionsFor(subLocale),
        recipientFirstName: resolveFirstName(sub),
        attachments: resolvedAttachments,
        inlineLogo,
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
