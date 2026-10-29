import { isExpiredPresignedUrl } from '@/lib/presignedUrl';
import { saveMediaFile, type MediaSubfolder } from '@/lib/mediaStorage';

const MAX_BYTES = 10 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const TYPE_BY_EXT: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

export class RehostError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/**
 * Un lien S3 signé expire en quelques minutes : l'image est téléchargée une fois (tant que le lien est valide)
 * puis hébergée par le site, pour qu'elle reste affichée. L'appelant doit avoir vérifié `isPresignedS3Url`.
 */
export async function rehostPresignedImage(url: string, subfolder: MediaSubfolder = 'media') {
  if (isExpiredPresignedUrl(url)) {
    throw new RehostError('Ce lien S3 signé a expiré. Générez-en un nouveau, ou téléversez directement le fichier.');
  }

  let res: Response;
  try {
    res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new RehostError("Impossible de télécharger l'image depuis S3.", 502);
  }
  if (!res.ok) {
    throw new RehostError(
      res.status === 403 ? 'Lien S3 refusé ou expiré (403). Générez un nouveau lien signé.' : `Téléchargement impossible (HTTP ${res.status}).`,
    );
  }

  const filename = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'image');
  const fileExt = filename.split('.').pop()?.toLowerCase() ?? '';
  const headerType = (res.headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
  // Les objets S3 envoyés sans type arrivent en « binary/octet-stream » : on se fie alors à l'extension.
  const mimeType = EXT_BY_TYPE[headerType] ? headerType : TYPE_BY_EXT[fileExt];
  const ext = mimeType ? EXT_BY_TYPE[mimeType] : undefined;
  if (!mimeType || !ext) throw new RehostError('Format non pris en charge : utilisez JPG, PNG, WebP ou GIF.');

  if (Number(res.headers.get('content-length') ?? 0) > MAX_BYTES) throw new RehostError('Fichier trop lourd (max 10 Mo).');
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_BYTES) throw new RehostError('Fichier trop lourd (max 10 Mo).');

  const savedUrl = await saveMediaFile(buffer, `${crypto.randomUUID()}.${ext}`, subfolder);
  return { url: savedUrl, filename, size: buffer.length, mimeType };
}
