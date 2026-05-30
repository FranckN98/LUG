#!/usr/bin/env node
/**
 * Idempotent seed for SponsorDocument rows that already exist as static
 * files under /public/downloads. Ensures legacy PDFs are reachable via
 * the canonical https://www.levelupingermany.com/pdf/<slug> route.
 *
 * Safe to run on every deploy: uses upsert by slug.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SEED_DOCS = [
  {
    slug: 'sponsor-2026',
    title: 'Sponsor Pack — Level Up in Germany 2026',
    description: 'Dossier sponsor officiel pour la 2ᵉ édition de Level Up in Germany.',
    filename: 'fscon-v2.pdf',
    url: '/downloads/fscon-v2.pdf',
    mimeType: 'application/pdf',
    isFeaturedIfNoneYet: true,
  },
  {
    slug: 'livre-1re-edition',
    title: 'Livre 1re édition — Level Up in Germany',
    description: 'Le livre commémoratif de la première édition.',
    filename: 'level-up-livre-1re-edition.pdf',
    url: '/downloads/level-up-livre-1re-edition.pdf',
    mimeType: 'application/pdf',
  },
  {
    slug: 'proposition-njoka',
    title: 'Proposition de partenariat — Njoka',
    description: 'Proposition de partenariat 2026 pour Njoka.',
    filename: 'proposition-njoka.pdf',
    url: '/downloads/proposition-njoka.pdf',
    mimeType: 'application/pdf',
  },
];

async function main() {
  const existingFeatured = await prisma.sponsorDocument.findFirst({ where: { isFeatured: true } });
  const featuredAlreadySet = Boolean(existingFeatured);

  for (const seed of SEED_DOCS) {
    const shouldFeature = seed.isFeaturedIfNoneYet && !featuredAlreadySet;
    const data = {
      title: seed.title,
      slug: seed.slug,
      description: seed.description,
      filename: seed.filename,
      url: seed.url,
      mimeType: seed.mimeType,
      isPublic: true,
    };
    const created = await prisma.sponsorDocument.upsert({
      where: { slug: seed.slug },
      update: {
        // Don't overwrite admin-edited fields except url/filename which are infrastructure.
        url: data.url,
        filename: data.filename,
        mimeType: data.mimeType,
      },
      create: shouldFeature ? { ...data, isFeatured: true } : data,
    });
    console.log(`[seed-sponsor-docs] ok: ${created.slug} -> ${created.url}`);
  }
}

main()
  .catch((err) => {
    console.error('[seed-sponsor-docs] failed:', err);
    process.exitCode = 0; // non-fatal: deployment continues
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
