import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

// Sur Vercel le disque est en lecture seule : avec BLOB_READ_WRITE_TOKEN on envoie vers Vercel Blob,
// sinon (développement local) on écrit dans /public.
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export type MediaSubfolder = 'media' | 'community';

/** Enregistre un fichier et renvoie son URL publique (chemin relatif ou URL Blob absolue). */
export async function saveMediaFile(buffer: Buffer, savedFilename: string, subfolder: MediaSubfolder): Promise<string> {
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`${subfolder}/${savedFilename}`, buffer, { access: 'public', addRandomSuffix: false });
    return blob.url;
  }

  const dir = join(process.cwd(), 'public', subfolder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, savedFilename), buffer);
  return `/${subfolder}/${savedFilename}`;
}
