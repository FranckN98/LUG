import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

function parseJsonList(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

function parsePassBody(body: Record<string, unknown>) {
  return {
    configId: 'singleton',
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

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const passes = await prisma.ticketingPass.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(passes);
}

export async function POST(req: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  // Ensure singleton config exists first
  await prisma.ticketingConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });

  const body = await req.json();
  const pass = await prisma.ticketingPass.create({ data: parsePassBody(body) });
  return NextResponse.json(pass, { status: 201 });
}
