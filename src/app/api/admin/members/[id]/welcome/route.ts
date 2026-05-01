import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMemberWelcomeEmail } from '@/lib/memberEmails';
import { subscribeMemberToNewsletter } from '@/lib/memberNewsletter';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await sendMemberWelcomeEmail(member.email, member.firstName);
    await prisma.member.update({
      where: { id },
      data: { welcomeShortSentAt: new Date() },
    });
    // Auto-subscribe to newsletter (idempotent)
    subscribeMemberToNewsletter({
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
    }).catch(console.error);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[members/welcome] failed:', err);
    return NextResponse.json({ error: "Échec de l'envoi de l'email." }, { status: 500 });
  }
}
