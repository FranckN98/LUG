/** Envoi des photos depuis l'admin : réduction des fichiers trop lourds et messages d'erreur lisibles. */

export type UploadedMedia = { id: string; url: string; filename: string; category: string };
export type UploadResult = { ok: true; item: UploadedMedia } | { ok: false; error: string };

// Vercel refuse les requêtes de plus de 4,5 Mo : on garde de la marge pour le formulaire.
const MAX_DIRECT_BYTES = 4_000_000;
const MAX_DIMENSION = 2800;

/** Réduit une grosse photo (JPEG/PNG/WebP) pour qu'elle passe sous la limite du serveur ; les autres formats sont envoyés tels quels. */
export async function shrinkImage(file: File): Promise<File> {
  if (file.size <= MAX_DIRECT_BYTES || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    let scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    for (const quality of [0.85, 0.75, 0.6]) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_DIRECT_BYTES) {
        return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
      }
      scale *= 0.8;
    }
  } catch {
    // décodage impossible : le serveur renverra une erreur explicite
  }
  return file;
}

export async function uploadMediaFile(file: File, category: string, altText = ''): Promise<UploadResult> {
  const prepared = await shrinkImage(file);
  const body = new FormData();
  body.append('file', prepared);
  body.append('category', category);
  if (altText) body.append('altText', altText);

  let res: Response;
  try {
    res = await fetch('/api/admin/media/upload', { method: 'POST', body });
  } catch {
    return { ok: false, error: `${file.name} : erreur réseau.` };
  }

  const data = await res.json().catch(() => null);
  if (res.ok && data?.url) return { ok: true, item: data as UploadedMedia };
  if (res.status === 413) return { ok: false, error: `${file.name} : fichier trop lourd pour le serveur (max ~4 Mo).` };
  if (res.status === 401) return { ok: false, error: 'Session expirée : reconnectez-vous puis réessayez.' };
  return { ok: false, error: `${file.name} : ${data?.error ?? `erreur serveur (${res.status})`}` };
}

/** Envoie les fichiers un par un ; une erreur n'interrompt pas les suivants. */
export async function uploadMediaFiles(files: File[], category: string, altText = ''): Promise<{ added: number; errors: string[] }> {
  let added = 0;
  const errors: string[] = [];
  for (const file of files) {
    const result = await uploadMediaFile(file, category, altText);
    if (result.ok) added++;
    else errors.push(result.error);
  }
  return { added, errors };
}
