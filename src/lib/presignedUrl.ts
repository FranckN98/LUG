const PRESIGNED_PARAMS = ['X-Amz-Signature', 'Signature'];
const S3_HOST = /(^|\.)amazonaws\.com$/i;

function parse(value: string): URL | null {
  try {
    return new URL(value.trim());
  } catch {
    return null;
  }
}

/** Lien S3 signé (SigV4 ou SigV2) : il ouvre un fichier privé, mais seulement quelques minutes. */
export function isPresignedS3Url(value: string): boolean {
  const url = parse(value);
  if (!url || url.protocol !== 'https:' || !S3_HOST.test(url.hostname)) return false;
  return PRESIGNED_PARAMS.some((p) => url.searchParams.has(p));
}

export function presignedExpiry(value: string): Date | null {
  const url = parse(value);
  if (!url) return null;

  const date = url.searchParams.get('X-Amz-Date')?.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  const seconds = Number(url.searchParams.get('X-Amz-Expires'));
  if (date && seconds > 0) {
    const [, y, mo, d, h, mi, s] = date.map(Number);
    return new Date(Date.UTC(y!, mo! - 1, d!, h!, mi!, s!) + seconds * 1000);
  }

  const epoch = Number(url.searchParams.get('Expires'));
  if (url.searchParams.has('Signature') && epoch > 0) return new Date(epoch * 1000);
  return null;
}

export function isExpiredPresignedUrl(value: string, now: Date = new Date()): boolean {
  const expiry = presignedExpiry(value);
  return expiry !== null && now.getTime() >= expiry.getTime();
}
