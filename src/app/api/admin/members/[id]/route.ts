import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sendMemberWelcomeEmail,
  sendMemberRejectionEmail,
} from '@/lib/memberEmails';
import { subscribeMemberToNewsletter } from '@/lib/memberNewsletter';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(member);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Action: accept / reject
  if (body.action === 'accept') {
    const updated = await prisma.member.update({
      where: { id },
      data: { applicationStatus: 'accepted', welcomeShortSentAt: new Date() },
    });
    // Fire-and-forget welcome email
    sendMemberWelcomeEmail(member.email, member.firstName).catch(console.error);
    // Auto-subscribe to newsletter
    subscribeMemberToNewsletter({
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
    }).catch(console.error);
    return NextResponse.json(updated);
  }

  if (body.action === 'reject') {
    const reason = String(body.rejectionReason ?? '').trim();
    const updated = await prisma.member.update({
      where: { id },
      data: { applicationStatus: 'rejected', rejectionReason: reason || null },
    });
    sendMemberRejectionEmail(member.email, member.firstName, reason).catch(console.error);
    return NextResponse.json(updated);
  }

  // Payment update
  const data: Record<string, unknown> = {};
  if (typeof body.membershipFeePaid === 'boolean') {
    data.membershipFeePaid = body.membershipFeePaid;
    if (body.membershipFeePaid) {
      data.lastPaymentDate = new Date();
    }
  }
  if (body.lastPaymentDate !== undefined) {
    data.lastPaymentDate = body.lastPaymentDate ? new Date(body.lastPaymentDate) : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour.' }, { status: 400 });
  }

  const updated = await prisma.member.update({ where: { id }, data });
  return NextResponse.json(updated);
}
