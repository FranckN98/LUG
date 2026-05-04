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

let cached: InlineLogoAttachment | null = null;

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
  if (cached) return cached;

  // 1) Try local filesystem (dev + bundled deployments)
  try {
    const filePath = path.join(process.cwd(), 'public', 'logo.png');
    const buf = await fs.readFile(filePath);
    cached = {
      filename: 'logo.png',
      content: buf.toString('base64'),
      content_id: INLINE_LOGO_CID,
      content_type: 'image/png',
    };
    return cached;
  } catch {
    // Continue to URL fallback
  }

  // 2) Fallback: fetch the public URL
  const base = siteBaseUrl?.trim() || 'https://www.levelupingermany.com';
  try {
    const res = await fetch(`${base}/logo.png`, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const arr = await res.arrayBuffer();
    cached = {
      filename: 'logo.png',
      content: Buffer.from(arr).toString('base64'),
      content_id: INLINE_LOGO_CID,
      content_type: 'image/png',
    };
    return cached;
  } catch (err) {
    console.warn('[newsletter] Could not load logo for inline embed:', err);
    return null;
  }
}
