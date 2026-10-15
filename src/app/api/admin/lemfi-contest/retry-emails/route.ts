import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { listEntriesWithoutConfirmedEmail } from '@/lib/lemfiContest';
import { deliverConfirmation } from '@/lib/lemfiContestDelivery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Relance les e-mails de confirmation qui n'ont jamais été confirmés par le service d'envoi. */
export async function POST() {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const entries = await listEntriesWithoutConfirmedEmail(20);
  let sent = 0;
  let failed = 0;
  for (const entry of entries) {
    const status = await deliverConfirmation(entry);
    if (status === 'sent') sent += 1;
    else failed += 1;
  }
  return NextResponse.json({ ok: true, attempted: entries.length, sent, failed });
}
