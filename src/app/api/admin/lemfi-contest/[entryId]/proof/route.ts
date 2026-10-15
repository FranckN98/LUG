import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getProof } from '@/lib/lemfiContest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** La preuve n'est servie qu'à un administrateur authentifié (stockage privé en base). */
export async function GET(_req: NextRequest, { params }: { params: { entryId: string } }) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const proof = await getProof(params.entryId);
  if (!proof) return NextResponse.json({ error: 'Preuve introuvable.' }, { status: 404 });

  return new NextResponse(new Uint8Array(proof.data), {
    headers: {
      'Content-Type': proof.mimeType,
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
