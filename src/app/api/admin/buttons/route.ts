import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function isAdmin() {
  const cookieStore = cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

// GET /api/admin/buttons
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const buttons = await prisma.homeButton.findMany({
    orderBy: { displayOrder: 'asc' },
  });
  return NextResponse.json(buttons);
}

// POST /api/admin/buttons — disabled: hero slots are fixed, use PATCH
export async function POST() {
  return NextResponse.json({ error: 'Fixed slots only — use PATCH to edit existing buttons.' }, { status: 405 });
}
