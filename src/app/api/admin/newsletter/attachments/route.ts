import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';

// Per-file cap. Resend allows up to ~40 MB per email *total*; base64 encoding
// inflates payloads by ~33%, so we cap each file at 15 MB and rely on the
// admin UI to warn if the overall total starts to climb.
const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function isAdmin(): boolean {
  return cookies().get('admin_session')?.value === 'authenticated';
}

function safeFilename(name: string): string {
  // Strip path separators, keep extension, allow unicode-ish chars but trim.
  const cleaned = name.replace(/[\\/]/g, '_').replace(/\s+/g, '_');
  return cleaned.length > 120 ? cleaned.slice(0, 120) : cleaned;
}

async function saveFile(buffer: Buffer, savedFilename: string): Promise<string> {
  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`newsletter-attachments/${savedFilename}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url;
  }
  const dir = join(process.cwd(), 'public', 'newsletter-attachments');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, savedFilename), buffer);
  return `/newsletter-attachments/${savedFilename}`;
}

export async function POST(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Fichier vide.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `Fichier trop lourd (max ${Math.round(MAX_SIZE / 1024 / 1024)} Mo).` },
      { status: 400 },
    );
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Type de fichier non autorisé: ${file.type}` },
      { status: 400 },
    );
  }

  const originalName = file.name || 'piece-jointe';
  const ext = originalName.includes('.') ? originalName.split('.').pop()!.toLowerCase() : 'bin';
  const uuid = crypto.randomUUID();
  const savedFilename = `${uuid}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const url = await saveFile(buffer, savedFilename);

  return NextResponse.json(
    {
      filename: safeFilename(originalName),
      url,
      contentType: file.type || null,
      size: file.size,
    },
    { status: 201 },
  );
}
