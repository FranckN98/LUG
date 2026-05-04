import DOMPurify from 'isomorphic-dompurify';

/**
 * Returns true if the given string looks like HTML (contains a tag).
 * Used to decide whether to render rich newsletter body content as-is or to
 * fall back to the legacy plain-text → paragraph splitting behavior.
 */
export function looksLikeHtml(s: string): boolean {
  if (!s) return false;
  return /<\/?[a-z][\s\S]*?>/i.test(s);
}

/**
 * Sanitize HTML for safe inclusion in outgoing emails. Strips scripts, iframes,
 * event handlers, and other unsafe constructs while preserving the inline
 * styling required by email clients.
 */
export function sanitizeEmailHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'a', 'b', 'strong', 'i', 'em', 'u', 's', 'br', 'p', 'div', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'hr', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'figure', 'figcaption', 'small', 'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel', 'style', 'width', 'height',
      'align', 'valign', 'cellpadding', 'cellspacing', 'border', 'colspan', 'rowspan',
      'class', 'id', 'name',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|#|\/)/i,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'style', 'link', 'meta'],
  });
}

/**
 * Sanitize and wrap rich HTML body content for use inside the email body
 * `<td>`. Applies a default font-family / color / line-height by wrapping the
 * sanitized output in a styled div so it visually matches the surrounding
 * email layout.
 */
export function renderRichBodyHtml(bodyHtml: string): string {
  const safe = sanitizeEmailHtml(bodyHtml);
  return `<div style="font-family:system-ui,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.75;color:#2d2d2d">${safe}</div>`;
}

/**
 * Convert HTML body content to a reasonable plain-text equivalent for the
 * text/plain MIME alternative.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)\s*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<img [^>]*alt="([^"]*)"[^>]*\/?>/gi, '[$1]')
    .replace(/<img [^>]*\/?>/gi, '[image]')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
