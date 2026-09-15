import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

/**
 * Duplicate a campaign (template or already-sent/draft campaign) into a brand
 * new draft campaign, ready to edit/select recipients/send. This is how the
 * template library is "used": templates are never sent directly
 * (isTemplate=true rows are excluded from the send UI's campaign list), they
 * are copied into a fresh isTemplate=false row instead.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const source = await prisma.newsletterCampaign.findUnique({
    where: { id: params.id },
    include: {
      translations: true,
      attachments: { orderBy: { position: 'asc' } },
    },
  });
  if (!source) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const duplicate = await prisma.newsletterCampaign.create({
    data: {
      subject: source.subject,
      previewText: source.previewText,
      titleText: source.titleText,
      bodyContent: source.bodyContent,
      headerImageUrl: source.headerImageUrl,
      campaignImageUrl: source.campaignImageUrl,
      ctaLabel: source.ctaLabel,
      ctaUrl: source.ctaUrl,
      footerNote: source.footerNote,
      status: 'draft',
      showTravelBlock: source.showTravelBlock,
      // Keep template provenance metadata for display, but this new row is a
      // real campaign, never itself a template.
      isTemplate: false,
      sourceTemplateId: source.isTemplate ? source.id : source.sourceTemplateId,
      campaignNumber: source.campaignNumber,
      recommendedSendAt: source.recommendedSendAt,
      recommendedAudience: source.recommendedAudience,
      translations: {
        create: source.translations.map((t) => ({
          locale: t.locale,
          subject: t.subject,
          previewText: t.previewText,
          titleText: t.titleText,
          bodyContent: t.bodyContent,
          ctaLabel: t.ctaLabel,
          footerNote: t.footerNote,
        })),
      },
      attachments: source.attachments.length
        ? {
            create: source.attachments.map((a, i) => ({
              filename: a.filename,
              url: a.url,
              contentType: a.contentType,
              size: a.size,
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

  return NextResponse.json(duplicate, { status: 201 });
}
