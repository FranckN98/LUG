import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { forfeitWinner } from '@/lib/lemfiContestDraw';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { winnerId: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  let body: { action?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* corps invalide : rejeté ci-dessous */
  }
  if (body.action !== 'forfeit') {
    return NextResponse.json({ error: 'Action invalide.' }, { status: 400 });
  }

  const result = await forfeitWinner(params.winnerId);
  if (!result.ok) {
    const map = {
      not_found: [404, 'Gagnant introuvable.'],
      unchanged: [409, 'Ce gain est déjà annulé.'],
    } as const;
    const [status, error] = map[result.code];
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ ok: true, prize: result.prize }, { headers: { 'Cache-Control': 'no-store' } });
}
