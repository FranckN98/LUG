/**
 * Newsletter campaign attachments — input normalization and Resend payload helpers.
 *
 * On the admin side the form sends a list of `{filename, url, contentType?, size?}`
 * pairs (the URL pointing to a file already uploaded via the dedicated upload
 * endpoint). On send time we resolve each URL to a base64 string for Resend.
 */

export interface AttachmentInput {
  filename: string;
  url: string;
  contentType?: string | null;
  size?: number | null;
}

export interface ResolvedAttachment {
  filename: string;
  /** Base64-encoded file contents (no data URL prefix). */
  content: string;
}

const MAX_INDIVIDUAL_BYTES = 15 * 1024 * 1024; // 15 MB per file
const MAX_TOTAL_BYTES = 30 * 1024 * 1024; // 30 MB total per email (Resend allows ~40 MB)

export function normalizeAttachmentsInput(input: unknown): AttachmentInput[] {
  if (!Array.isArray(input)) return [];
  const out: AttachmentInput[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const url = typeof r.url === 'string' ? r.url.trim() : '';
    const filename = typeof r.filename === 'string' ? r.filename.trim() : '';
    if (!url || !filename) continue;
    out.push({
      filename,
      url,
      contentType: typeof r.contentType === 'string' ? r.contentType : null,
      size: typeof r.size === 'number' && Number.isFinite(r.size) ? Math.floor(r.size) : null,
    });
  }
  return out;
}

/**
 * Resolve attachments stored as URLs into base64 payloads suitable for the
 * Resend API. Local public-folder URLs (starting with `/`) are read from the
 * filesystem; absolute URLs are fetched.
 *
 * Errors are logged but do not throw — a failing attachment is simply skipped
 * so the email itself still goes out.
 */
export async function resolveAttachmentsForResend(
  attachments: ReadonlyArray<{ filename: string; url: string; size?: number | null }>,
  siteBaseUrl: string,
): Promise<ResolvedAttachment[]> {
  if (!attachments || attachments.length === 0) return [];

  const resolved: ResolvedAttachment[] = [];
  let totalBytes = 0;

  for (const att of attachments) {
    try {
      const url = att.url.trim();
      if (!url) continue;

      let buffer: Buffer | null = null;

      if (url.startsWith('/')) {
        // Local file under /public — read from FS in dev. In production behind
        // Vercel, /public is read-only at runtime, but uploads use Blob (https URL).
        try {
          const { readFile } = await import('fs/promises');
          const { join } = await import('path');
          const fsPath = join(process.cwd(), 'public', url.replace(/^\//, ''));
          buffer = await readFile(fsPath);
        } catch {
          // Fallback: fetch via siteBaseUrl
          const res = await fetch(`${siteBaseUrl}${url}`);
          if (res.ok) buffer = Buffer.from(await res.arrayBuffer());
        }
      } else if (/^https?:\/\//i.test(url)) {
        const res = await fetch(url);
        if (res.ok) buffer = Buffer.from(await res.arrayBuffer());
      }

      if (!buffer) {
        console.warn('[newsletter] attachment fetch failed:', att.filename, att.url);
        continue;
      }
      if (buffer.byteLength > MAX_INDIVIDUAL_BYTES) {
        console.warn('[newsletter] attachment too large, skipped:', att.filename, buffer.byteLength);
        continue;
      }
      if (totalBytes + buffer.byteLength > MAX_TOTAL_BYTES) {
        console.warn('[newsletter] total attachment budget exceeded, skipping:', att.filename);
        continue;
      }
      totalBytes += buffer.byteLength;

      resolved.push({
        filename: att.filename,
        content: buffer.toString('base64'),
      });
    } catch (err) {
      console.error('[newsletter] failed to resolve attachment', att.filename, err);
    }
  }

  return resolved;
}
