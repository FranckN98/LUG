// Dumps all tables from local SQLite (prisma/dev.db) to prisma-dump.json.
// Must be run while schema.prisma uses provider="sqlite" and the Prisma client
// has been generated for sqlite.
//
// Usage:
//   $env:DATABASE_URL = "file:./prisma/dev.db"
//   node scripts/dump-sqlite.js

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db').replace(/\\/g, '/');
  const prisma = new PrismaClient({
    datasourceUrl: `file:${dbPath}`,
  });

  const models = [
    'media',
    'siteConfig',
    'heroSlide',
    'homeButton',
    'newsletterSubscriber',
    'newsletterCampaign',
    'communicationSettings',
    'eventCommunicationLead',
    'contactMessage',
    'blogPost',
    'teamMember',
    'partner',
    'member',
    'venue',
    'venueTranslation',
    'event',
    'eventTranslation',
    'eventPrice',
    'eventPriceTranslation',
    'eventHighlight',
    'eventHighlightTranslation',
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

  const dest = path.join(__dirname, '..', 'prisma-dump.json');
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`Wrote ${dest}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
