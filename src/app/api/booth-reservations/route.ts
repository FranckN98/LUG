import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD = 5000;
const MIN_LONG = 30;

function clean(v: unknown, max = MAX_FIELD): string {
  return String(v ?? '').trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = clean(body.fullName, 200);
    const email = clean(body.email, 200).toLowerCase();
    const phone = clean(body.phone, 60);
    const brandName = clean(body.brandName, 200);
    const boothPurpose = clean(body.boothPurpose, 200);
    const brandDescription = clean(body.brandDescription);
    const visitorTakeaway = clean(body.visitorTakeaway);
    const exhibitionMaterials = clean(body.exhibitionMaterials) || null;
    const peopleCount = clean(body.peopleCount, 20);
    const peopleNames = clean(body.peopleNames, 1000) || null;
    const websiteOrSocial = clean(body.websiteOrSocial, 500) || null;
    const additionalComment = clean(body.additionalComment) || null;
    const locale = ['fr', 'en', 'de'].includes(String(body.locale)) ? String(body.locale) : null;

    const equipmentNeedsRaw: unknown[] = Array.isArray(body.equipmentNeeds) ? body.equipmentNeeds : [];
    const equipmentNeeds = equipmentNeedsRaw
      .map((v: unknown) => clean(v, 100))
      .filter(Boolean)
      .slice(0, 20)
      .join(', ') || null;

    if (!fullName || !email || !phone || !brandName || !boothPurpose || !peopleCount) {
      return NextResponse.json({ error: 'missing_required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }
    if (brandDescription.length < MIN_LONG || visitorTakeaway.length < MIN_LONG) {
      return NextResponse.json({ error: 'too_short' }, { status: 400 });
    }

    const reservation = await prisma.boothReservation.create({
      data: {
        fullName,
        email,
        phone,
        brandName,
        boothPurpose,
        brandDescription,
        visitorTakeaway,
        exhibitionMaterials,
        equipmentNeeds,
        peopleCount,
        peopleNames,
        websiteOrSocial,
        additionalComment,
        locale,
      },
    });

    return NextResponse.json({ ok: true, id: reservation.id }, { status: 201 });
  } catch (err) {
    console.error('[booth-reservations]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
