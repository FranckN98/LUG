import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { decideEntry, getEntryDetailForAdmin } from '@/lib/lemfiContest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { entryId: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const entry = await getEntryDetailForAdmin(params.entryId);
  if (!entry) return NextResponse.json({ error: 'Participation introuvable.' }, { status: 404 });
  return NextResponse.json({ entry }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  let body: { action?: unknown; reason?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* corps invalide : rejeté ci-dessous */
  }
  if (body.action !== 'validated' && body.action !== 'rejected') {
    return NextResponse.json({ error: 'Action invalide.' }, { status: 400 });
  }

  const result = await decideEntry(
    params.entryId,
    body.action,
    typeof body.reason === 'string' ? body.reason : null,
  );
  if (!result.ok) {
    const map = {
      not_found: [404, 'Participation introuvable.'],
      unchanged: [409, 'Cette participation a déjà ce statut.'],
      reason_required: [400, 'Un motif est obligatoire pour refuser.'],
    } as const;
    const [status, error] = map[result.code];
    return NextResponse.json({ error }, { status });
  }

  const entry = await getEntryDetailForAdmin(params.entryId);
  return NextResponse.json({ ok: true, entry }, { headers: { 'Cache-Control': 'no-store' } });
}
