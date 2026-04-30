const path = require('path');
const absolute = path.resolve(__dirname, '..', 'prisma', 'dev.db').replace(/\\/g, '/');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasourceUrl: `file:${absolute}` });

(async () => {
  const events = await p.event.findMany({
    orderBy: { year: 'asc' },
    include: { translations: { select: { locale: true, title: true } } },
  });
  for (const e of events) {
    console.log(`year=${e.year}  id=${e.id}  slug=${e.slug}  startsAt=${e.startsAt}  status=${e.status}  venueId=${e.venueId}`);
    console.log('  titles:', e.translations.map((t) => `${t.locale}=${t.title}`).join(' | '));
  }
  await p.$disconnect();
})();
