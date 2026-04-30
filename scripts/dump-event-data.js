// Dumps ALL event-related tables from local SQLite to prisma-events-dump.json.
// Skips: NewsletterSubscriber, Member, CommunicationSettings, EventCommunicationLead
// (those are managed only on production by the admin).
//
// Run while schema.prisma uses provider="sqlite".

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db').replace(/\\/g, '/');
  const prisma = new PrismaClient({ datasourceUrl: `file:${dbPath}` });

  // Order matters for FK during INSERT (parents before children).
  const models = [
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

  const out = {};
  for (const m of models) {
    if (!prisma[m] || typeof prisma[m].findMany !== 'function') {
      console.log(`- ${m}: model not in client, skipped`);
      continue;
    }
    try {
      const rows = await prisma[m].findMany();
      out[m] = rows;
      console.log(`✓ ${m}: ${rows.length}`);
    } catch (e) {
      console.error(`✗ ${m}:`, e.message);
    }
  }

  const dest = path.join(__dirname, '..', 'prisma-events-dump.json');
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${dest}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
