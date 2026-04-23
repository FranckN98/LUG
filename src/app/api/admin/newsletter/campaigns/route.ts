import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const campaigns = await prisma.newsletterCampaign.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subject, previewText, titleText, bodyContent, headerImageUrl, campaignImageUrl, ctaLabel, ctaUrl, footerNote } = body;

  if (!subject?.trim() || !bodyContent?.trim()) {
    return NextResponse.json({ error: 'L\'objet et le contenu sont requis' }, { status: 400 });
  }

  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject: subject.trim(),
      previewText: previewText?.trim() || null,
      titleText: titleText?.trim() || null,
      bodyContent: bodyContent.trim(),
      headerImageUrl: headerImageUrl?.trim() || null,
      campaignImageUrl: campaignImageUrl?.trim() || null,
      ctaLabel: ctaLabel?.trim() || null,
      ctaUrl: ctaUrl?.trim() || null,
      footerNote: footerNote?.trim() || null,
      status: 'draft',
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
