/* eslint-disable no-console */
/*
 * Connect to the production Neon database and dump every BlogPost with all
 * its translations. Used to pull the live French content so we can produce
 * faithful EN/DE versions that preserve images, bold spans and structure.
 */
const { PrismaClient } = require('@prisma/client');

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  console.error('NEON_DATABASE_URL is not set');
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const posts = await prisma.blogPost.findMany({
    include: { translations: true },
    orderBy: { createdAt: 'asc' },
  });
  for (const p of posts) {
    console.log(`\n========== ${p.id} ==========`);
    console.log(`legacy.title:    ${p.title}`);
    console.log(`category:        ${p.category}`);
    console.log(`coverImage:      ${p.coverImage}`);
    console.log(`published:       ${p.published}`);
    console.log(`translations:    ${p.translations.map((t) => t.locale).join(', ')}`);
    for (const t of p.translations) {
      console.log(`\n----- ${t.locale} -----`);
      console.log(`title:           ${t.title}`);
      console.log(`excerpt:         ${t.excerpt}`);
      console.log(`metaTitle:       ${t.metaTitle}`);
      console.log(`metaDescription: ${t.metaDescription}`);
      console.log(`---BODY---`);
      console.log(t.body);
      console.log(`---END---`);
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
