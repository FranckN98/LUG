import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { listCommunityGalleryItems } from '@/lib/communityGallery';

// GET /api/admin/community — photos de la galerie communauté (téléversements + fichiers du site), dans l'ordre d'affichage public.
export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json(await listCommunityGalleryItems());
  } catch (e) {
    console.error('[admin-community]', e);
    return NextResponse.json({ error: 'Galerie indisponible.' }, { status: 500 });
  }
}
