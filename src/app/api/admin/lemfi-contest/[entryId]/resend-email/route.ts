import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getRegisteredEntryById } from '@/lib/lemfiContest';
import { deliverConfirmation } from '@/lib/lemfiContestDelivery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(_req: NextRequest, { params }: { params: { entryId: string } }) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const entry = await getRegisteredEntryById(params.entryId);
  if (!entry) return NextResponse.json({ error: 'Participation introuvable.' }, { status: 404 });

  const emailStatus = await deliverConfirmation(entry);
  return NextResponse.json({ ok: true, emailStatus });
}
