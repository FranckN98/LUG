import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim() || '';
  const statusFilter = searchParams.get('status') || '';

  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { name: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { city: { contains: search } },
    ];
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      address: true,
      city: true,
      status: true,
      source: true,
      createdAt: true,
    },
  });

  return NextResponse.json(subscribers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, firstName, lastName, address, city, source = 'admin' } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  const emailLower = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLower)) {
    return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: emailLower } });
  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà inscrit' }, { status: 409 });
  }

  const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ') || null;

  const subscriber = await prisma.newsletterSubscriber.create({
    data: {
      email: emailLower,
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      name: fullName,
      source,
      consent: true,
      status: 'active',
      unsubscribeToken: randomUUID(),
    },
  });

  return NextResponse.json(subscriber, { status: 201 });
}
