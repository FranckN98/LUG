import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getEntryById, updateEntryStatus } from '@/lib/lemfiContest';
import { sendValidationConfirmationEmail, sendRejectionEmail } from '@/lib/lemfiContestEmail';

export async function POST(
  request: NextRequest,
  { params }: { params: { entryId: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { entryId } = params;
    const body = await request.json();
    const { action, reason } = body;

    if (!action || !['validated', 'rejected'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (action === 'rejected' && !reason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const entry = await getEntryById(entryId);

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    const displayNumber = `LU${entry.sequentialNumber}`;

    // Update status
    const updated = await updateEntryStatus(
      entryId,
      action,
      action === 'rejected' ? reason : undefined
    );

    // Send email to participant (non-blocking)
    if (action === 'validated') {
      sendValidationConfirmationEmail({
        email: entry.email,
        firstName: entry.firstName,
        displayNumber,
      }).catch((err) => console.error('Validation email failed:', err));
    } else if (action === 'rejected') {
      sendRejectionEmail({
        email: entry.email,
        firstName: entry.firstName,
        displayNumber,
        reason,
      }).catch((err) => console.error('Rejection email failed:', err));
    }

    return NextResponse.json({
      success: true,
      entry: {
        id: updated.id,
        displayNumber,
        status: updated.status,
        rejectionReason: updated.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}
