// Compares event 2025 in local SQLite vs Neon Postgres.
// Run from project root.

const fs = require('fs');
const path = require('path');

// Load NEON_DATABASE_URL from .env if not set
if (!process.env.NEON_DATABASE_URL) {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*NEON_DATABASE_URL\s*=\s*"?([^"]+)"?\s*$/);
      if (m) process.env.NEON_DATABASE_URL = m[1];
    }
  }
}

const { PrismaClient } = require('@prisma/client');

async function summary(prisma, label) {
  const event = await prisma.event.findFirst({
    where: { year: 2025 },
    include: {
      translations: true,
      prices: true,
      highlights: true,
      scheduleSections: true,
      scheduleItems: true,
      eventSpeakers: true,
      eventOrganizations: true,
      mediaItems: true,
      documents: true,
    },
  });
  if (!event) {
    console.log(`[${label}] NO event 2025`);
    return;
  }
  console.log(`\n=== ${label} ===`);
  console.log(`id=${event.id} slug=${event.slug} status=${event.status}`);
  console.log(`updatedAt=${event.updatedAt}`);
  console.log(`translations=${event.translations.length}, prices=${event.prices.length}, highlights=${event.highlights.length}`);
  console.log(`scheduleSections=${event.scheduleSections.length}, scheduleItems=${event.scheduleItems.length}`);
  console.log(`speakers=${event.eventSpeakers.length}, orgs=${event.eventOrganizations.length}`);
  console.log(`media=${event.mediaItems.length}, documents=${event.documents.length}`);
}

(async () => {
  // Local SQLite
  const localPath = path.resolve(__dirname, '..', 'prisma', 'dev.db').replace(/\\/g, '/');
  const local = new PrismaClient({ datasourceUrl: `file:${localPath}` });
  await summary(local, 'LOCAL SQLite').catch((e) => console.error('LOCAL err:', e.message));
  await local.$disconnect();

  // Neon
  if (!process.env.NEON_DATABASE_URL) {
    console.log('\nNEON_DATABASE_URL missing, skipping Neon check');
    return;
  }
  const neon = new PrismaClient({ datasourceUrl: process.env.NEON_DATABASE_URL });
  await summary(neon, 'NEON Postgres').catch((e) => console.error('NEON err:', e.message));
  await neon.$disconnect();
})();
