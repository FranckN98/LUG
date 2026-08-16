import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { resetFeaturedSocialLinksToDefaults } from '@/lib/socialLinks';

export async function POST() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    await resetFeaturedSocialLinksToDefaults();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Reset featured links error:', error);
    return NextResponse.json(
      { error: 'Impossible de réinitialiser les liens.' },
      { status: 500 },
    );
  }
}
