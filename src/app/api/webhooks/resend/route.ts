import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

/**
 * Resend webhook receiver.
 *
 * Configure in the Resend dashboard → Webhooks → Add Webhook, pointing to
 * `${NEXT_PUBLIC_SITE_URL}/api/webhooks/resend`, subscribed to at least:
 *   email.bounced, email.complained, email.delivered, email.opened,
 *   email.clicked, email.failed
 *
 * Set `RESEND_WEBHOOK_SECRET` to the signing secret shown on that page.
 *
 * Why this exists: without it, hard-bounced and spam-complained addresses
 * are NEVER removed from the send list, which is one of the most damaging
 * things for sender reputation (repeatedly emailing dead/complaining
 * addresses). See the newsletter deliverability audit report.
 */

type ResendWebhookEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[];
    tags?: Record<string, string> | Array<{ name: string; value: string }>;
    bounce?: { type?: string; subType?: string; message?: string };
  };
};

export function extractCampaignId(data: ResendWebhookEvent['data']): string | undefined {
  const tags = data?.tags;
  if (!tags) return undefined;
  if (Array.isArray(tags)) {
    return tags.find((t) => t.name === 'campaign_id')?.value;
  }
  return tags.campaign_id;
}

async function bumpCampaignCounter(campaignId: string | undefined, field: string) {
  if (!campaignId) return;
  try {
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { [field]: { increment: 1 } },
    });
  } catch {
    // Campaign may no longer exist (deleted) — non-fatal, event already logged.
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.text();

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error('[resend-webhook] RESEND_WEBHOOK_SECRET is not set — rejecting webhook');
    return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 });
  }

  let event: ResendWebhookEvent;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY?.trim() || 'placeholder');
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get('svix-id') ?? '',
        timestamp: req.headers.get('svix-timestamp') ?? '',
        signature: req.headers.get('svix-signature') ?? '',
      },
      webhookSecret,
    }) as ResendWebhookEvent;
  } catch (err) {
    console.error('[resend-webhook] signature verification failed', err);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  // Idempotency: Resend delivers "at-least-once". Skip events we already processed.
  const svixId = req.headers.get('svix-id');
  if (svixId) {
    try {
      await prisma.newsletterWebhookEvent.create({
        data: { svixId, type: event.type },
      });
    } catch {
      // Unique constraint violation → already processed this event.
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const toEmail = event.data?.to?.[0]?.toLowerCase().trim();
  const campaignId = extractCampaignId(event.data);

  switch (event.type) {
    case 'email.bounced': {
      const bounceType = event.data?.bounce?.type; // 'Permanent' | 'Transient' | 'Undetermined'
      const isHard = bounceType === 'Permanent';
      if (toEmail) {
        await prisma.newsletterSubscriber.updateMany({
          where: { email: toEmail },
          data: {
            bounceCount: { increment: 1 },
            lastBounceAt: new Date(),
            lastBounceType: bounceType ?? 'unknown',
            // Hard bounce → permanently suppress. Soft/undetermined bounces are
            // often transient (full mailbox, temporary server issue); we only
            // flag them, we don't suppress on the first occurrence.
            ...(isHard ? { status: 'hard_bounced' } : {}),
          },
        });
      }
      await bumpCampaignCounter(campaignId, isHard ? 'hardBounceCount' : 'softBounceCount');
      break;
    }
    case 'email.complained': {
      if (toEmail) {
        await prisma.newsletterSubscriber.updateMany({
          where: { email: toEmail },
          data: { status: 'complained', complainedAt: new Date() },
        });
      }
      await bumpCampaignCounter(campaignId, 'complaintCount');
      break;
    }
    case 'email.delivered': {
      await bumpCampaignCounter(campaignId, 'deliveredCount');
      break;
    }
    case 'email.failed': {
      await bumpCampaignCounter(campaignId, 'failedCount');
      break;
    }
    case 'email.opened': {
      if (toEmail) {
        await prisma.newsletterSubscriber.updateMany({
          where: { email: toEmail },
          data: { lastOpenAt: new Date() },
        });
      }
      await bumpCampaignCounter(campaignId, 'openCount');
      break;
    }
    case 'email.clicked': {
      if (toEmail) {
        await prisma.newsletterSubscriber.updateMany({
          where: { email: toEmail },
          data: { lastClickAt: new Date() },
        });
      }
      await bumpCampaignCounter(campaignId, 'clickCount');
      break;
    }
    default:
      // email.sent, email.scheduled, email.delivery_delayed, domain.*, contact.*, suppression.* — ignored for now.
      break;
  }

  return NextResponse.json({ ok: true });
}
