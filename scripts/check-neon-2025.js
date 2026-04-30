const fs = require('fs');
const path = require('path');
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
const p = new PrismaClient({ datasourceUrl: process.env.NEON_DATABASE_URL });

(async () => {
  const event = await p.event.findFirst({
    where: { year: 2025 },
    include: {
      translations: { orderBy: { locale: 'asc' } },
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
  if (!event) { console.log('NO event 2025 on Neon'); return; }
  console.log('=== NEON event 2025 ===');
  console.log(`id=${event.id} slug=${event.slug} status=${event.status} updatedAt=${event.updatedAt}`);
  console.log(`translations=${event.translations.length} -> ${event.translations.map(t=>t.locale+':'+t.title).join(' | ')}`);
  console.log(`prices=${event.prices.length}`);
  console.log(`highlights=${event.highlights.length}`);
  console.log(`scheduleSections=${event.scheduleSections.length}`);
  console.log(`scheduleItems=${event.scheduleItems.length}`);
  console.log(`eventSpeakers=${event.eventSpeakers.length}`);
  console.log(`eventOrganizations=${event.eventOrganizations.length}`);
  console.log(`mediaItems=${event.mediaItems.length}`);
  console.log(`documents=${event.documents.length}`);
  await p.$disconnect();
})();
