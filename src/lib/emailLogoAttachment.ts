import { promises as fs } from 'fs';
import path from 'path';

/** CID used to reference the inline logo in email HTML (`<img src="cid:lug-logo" />`). */
export const INLINE_LOGO_CID = 'lug-logo';

interface InlineLogoAttachment {
  filename: string;
  content: string; // base64 (no data: prefix)
  content_id: string;
  content_type: string;
}

let cachedDefault: InlineLogoAttachment | null = null;

const EXT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

function mimeFromExt(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return EXT_TO_MIME[ext] || 'image/png';
}

/**
 * Read the brand logo as base64 and return it as an inline (CID) attachment
 * for Resend. Embedding the logo inline guarantees it renders in email
 * clients that block external images by default (Gmail, Outlook, …).
 *
 * Tries the local filesystem first (works in dev and when Vercel includes
 * `public/` in the function bundle), then falls back to fetching the public
 * URL (works in any deployment as long as the site is reachable).
 *
 * Returns `null` only if both strategies fail.
 */
export async function getInlineLogoAttachment(
  siteBaseUrl?: string,
): Promise<InlineLogoAttachment | null> {
  if (cachedDefault) return cachedDefault;

  // 1) Try local filesystem (dev + bundled deployments)
  try {
    const filePath = path.join(process.cwd(), 'public', 'logo.png');
    const buf = await fs.readFile(filePath);
    cachedDefault = {
      filename: 'logo.png',
      content: buf.toString('base64'),
      content_id: INLINE_LOGO_CID,
      content_type: 'image/png',
    };
    return cachedDefault;
  } catch {
    // Continue to URL fallback
  }

  // 2) Fallback: fetch the public URL
  const base = siteBaseUrl?.trim() || 'https://www.levelupingermany.com';
  try {
    const res = await fetch(`${base}/logo.png`, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const arr = await res.arrayBuffer();
    cachedDefault = {
      filename: 'logo.png',
      content: Buffer.from(arr).toString('base64'),
      content_id: INLINE_LOGO_CID,
      content_type: 'image/png',
    };
    return cachedDefault;
  } catch (err) {
    console.warn('[newsletter] Could not load default logo for inline embed:', err);
    return null;
  }
}

/**
 * Load an arbitrary image (URL or relative path) and return it as an inline
 * (CID) attachment. Used to embed user-uploaded campaign header logos so
 * they render in email clients that block remote images.
 *
 * - Absolute https/http URLs are fetched as-is.
 * - Relative paths starting with `/` are resolved against `siteBaseUrl`.
 * - Other strings are treated as relative to `siteBaseUrl`.
 *
 * Returns `null` if the image cannot be loaded.
 */
export async function loadHeaderImageAsInline(
  url: string,
  siteBaseUrl: string,
): Promise<InlineLogoAttachment | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let absoluteUrl: string;
  if (/^https?:\/\//i.test(trimmed)) {
    absoluteUrl = trimmed;
  } else if (trimmed.startsWith('/')) {
    absoluteUrl = `${siteBaseUrl}${trimmed}`;
  } else {
    absoluteUrl = `${siteBaseUrl}/${trimmed}`;
  }

  // For relative paths under public/, try the filesystem first
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    try {
      const filePath = path.join(process.cwd(), 'public', trimmed.replace(/^\/+/, ''));
      const buf = await fs.readFile(filePath);
      const filename = path.basename(filePath);
      return {
        filename,
        content: buf.toString('base64'),
        content_id: INLINE_LOGO_CID,
        content_type: mimeFromExt(filename),
      };
    } catch {
      // Fall through to fetch
    }
  }

  try {
    const res = await fetch(absoluteUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const arr = await res.arrayBuffer();
    const filename = decodeURIComponent(absoluteUrl.split('/').pop() || 'logo.png').split('?')[0];
    return {
      filename: filename || 'logo.png',
      content: Buffer.from(arr).toString('base64'),
      content_id: INLINE_LOGO_CID,
      content_type: mimeFromExt(filename),
    };
  } catch (err) {
    console.warn('[newsletter] Could not load header image for inline embed:', absoluteUrl, err);
    return null;
  }
}
