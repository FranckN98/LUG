import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import {
  listEntriesForAdmin,
  getEntryById,
  updateEntryStatus,
  getEntryStats,
} from '@/lib/lemfiContest';
import { sendValidationConfirmationEmail, sendRejectionEmail } from '@/lib/lemfiContestEmail';

export async function GET(request: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const { entries, total } = await listEntriesForAdmin({
      status: status || undefined,
      search: search || undefined,
      limit,
      offset,
    });

    const stats = await getEntryStats();

    return NextResponse.json({
      success: true,
      entries,
      total,
      stats,
      contestFull: stats.total >= 151,
    });
  } catch (error) {
    console.error('List entries error:', error);
    return NextResponse.json(
      { error: 'Failed to list entries' },
      { status: 500 }
    );
  }
}
