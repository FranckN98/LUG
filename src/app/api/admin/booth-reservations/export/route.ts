import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const COLUMNS = [
  'id',
  'createdAt',
  'status',
  'fullName',
  'email',
  'phone',
  'brandName',
  'boothPurpose',
  'brandDescription',
  'visitorTakeaway',
  'exhibitionMaterials',
  'equipmentNeeds',
  'peopleCount',
  'peopleNames',
  'websiteOrSocial',
  'additionalComment',
  'locale',
] as const;

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = v instanceof Date ? v.toISOString() : String(v);
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const rows = await prisma.boothReservation.findMany({ orderBy: { createdAt: 'desc' } });
  const header = COLUMNS.join(',');
  const lines = rows.map((r) =>
    COLUMNS.map((c) => csvEscape((r as Record<string, unknown>)[c])).join(','),
  );
  const csv = '\uFEFF' + [header, ...lines].join('\r\n');
  const filename = `booth-reservations-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
