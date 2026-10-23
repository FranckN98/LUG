import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { listAllFeedback, listFeedback, listTags } from '@/lib/feedback';
import { parseFeedbackFilters, toCsv } from '@/lib/feedbackUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const sp = req.nextUrl.searchParams;
  const filters = parseFeedbackFilters(sp);

  if (sp.get('format') === 'csv') {
    const rows = await listAllFeedback(filters);
    const csv = toCsv(
      [
        'Date',
        'Note',
        'Réponse',
        'Prénom',
        'Nom',
        'Moment ou aspect marquant',
        'Apprécié et à améliorer',
        'Intervenants ou invités souhaités',
        'Sujets à aborder',
        'Étiquettes',
      ],
      rows.map((r) => [
        r.submittedOn.toISOString().slice(0, 10),
        r.rating,
        r.isSigned ? 'Signée' : 'Anonyme',
        r.firstName,
        r.lastName,
        r.highlights,
        r.likesAndImprovements,
        r.wantedSpeakers,
        r.wantedTopics,
        r.tags.map((t) => t.name).join(', '),
      ]),
    );
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="feedback-level-up-2eme-edition.csv"',
        'Cache-Control': 'no-store',
      },
    });
  }

  const limit = Math.min(Math.max(Number.parseInt(sp.get('limit') ?? '25', 10) || 25, 1), 100);
  const offset = Math.max(Number.parseInt(sp.get('offset') ?? '0', 10) || 0, 0);
  const [list, tags] = await Promise.all([listFeedback(filters, { limit, offset }), listTags()]);
  return NextResponse.json({ ...list, tags }, { headers: { 'Cache-Control': 'no-store' } });
}
