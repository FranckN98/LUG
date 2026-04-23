import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  createEventRecord,
  eventInclude,
  normalizeEventPayload,
  validateEventPayload,
} from '@/lib/events-db';

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: eventInclude,
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  try {
    const payload = normalizeEventPayload(await req.json());
    const error = validateEventPayload(payload);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const event = await createEventRecord(payload);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Erreur lors de la création de l\'événement.' }, { status: 500 });
  }
}