import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getLemfiRetentionDays } from '@/config/lemfiContest';
import { purgeExpiredEntries } from '@/lib/lemfiContest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Supprime les participations plus anciennes que la durée de conservation (LEMFI_RETENTION_DAYS). */
export async function POST() {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const days = getLemfiRetentionDays();
  const deleted = await purgeExpiredEntries(days);
  return NextResponse.json({ ok: true, deleted, retentionDays: days });
}
