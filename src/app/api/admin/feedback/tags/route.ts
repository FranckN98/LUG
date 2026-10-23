import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { createTag, listTags } from '@/lib/feedback';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MESSAGES = {
  invalid: 'Le nom de l’étiquette doit contenir de 1 à 40 caractères.',
  duplicate: 'Cette étiquette existe déjà.',
  not_found: 'Étiquette introuvable.',
} as const;

export async function GET() {
  const unauth = requireAdmin();
  if (unauth) return unauth;
  return NextResponse.json({ tags: await listTags() }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  let body: { name?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* corps invalide : rejeté par createTag */
  }
  const result = await createTag(body.name);
  if (!result.ok) {
    return NextResponse.json({ error: MESSAGES[result.code] }, { status: result.code === 'duplicate' ? 409 : 400 });
  }
  return NextResponse.json({ tag: { id: result.id, name: result.name, count: 0 } });
}
