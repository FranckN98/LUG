import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function isAdmin() {
  const cookieStore = cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

function parseJsonList(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

function parsePassBody(body: Record<string, unknown>) {
  return {
    name: String(body.name ?? ''),
    label: String(body.label ?? ''),
    targetAudience: String(body.targetAudience ?? ''),
    description: String(body.description ?? ''),
    highlights: JSON.stringify(parseJsonList(body.highlights)),
    includes: JSON.stringify(parseJsonList(body.includes)),
    decisionPhrase: String(body.decisionPhrase ?? ''),
    priceCents: Number(body.priceCents ?? 0),
    oldPriceCents: body.oldPriceCents != null ? Number(body.oldPriceCents) : null,
    currency: String(body.currency ?? 'EUR'),
    status: String(body.status ?? 'available'),
    isActive: body.isActive !== false,
    checkoutUrl: String(body.checkoutUrl ?? ''),
    colorPrimary: String(body.colorPrimary ?? '#1a4a2e'),
    colorSecondary: String(body.colorSecondary ?? '#2d7a4f'),
    sortOrder: Number(body.sortOrder ?? 0),
    availabilityNote: body.availabilityNote ? String(body.availabilityNote) : null,
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const pass = await prisma.ticketingPass.update({
    where: { id },
    data: parsePassBody(body),
  });

  return NextResponse.json(pass);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.ticketingPass.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
