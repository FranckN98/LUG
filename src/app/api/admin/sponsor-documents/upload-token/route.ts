import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';

/**
 * Signs a one-shot token allowing the browser to upload a PDF directly to
 * Vercel Blob, bypassing the ~4.5 MB serverless body limit.
 *
 * Once the upload completes, the client posts the resulting URL + metadata
 * to `POST /api/admin/sponsor-documents` (JSON body) to register the row.
 */
export async function POST(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'blob_not_configured' }, { status: 503 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf'],
        // 200 MB upper bound — generous enough for a hi-res book PDF.
        maximumSizeInBytes: 200 * 1024 * 1024,
      }),
      // No-op: the browser will POST the finalised metadata to the main
      // sponsor-documents endpoint right after the upload resolves.
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur token.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
