#!/usr/bin/env node
/**
 * One-shot seed: set the homepage countdown to target the next event.
 * Idempotent — upserts the singleton row.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 17 October 2026, 10:00 Europe/Berlin (CEST → UTC+2 in October, but DST ends 25 Oct 2026,
  // so 17 Oct is still CEST). 10:00 CEST = 08:00 UTC.
  const targetDate = new Date('2026-10-17T08:00:00.000Z');

  const data = {
    isActive: true,
    targetDate,
    titleFr: 'Prochaine édition dans',
    titleDe: 'Nächste Ausgabe in',
    titleEn: 'Next edition in',
    subtitleFr: 'Level Up in Germany — 17 octobre 2026',
    subtitleDe: 'Level Up in Germany — 17. Oktober 2026',
    subtitleEn: 'Level Up in Germany — October 17, 2026',
    endedMessageFr: "L'événement a commencé !",
    endedMessageDe: 'Die Veranstaltung hat begonnen!',
    endedMessageEn: 'The event has started!',
  };

  const saved = await prisma.countdownConfig.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });

  console.log('[seed-countdown] OK →', {
    isActive: saved.isActive,
    targetDate: saved.targetDate.toISOString(),
  });
}

main()
  .catch((err) => {
    console.error('[seed-countdown] failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
