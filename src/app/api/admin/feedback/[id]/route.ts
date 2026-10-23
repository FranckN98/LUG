import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { setResponseTags } from '@/lib/feedback';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

/** Seules les étiquettes sont modifiables : le contenu d'une réponse ne l'est jamais. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  let body: { tagIds?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* corps invalide : rejeté ci-dessous */
  }
  if (!Array.isArray(body.tagIds) || body.tagIds.length > 50 || !body.tagIds.every((t) => typeof t === 'string')) {
    return NextResponse.json({ error: 'Étiquettes invalides.' }, { status: 400 });
  }

  const response = await setResponseTags(params.id, body.tagIds as string[]);
  if (!response) return NextResponse.json({ error: 'Réponse introuvable.' }, { status: 404 });
  return NextResponse.json({ response }, { headers: { 'Cache-Control': 'no-store' } });
}
