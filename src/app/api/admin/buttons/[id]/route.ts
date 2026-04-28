import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function isAdmin() {
  const cookieStore = cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

// PATCH /api/admin/buttons/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const button = await prisma.homeButton.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(button);
}

// DELETE /api/admin/buttons/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Protect hero_ slots — they are fixed and cannot be deleted
  const existing = await prisma.homeButton.findUnique({ where: { id: params.id }, select: { slot: true } });
  if (existing?.slot?.startsWith('hero_')) {
    return NextResponse.json({ error: 'Hero slots are fixed and cannot be deleted.' }, { status: 403 });
  }

  await prisma.homeButton.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
