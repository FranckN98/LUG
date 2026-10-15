import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getLemfiRetentionDays, LEMFI_CAPACITY } from '@/config/lemfiContest';
import {
  countEntriesWithoutConfirmedEmail,
  countExpiredEntries,
  getAdminStats,
  listEntriesForAdmin,
} from '@/lib/lemfiContest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number.parseInt(sp.get('limit') ?? '25', 10) || 25, 1), 100);
  const offset = Math.max(Number.parseInt(sp.get('offset') ?? '0', 10) || 0, 0);
  const retentionDays = getLemfiRetentionDays();

  const [list, stats, expired, emailsPending] = await Promise.all([
    listEntriesForAdmin({ status: sp.get('status'), q: sp.get('q'), limit, offset }),
    getAdminStats(),
    countExpiredEntries(retentionDays),
    countEntriesWithoutConfirmedEmail(),
  ]);

  return NextResponse.json(
    { ...list, stats, capacity: LEMFI_CAPACITY, retentionDays, expired, emailsPending },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
