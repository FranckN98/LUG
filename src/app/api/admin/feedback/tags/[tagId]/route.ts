import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { deleteTag, renameTag } from '@/lib/feedback';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { tagId: string } };

const MESSAGES = {
  invalid: 'Le nom de l’étiquette doit contenir de 1 à 40 caractères.',
  duplicate: 'Cette étiquette existe déjà.',
  not_found: 'Étiquette introuvable.',
} as const;
const STATUS = { invalid: 400, duplicate: 409, not_found: 404 } as const;

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  let body: { name?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* corps invalide : rejeté par renameTag */
  }
  const result = await renameTag(params.tagId, body.name);
  if (!result.ok) return NextResponse.json({ error: MESSAGES[result.code] }, { status: STATUS[result.code] });
  return NextResponse.json({ tag: { id: result.id, name: result.name } });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const deleted = await deleteTag(params.tagId);
  if (!deleted) return NextResponse.json({ error: MESSAGES.not_found }, { status: 404 });
  return NextResponse.json({ ok: true });
}
