import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const { subject, previewText, titleText, bodyContent, headerImageUrl, campaignImageUrl, ctaLabel, ctaUrl, footerNote } = body;

  const updated = await prisma.newsletterCampaign.update({
    where: { id: params.id },
    data: {
      ...(subject != null && { subject: subject.trim() }),
      ...(previewText != null && { previewText: previewText.trim() || null }),
      ...(titleText != null && { titleText: titleText.trim() || null }),
      ...(bodyContent != null && { bodyContent: bodyContent.trim() }),
      ...(headerImageUrl != null && { headerImageUrl: headerImageUrl.trim() || null }),
      ...(campaignImageUrl != null && { campaignImageUrl: campaignImageUrl.trim() || null }),
      ...(ctaLabel != null && { ctaLabel: ctaLabel.trim() || null }),
      ...(ctaUrl != null && { ctaUrl: ctaUrl.trim() || null }),
      ...(footerNote != null && { footerNote: footerNote.trim() || null }),
    },
  });

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
