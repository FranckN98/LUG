import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  CAMPAIGN_LOCALES,
  type CampaignLocale,
  normalizeCampaignTranslations,
  pickLegacyMirror,
} from '@/lib/newsletterCampaignI18n';
import { normalizeAttachmentsInput } from '@/lib/newsletterAttachments';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id: params.id },
    include: {
      translations: true,
      attachments: { orderBy: { position: 'asc' } },
    },
  });
  if (!campaign) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const {
    headerImageUrl,
    campaignImageUrl,
    ctaUrl,
    translations: translationsInput,
    attachments: attachmentsInput,
    // legacy single-locale fields
    subject,
    previewText,
    titleText,
    bodyContent,
    ctaLabel,
    footerNote,
  } = body ?? {};

  // Build translations payload
  const translationsObject =
    translationsInput && typeof translationsInput === 'object'
      ? (translationsInput as Partial<Record<CampaignLocale, Record<string, string>>>)
      : null;

  const translations = translationsObject ? normalizeCampaignTranslations(translationsObject) : null;

  // Attachments are managed as a full replacement when the key is present.
  const hasAttachmentsKey = Object.prototype.hasOwnProperty.call(body ?? {}, 'attachments');
  const normalizedAttachments = hasAttachmentsKey
    ? normalizeAttachmentsInput(attachmentsInput)
    : null;

  // Transactional update
  const updated = await prisma.$transaction(async (tx) => {
    // Scalar (shared) fields
    const scalarData: Record<string, unknown> = {};
    if (headerImageUrl !== undefined) scalarData.headerImageUrl = typeof headerImageUrl === 'string' ? (headerImageUrl.trim() || null) : null;
    if (campaignImageUrl !== undefined) scalarData.campaignImageUrl = typeof campaignImageUrl === 'string' ? (campaignImageUrl.trim() || null) : null;
    if (ctaUrl !== undefined) scalarData.ctaUrl = typeof ctaUrl === 'string' ? (ctaUrl.trim() || null) : null;

    // If translations were provided, upsert each locale and refresh legacy mirror
    if (translations) {
      for (const t of translations) {
        await tx.newsletterCampaignTranslation.upsert({
          where: { campaignId_locale: { campaignId: params.id, locale: t.locale } },
          create: {
            campaignId: params.id,
            locale: t.locale,
            subject: t.subject,
            previewText: t.previewText ?? null,
            titleText: t.titleText ?? null,
            bodyContent: t.bodyContent,
            ctaLabel: t.ctaLabel ?? null,
            footerNote: t.footerNote ?? null,
          },
          update: {
            subject: t.subject,
            previewText: t.previewText ?? null,
            titleText: t.titleText ?? null,
            bodyContent: t.bodyContent,
            ctaLabel: t.ctaLabel ?? null,
            footerNote: t.footerNote ?? null,
          },
        });
      }
      // Delete locales no longer present (let admin clear a language)
      const provided = new Set(translations.map((t) => t.locale));
      const orphaned = (CAMPAIGN_LOCALES as readonly CampaignLocale[]).filter(
        (l) => translationsObject && Object.prototype.hasOwnProperty.call(translationsObject, l) && !provided.has(l),
      );
      if (orphaned.length > 0) {
        await tx.newsletterCampaignTranslation.deleteMany({
          where: { campaignId: params.id, locale: { in: orphaned } },
        });
      }
      const mirror = pickLegacyMirror(translations);
      if (mirror) {
        scalarData.subject = mirror.subject;
        scalarData.previewText = mirror.previewText;
        scalarData.titleText = mirror.titleText;
        scalarData.bodyContent = mirror.bodyContent;
        scalarData.ctaLabel = mirror.ctaLabel;
        scalarData.footerNote = mirror.footerNote;
      }
    } else {
      // Legacy single-locale payload — write only what's provided onto scalar fields
      if (subject != null) scalarData.subject = String(subject).trim();
      if (previewText != null) scalarData.previewText = String(previewText).trim() || null;
      if (titleText != null) scalarData.titleText = String(titleText).trim() || null;
      if (bodyContent != null) scalarData.bodyContent = String(bodyContent).trim();
      if (ctaLabel != null) scalarData.ctaLabel = String(ctaLabel).trim() || null;
      if (footerNote != null) scalarData.footerNote = String(footerNote).trim() || null;
    }

    return tx.newsletterCampaign.update({
      where: { id: params.id },
      data: scalarData,
      include: {
        translations: true,
        attachments: { orderBy: { position: 'asc' } },
      },
    });
  });

  // Replace attachments outside the inner branch but still in the same transaction
  if (normalizedAttachments) {
    await prisma.$transaction(async (tx) => {
      await tx.newsletterCampaignAttachment.deleteMany({ where: { campaignId: params.id } });
      if (normalizedAttachments.length > 0) {
        await tx.newsletterCampaignAttachment.createMany({
          data: normalizedAttachments.map((a, i) => ({
            campaignId: params.id,
            filename: a.filename,
            url: a.url,
            contentType: a.contentType ?? null,
            size: a.size ?? null,
            position: i,
          })),
        });
      }
    });
    // Re-read with the fresh attachments
    const refreshed = await prisma.newsletterCampaign.findUnique({
      where: { id: params.id },
      include: {
        translations: true,
        attachments: { orderBy: { position: 'asc' } },
      },
    });
    return NextResponse.json(refreshed);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: params.id } });
  if (!campaign) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (campaign.status === 'sent') {
    return NextResponse.json(
      { error: 'Impossible de supprimer une campagne déjà envoyée' },
      { status: 400 },
    );
  }

  await prisma.newsletterCampaign.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

