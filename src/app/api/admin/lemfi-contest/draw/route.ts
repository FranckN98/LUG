import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { LEMFI_MAX_DRAW_COUNT, LEMFI_PRIZE_PRESETS } from '@/config/lemfiContest';
import { drawWinners, getDrawState } from '@/lib/lemfiContestDraw';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET() {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const state = await getDrawState();
  return NextResponse.json(
    { ...state, prizePresets: LEMFI_PRIZE_PRESETS, maxCount: LEMFI_MAX_DRAW_COUNT },
    { headers: NO_STORE },
  );
}

export async function POST(req: NextRequest) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  let body: { prize?: unknown; count?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* corps invalide : rejeté ci-dessous */
  }

  const result = await drawWinners(body.prize, body.count);
  if (!result.ok) {
    const map = {
      invalid_prize: [400, 'Indiquez le lot à gagner (60 caractères maximum).'],
      invalid_count: [400, `Le nombre de gagnants doit être compris entre 1 et ${LEMFI_MAX_DRAW_COUNT}.`],
      no_eligible: [409, 'Aucun participant éligible : il faut au moins une participation validée non encore tirée.'],
    } as const;
    const [status, error] = map[result.code];
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json(result, { headers: NO_STORE });
}
