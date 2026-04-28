import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      birthDate,
      address,
      email,
      phone,
      activityDomain,
      motivation,
      helpDomains,
      consentGiven,
    } = body as Record<string, unknown>;

    // Required field validation
    if (
      !firstName ||
      !lastName ||
      !birthDate ||
      !address ||
      !email ||
      !activityDomain ||
      !helpDomains
    ) {
      return NextResponse.json({ error: 'Tous les champs obligatoires doivent être remplis.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }
    if (!consentGiven) {
      return NextResponse.json({ error: 'Le consentement est obligatoire.' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await prisma.member.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: 'Une demande avec cette adresse email existe déjà.' },
        { status: 409 },
      );
    }

    const helpDomainsStr = Array.isArray(helpDomains)
      ? (helpDomains as string[]).join(', ')
      : String(helpDomains);

    const member = await prisma.member.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        birthDate: new Date(String(birthDate)),
        address: String(address).trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        activityDomain: String(activityDomain).trim(),
        motivation: motivation ? String(motivation).trim() : null,
        helpDomains: helpDomainsStr,
        applicationStatus: 'pending',
        consentGiven: true,
      },
    });

    return NextResponse.json(
      { ok: true, id: member.id },
      { status: 201 },
    );
  } catch (err) {
    console.error('[members/apply]', err);
    return NextResponse.json({ error: 'Erreur serveur. Réessayez plus tard.' }, { status: 500 });
  }
}
