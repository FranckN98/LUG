import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/team — returns all stored team member records
export async function GET() {
  const members = await prisma.teamMember.findMany();
  return NextResponse.json(members);
}

// POST /api/admin/team — upsert a team member by name
export async function POST(req: Request) {
  const body = await req.json();
  const { name, roleDe, roleEn, roleFr, bioDe, bioEn, bioFr, linkedin, imageUrl } = body as {
    name: string;
    roleDe?: string;
    roleEn?: string;
    roleFr?: string;
    bioDe?: string;
    bioEn?: string;
    bioFr?: string;
    linkedin?: string;
    imageUrl?: string;
  };

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const member = await prisma.teamMember.upsert({
    where: { name },
    update: {
      roleDe: roleDe ?? '',
      roleEn: roleEn ?? '',
      roleFr: roleFr ?? '',
      bioDe: bioDe ?? '',
      bioEn: bioEn ?? '',
      bioFr: bioFr ?? '',
      linkedin: linkedin ?? '',
      imageUrl: imageUrl ?? '',
    },
    create: {
      name,
      roleDe: roleDe ?? '',
      roleEn: roleEn ?? '',
      roleFr: roleFr ?? '',
      bioDe: bioDe ?? '',
      bioEn: bioEn ?? '',
      bioFr: bioFr ?? '',
      linkedin: linkedin ?? '',
      imageUrl: imageUrl ?? '',
    },
  });

  return NextResponse.json(member);
}

// PATCH /api/admin/team?id=<id> — update a team member by id
export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const body = await req.json();
  const { name, roleDe, roleEn, roleFr, bioDe, bioEn, bioFr, linkedin, imageUrl } = body as {
    name?: string;
    roleDe?: string;
    roleEn?: string;
    roleFr?: string;
    bioDe?: string;
    bioEn?: string;
    bioFr?: string;
    linkedin?: string;
    imageUrl?: string;
  };

  const member = await prisma.teamMember.update({
    where: { id },
    data: {
      ...(typeof name === 'string' ? { name } : {}),
      ...(typeof roleDe === 'string' ? { roleDe } : {}),
      ...(typeof roleEn === 'string' ? { roleEn } : {}),
      ...(typeof roleFr === 'string' ? { roleFr } : {}),
      ...(typeof bioDe === 'string' ? { bioDe } : {}),
      ...(typeof bioEn === 'string' ? { bioEn } : {}),
      ...(typeof bioFr === 'string' ? { bioFr } : {}),
      ...(typeof linkedin === 'string' ? { linkedin } : {}),
      ...(typeof imageUrl === 'string' ? { imageUrl } : {}),
    },
  });

  return NextResponse.json(member);
}

// DELETE /api/admin/team?id=<id> — delete a team member by id
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
