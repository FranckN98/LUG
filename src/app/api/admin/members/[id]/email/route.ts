import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMemberCustomEmail } from '@/lib/memberEmails';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { subject?: string; message?: string; preset?: 'welcome-full' | 'info-pack' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const subject = body.subject?.trim();
  const message = body.message?.trim();
  const preset = body.preset;

  if (!preset && (!subject || !message)) {
    return NextResponse.json(
      { error: 'subject et message requis (ou preset).' },
      { status: 400 },
    );
  }

  try {
    await sendMemberCustomEmail({
      email: member.email,
      firstName: member.firstName,
      subject: subject ?? '',
      message: message ?? '',
      preset,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[members/email] failed:', err);
    return NextResponse.json({ error: "Échec de l'envoi de l'email." }, { status: 500 });
  }
}
