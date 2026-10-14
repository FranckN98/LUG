import { NextRequest, NextResponse } from 'next/server';
import { getEntryByAccessToken } from '@/lib/lemfiContest';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token || token.length < 32) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 400 }
      );
    }

    const entry = await getEntryByAccessToken(token);

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found or token expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      entry: {
        displayNumber: `LU${entry.sequentialNumber}`,
        firstName: entry.firstName,
        lastName: entry.lastName,
        status: entry.status,
        rejectionReason: entry.rejectionReason || null,
        createdAt: entry.createdAt,
        validatedAt: entry.validatedAt,
        rejectedAt: entry.rejectedAt,
      },
    });
  } catch (error) {
    console.error('Track entry error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
