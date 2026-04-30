// Upserts event-related rows (from prisma-events-dump.json) into Neon Postgres.
// Does NOT delete anything → safe to run with prod data already present.
// Preserves: NewsletterSubscriber, Member, CommunicationSettings,
// EventCommunicationLead (these are not in the dump).
//
// Usage (with schema.prisma switched to postgresql + client regenerated):
//   $env:DATABASE_URL = "postgresql://...neon.tech/neondb?sslmode=require"
//   node scripts/upsert-event-data.js

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const DUMP = path.join(__dirname, '..', 'prisma-events-dump.json');

// Insertion order — must respect FK dependencies (parents first).
const ORDER = [
  'media',
  'siteConfig',
  'heroSlide',
  'homeButton',
  'newsletterCampaign',
  'contactMessage',
  'blogPost',
  'teamMember',
  'partner',
  'venue',
  'venueTranslation',
  'event',
  'eventTranslation',
  'eventPrice',
  'eventPriceTranslation',
  'eventHighlight',
  'eventHighlightTranslation',
  'scheduleSection',
  'scheduleSectionTranslation',
  'scheduleItem',
  'scheduleItemTranslation',
  'speaker',
  'speakerTranslation',
  'eventSpeaker',
  'scheduleItemSpeaker',
  'organization',
  'organizationTranslation',
  'eventOrganization',
  'eventMedia',
  'eventMediaTranslation',
  'eventDocument',
  'eventDocumentTranslation',
];

async function main() {
  if (!fs.existsSync(DUMP)) {
    console.error('Missing prisma-events-dump.json. Run scripts/dump-event-data.js first.');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(DUMP, 'utf8'));
  const prisma = new PrismaClient({
    datasourceUrl: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
  });

  for (const model of ORDER) {
    const rows = data[model];
    if (!rows || rows.length === 0) {
      console.log(`- ${model}: no rows in dump, skipped`);
      continue;
    }
    if (!prisma[model] || typeof prisma[model].upsert !== 'function') {
      console.log(`- ${model}: not in postgres client, skipped`);
      continue;
    }

    let ok = 0;
    let fail = 0;
    for (const row of rows) {
      try {
        // Coerce date strings back to Date objects (JSON loses type).
        const fixed = {};
        for (const [k, v] of Object.entries(row)) {
          if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
            fixed[k] = new Date(v);
          } else {
            fixed[k] = v;
          }
        }

        await prisma[model].upsert({
          where: { id: fixed.id },
          create: fixed,
          update: fixed,
        });
        ok++;
      } catch (e) {
        fail++;
        console.error(`  ✗ ${model}#${row.id}:`, e.message.split('\n')[0]);
      }
    }
    console.log(`✓ ${model}: ${ok} upserted${fail ? `, ${fail} failed` : ''}`);
  }

  await prisma.$disconnect();
  console.log('\nDone. NewsletterSubscriber / Member / CommunicationSettings / EventCommunicationLead were NOT touched.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
