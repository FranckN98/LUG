// Migrates ALL data from local SQLite (prisma/dev.db) to the Neon Postgres
// pointed by DATABASE_URL. Run with the schema temporarily switched to postgresql.
//
// Strategy:
//  1. Open a SQLite connection by setting DATABASE_URL=file:./prisma/dev.db
//     in a child Node process? Too brittle.
//  2. Simpler: read each table from SQLite via better-sqlite3 (no Prisma needed),
//     then insert into Postgres via Prisma client.
//
// We avoid adding better-sqlite3. Instead we run TWO Prisma clients via process
// args. But Prisma can only have one schema at a time.
//
// → Concrete approach: dump SQLite to JSON via a separate Node call BEFORE
//   regenerating the client for Postgres. This script is the *import* step:
//   reads ./prisma-dump.json and writes to Postgres.
//
// Companion script: scripts/dump-sqlite.js produces prisma-dump.json.

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const DUMP = path.join(__dirname, '..', 'prisma-dump.json');

async function main() {
  if (!fs.existsSync(DUMP)) {
    console.error('Missing prisma-dump.json. Run scripts/dump-sqlite.js first.');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(DUMP, 'utf8'));
  const prisma = new PrismaClient({
    datasourceUrl: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
  });

  // Order matters when there are FK constraints. Insert parents first.
  const order = [
    'media',
    'siteConfig',
    'heroSlide',
    'homeButton',
    'newsletterSubscriber',
    'newsletterCampaign',
    'communicationSettings',
    'contactMessage',
    'blogPost',
    'teamMember',
    'partner',
    'member',
    'venue',
    'venueTranslation',
    'event',
    'eventCommunicationLead',
    'eventTranslation',
    'eventPrice',
    'eventPriceTranslation',
    'eventHighlight',
    'eventHighlightTranslation',
  ];

  // Reverse order for the wipe (children first)
  const wipeOrder = [...order].reverse();
  for (const model of wipeOrder) {
    if (!data[model] || !prisma[model]) continue;
    try { await prisma[model].deleteMany(); } catch (_) {}
  }

  for (const model of order) {
    const rows = data[model];
    if (!rows || rows.length === 0) {
      console.log(`- ${model}: skipped (no rows)`);
      continue;
    }
    try {
      const result = await prisma[model].createMany({
        data: rows,
        skipDuplicates: true,
      });
      console.log(`✓ ${model}: ${result.count} rows`);
    } catch (e) {
      console.error(`✗ ${model}:`, e.message);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
