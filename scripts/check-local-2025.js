const path = require('path');
const absolute = path.resolve(__dirname, '..', 'prisma', 'dev.db').replace(/\\/g, '/');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasourceUrl: `file:${absolute}` });

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
  if (!event) { console.log('NO 2025'); return; }
  console.log('=== LOCAL event 2025 ===');
  console.log(`id=${event.id} updatedAt=${event.updatedAt}`);
  console.log(`translations=${event.translations.length}`);
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
