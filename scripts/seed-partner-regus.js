#!/usr/bin/env node
/**
 * Idempotent seed: ensure Regus appears as the FIRST partner/sponsor.
 * Runs on every deploy. Safe to re-run.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const REGUS = {
  name: 'Regus',
  logoUrl: '/partners/regus.png',
  websiteUrl: 'https://www.regus.com/de',
  category: 'partner',
};

const CAMPUSDIREKT = {
  name: 'Campusdirekt',
  logoUrl: '/partners/campusdirekt.avif',
  websiteUrl: 'https://campusdirekt.de/',
  category: 'sponsor',
};

async function main() {
  const existing = await prisma.partner.findFirst({ where: { name: REGUS.name } });

  // Lowest sortOrder currently in use, so Regus lands before everyone else.
  const min = await prisma.partner.aggregate({ _min: { sortOrder: true } });
  const firstSortOrder = (min._min.sortOrder ?? 0) - 1;

  if (existing) {
    await prisma.partner.update({
      where: { id: existing.id },
      data: {
        logoUrl: REGUS.logoUrl,
        websiteUrl: REGUS.websiteUrl,
        category: REGUS.category,
        sortOrder: firstSortOrder,
        visible: true,
      },
    });
    console.log('[seed-partner-regus] updated Regus -> first (sortOrder', firstSortOrder + ')');
  } else {
    await prisma.partner.create({
      data: { ...REGUS, sortOrder: firstSortOrder, visible: true },
    });
    console.log('[seed-partner-regus] created Regus -> first (sortOrder', firstSortOrder + ')');
  }

  const campusdirekt = await prisma.partner.findFirst({ where: { name: CAMPUSDIREKT.name } });
  const max = await prisma.partner.aggregate({ _max: { sortOrder: true } });
  const lastSortOrder = (max._max.sortOrder ?? 0) + 1;

  if (campusdirekt) {
    await prisma.partner.update({
      where: { id: campusdirekt.id },
      data: { ...CAMPUSDIREKT, sortOrder: lastSortOrder, visible: true },
    });
    console.log('[seed-partner-regus] updated Campusdirekt');
  } else {
    await prisma.partner.create({
      data: { ...CAMPUSDIREKT, sortOrder: lastSortOrder, visible: true },
    });
    console.log('[seed-partner-regus] created Campusdirekt');
  }
}

main()
  .catch((e) => {
    console.error('[seed-partner-regus] failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
