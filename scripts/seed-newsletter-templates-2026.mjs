#!/usr/bin/env node
/**
 * Seed the 10 "Level Up in Germany 2026" newsletter templates.
 *
 * Idempotent: upserts by templateKey (LU2026-01 .. LU2026-10). Safe to re-run
 * (e.g. after editing tmp/lu2026-templates.json and re-running the parser).
 *
 * Source data: tmp/lu2026-templates.json, produced by tmp/parse-campaigns.mjs
 * from the exact copy provided by the user (subjects/preheaders/body copy/
 * CTA labels/recommended dates & audiences) — nothing here is invented.
 *
 * Each template:
 *   - isTemplate: true (never sent directly — duplicated into a draft first,
 *     see POST /api/admin/newsletter/campaigns/[id]/duplicate)
 *   - showTravelBlock: true (mandatory Deutsche Bahn + carpool block)
 *   - ctaUrl carries UTM params identifying the source campaign
 *   - one FR NewsletterCampaignTranslation (the brief's copy is FR-only;
 *     EN/DE can be added later the same way other campaigns already do)
 *
 * Usage (targets whatever DATABASE_URL is set in the environment):
 *   node scripts/seed-newsletter-templates-2026.mjs
 */
const { PrismaClient } = await import('@prisma/client');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

const DATA_PATH = path.join(__dirname, '..', 'tmp', 'lu2026-templates.json');

function parseFrDate(dmy) {
  // "17.09.2026" -> Date (UTC midnight)
  const [d, m, y] = dmy.split('.').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function bodyHtml(paragraphs) {
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function withUtm(baseUrl, campaignNumber) {
  const u = new URL(baseUrl);
  u.searchParams.set('utm_source', 'newsletter');
  u.searchParams.set('utm_medium', 'email');
  u.searchParams.set('utm_campaign', 'levelup2026');
  u.searchParams.set('utm_content', `email${String(campaignNumber).padStart(2, '0')}`);
  return u.toString();
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Missing ${DATA_PATH} — run tmp/parse-campaigns.mjs first.`);
  }
  const templates = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  for (const t of templates) {
    const ctaUrl = withUtm(t.ctaUrl, t.campaignNumber);
    const html = bodyHtml(t.bodyParagraphs);

    const existing = await prisma.newsletterCampaign.findUnique({
      where: { templateKey: t.templateKey },
    });

    const scalarData = {
      subject: t.subject,
      previewText: t.preheader,
      titleText: t.titleText,
      bodyContent: html,
      ctaLabel: t.ctaLabel,
      ctaUrl,
      status: 'draft',
      isTemplate: true,
      templateKey: t.templateKey,
      campaignNumber: t.campaignNumber,
      recommendedSendAt: parseFrDate(t.recommendedSendAt),
      recommendedAudience: t.recommendedAudience,
      showTravelBlock: true,
    };

    let campaign;
    if (existing) {
      campaign = await prisma.newsletterCampaign.update({
        where: { id: existing.id },
        data: scalarData,
      });
      // Replace the FR translation to reflect the latest copy.
      await prisma.newsletterCampaignTranslation.deleteMany({
        where: { campaignId: campaign.id, locale: 'fr' },
      });
    } else {
      campaign = await prisma.newsletterCampaign.create({ data: scalarData });
    }

    await prisma.newsletterCampaignTranslation.create({
      data: {
        campaignId: campaign.id,
        locale: 'fr',
        subject: t.subject,
        previewText: t.preheader,
        titleText: t.titleText,
        bodyContent: html,
        ctaLabel: t.ctaLabel,
      },
    });

    console.log(`[seed-newsletter-templates-2026] ${existing ? 'updated' : 'created'} ${t.templateKey}`);
  }

  console.log(`[seed-newsletter-templates-2026] done — ${templates.length} templates.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
