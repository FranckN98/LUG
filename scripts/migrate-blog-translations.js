/* eslint-disable no-console */
/*
 * Backfill BlogPostTranslation rows for every existing BlogPost.
 *
 * Strategy:
 *   - For each BlogPost without a translation in fr/en/de, create one cloning
 *     the legacy `title` + `body`.
 *   - Idempotent: posts that already have a translation for a given locale are
 *     left untouched.
 *
 * The admin can refine each language afterwards via the multilingual editor.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const LOCALES = ['fr', 'en', 'de'];

async function main() {
  const posts = await prisma.blogPost.findMany({
    include: { translations: true },
  });

  let created = 0;

  for (const post of posts) {
    for (const locale of LOCALES) {
      if (post.translations.some((t) => t.locale === locale)) continue;
      await prisma.blogPostTranslation.create({
        data: {
          blogPostId: post.id,
          locale,
          title: post.title,
          body: post.body,
        },
      });
      created += 1;
      console.log(`+ ${post.id} (${locale}) "${post.title.slice(0, 60)}"`);
    }
  }

  console.log(`\nDone. ${created} translation row(s) created across ${posts.length} post(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
