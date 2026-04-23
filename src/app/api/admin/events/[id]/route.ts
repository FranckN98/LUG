import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  eventInclude,
  normalizeEventPayload,
  serializeEventForForm,
  updateEventRecord,
  validateEventPayload,
} from '@/lib/events-db';

type Params = { params: { id: string } };

export async function GET(_: NextRequest, { params }: Params) {
  const event = await prisma.event.findUnique({ where: { id: params.id }, include: eventInclude });

  if (!event) {
    return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const rawBody = (await req.json()) as Record<string, unknown>;
    const existing = await prisma.event.findUnique({ where: { id: params.id }, include: eventInclude });

    if (!existing) {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    }

    if (Object.keys(rawBody).length === 1 && typeof rawBody.status === 'string') {
      const nextStatus = rawBody.status;
      const event = await prisma.event.update({
        where: { id: params.id },
        data: {
          status: nextStatus,
          publishedAt: nextStatus === 'published' ? new Date() : null,
        },
        include: eventInclude,
      });

      return NextResponse.json(event);
    }

    const payload = normalizeEventPayload({
      ...serializeEventForForm(existing),
      ...rawBody,
    });
    const error = validateEventPayload(payload);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const event = await updateEventRecord(params.id, payload, existing.venueId);

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'événement.' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}