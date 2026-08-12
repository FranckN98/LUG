import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// GET /api/admin/buttons
export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const buttons = await prisma.homeButton.findMany({
    orderBy: { displayOrder: 'asc' },
  });
  return NextResponse.json(buttons);
}

// POST /api/admin/buttons — disabled: hero slots are fixed, use PATCH
export async function POST() {
  return NextResponse.json({ error: 'Fixed slots only — use PATCH to edit existing buttons.' }, { status: 405 });
}
