import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMemberPaymentReminderEmail } from '@/lib/memberEmails';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await sendMemberPaymentReminderEmail(member.email, member.firstName);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[members/remind]', err);
    return NextResponse.json({ error: "Échec de l'envoi de l'email." }, { status: 500 });
  }
}
