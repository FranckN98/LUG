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
  logoUrl: '/partners/campusdirekt.webp',
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
  const secondSortOrder = firstSortOrder + 1;

  // Make room after Regus so Campusdirekt is always the second visible logo.
  await prisma.partner.updateMany({
    where: {
      name: { notIn: [REGUS.name, CAMPUSDIREKT.name] },
      sortOrder: secondSortOrder,
    },
    data: { sortOrder: { increment: 1 } },
  });

  if (campusdirekt) {
    await prisma.partner.update({
      where: { id: campusdirekt.id },
      data: { ...CAMPUSDIREKT, sortOrder: secondSortOrder, visible: true },
    });
    console.log('[seed-partner-regus] updated Campusdirekt -> second');
  } else {
    await prisma.partner.create({
      data: { ...CAMPUSDIREKT, sortOrder: secondSortOrder, visible: true },
    });
    console.log('[seed-partner-regus] created Campusdirekt -> second');
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
