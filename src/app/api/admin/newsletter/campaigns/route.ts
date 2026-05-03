import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  type CampaignLocale,
  normalizeCampaignTranslations,
  pickLegacyMirror,
} from '@/lib/newsletterCampaignI18n';
import { normalizeAttachmentsInput } from '@/lib/newsletterAttachments';

export async function GET() {
  const campaigns = await prisma.newsletterCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      translations: true,
      attachments: { orderBy: { position: 'asc' } },
    },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    headerImageUrl,
    campaignImageUrl,
    ctaUrl,
    translations: translationsInput,
    attachments: attachmentsInput,
    // legacy single-locale payload (kept for backwards compatibility)
    subject,
    previewText,
    titleText,
    bodyContent,
    ctaLabel,
    footerNote,
  } = body ?? {};

  // Prefer explicit `translations` object; otherwise map legacy single-locale payload onto FR.
  const translationsObject =
    translationsInput && typeof translationsInput === 'object'
      ? (translationsInput as Partial<Record<CampaignLocale, Record<string, string>>>)
      : (subject || bodyContent
          ? { fr: { subject, previewText, titleText, bodyContent, ctaLabel, footerNote } }
          : {});

  const translations = normalizeCampaignTranslations(translationsObject);
  if (translations.length === 0) {
    return NextResponse.json(
      { error: "Au moins une langue avec sujet et corps est requise" },
      { status: 400 },
    );
  }

  const mirror = pickLegacyMirror(translations);
  if (!mirror) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const normalizedAttachments = normalizeAttachmentsInput(attachmentsInput);

  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject: mirror.subject,
      previewText: mirror.previewText,
      titleText: mirror.titleText,
      bodyContent: mirror.bodyContent,
      ctaLabel: mirror.ctaLabel,
      footerNote: mirror.footerNote,
      headerImageUrl: typeof headerImageUrl === 'string' ? headerImageUrl.trim() || null : null,
      campaignImageUrl: typeof campaignImageUrl === 'string' ? campaignImageUrl.trim() || null : null,
      ctaUrl: typeof ctaUrl === 'string' ? ctaUrl.trim() || null : null,
      status: 'draft',
      translations: {
        create: translations.map((t) => ({
          locale: t.locale,
          subject: t.subject,
          previewText: t.previewText ?? null,
          titleText: t.titleText ?? null,
          bodyContent: t.bodyContent,
          ctaLabel: t.ctaLabel ?? null,
          footerNote: t.footerNote ?? null,
        })),
      },
      attachments: normalizedAttachments.length
        ? {
            create: normalizedAttachments.map((a, i) => ({
              filename: a.filename,
              url: a.url,
              contentType: a.contentType ?? null,
              size: a.size ?? null,
              position: i,
            })),
          }
        : undefined,
    },
    include: {
      translations: true,
      attachments: { orderBy: { position: 'asc' } },
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}

