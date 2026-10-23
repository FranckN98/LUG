import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { listNewsSignups } from '@/lib/feedback';
import { toCsv } from '@/lib/feedbackUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Liste séparée des réponses : ces inscriptions n'ont ni date ni lien avec un feedback. */
export async function GET(req: NextRequest) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const signups = await listNewsSignups();

  if (req.nextUrl.searchParams.get('format') === 'csv') {
    const csv = toCsv(
      ['Adresse e-mail', 'Prénom', 'Nom'],
      signups.map((s) => [s.email, s.firstName, s.lastName]),
    );
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="inscriptions-prochaines-nouvelles.csv"',
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json({ signups }, { headers: { 'Cache-Control': 'no-store' } });
}
