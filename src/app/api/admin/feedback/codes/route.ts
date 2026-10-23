import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { generateCodes, getCodeStats, MAX_CODES_PER_BATCH } from '@/lib/feedback';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET() {
  const unauth = requireAdmin();
  if (unauth) return unauth;
  return NextResponse.json({ ...(await getCodeStats()), maxPerBatch: MAX_CODES_PER_BATCH }, { headers: NO_STORE });
}

/** Les codes ne sont renvoyés en clair qu'ici, une seule fois : la base n'en garde que le hash. */
export async function POST(req: NextRequest) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  let body: { count?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* corps invalide : rejeté ci-dessous */
  }
  const codes = typeof body.count === 'number' ? await generateCodes(body.count) : null;
  if (!codes) {
    return NextResponse.json({ error: `Indiquez un nombre de codes entre 1 et ${MAX_CODES_PER_BATCH}.` }, { status: 400 });
  }
  return NextResponse.json({ codes, ...(await getCodeStats()) }, { headers: NO_STORE });
}
