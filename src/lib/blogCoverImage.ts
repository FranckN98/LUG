const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
]);

function isPrivateIpv4Hostname(hostname: string) {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;

  const octets = match.slice(1).map(Number);
  if (octets.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return true;
  }

  if (octets[0] === 10 || octets[0] === 127) return true;
  if (octets[0] === 192 && octets[1] === 168) return true;
  if (octets[0] === 169 && octets[1] === 254) return true;
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;

  return false;
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(normalized)) {
    return true;
  }

  if (normalized.endsWith('.local') || normalized.endsWith('.internal')) {
    return true;
  }

  return isPrivateIpv4Hostname(normalized);
}

export function normalizeBlogCoverImageUrl(value: unknown) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return trimmed;
}

export function isAllowedExternalImageUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return false;
    }

    return !isBlockedHostname(url.hostname);
  } catch {
    return false;
  }
}

export function getBlogCoverImageSrc(value: string | null | undefined) {
  const normalized = normalizeBlogCoverImageUrl(value);
  if (!normalized) return null;

  if (normalized.startsWith('/')) {
    return normalized;
  }

  if (!isAllowedExternalImageUrl(normalized)) {
    return normalized;
  }

  return `/api/blog/cover-image?url=${encodeURIComponent(normalized)}`;
}