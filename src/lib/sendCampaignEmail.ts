function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

import { emailLinksFooterEnglishHtml, emailLinksFooterEnglishText } from '@/lib/emailFooter';
import { looksLikeHtml, renderRichBodyHtml, htmlToPlainText } from '@/lib/emailHtmlSanitizer';
import { getInlineLogoAttachment, INLINE_LOGO_CID } from '@/lib/emailLogoAttachment';

export interface CampaignContent {
  subject: string;
  previewText?: string;
  titleText?: string;
  bodyContent: string;
  headerImageUrl?: string;
  campaignImageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

function absoluteUrl(url: string | undefined, siteBaseUrl: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${siteBaseUrl}${trimmed}`;
  return `${siteBaseUrl}/${trimmed}`;
}

export function buildCampaignHtml(
  content: CampaignContent,
  unsubscribeUrl: string,
  siteBaseUrl: string,
): string {
  const { subject, previewText, titleText, bodyContent, headerImageUrl, campaignImageUrl, ctaLabel, ctaUrl, footerNote } = content;
  const normalizedHeaderImageUrl = absoluteUrl(headerImageUrl, siteBaseUrl);
  const normalizedCampaignImageUrl = absoluteUrl(campaignImageUrl, siteBaseUrl);

  const paragraphs = looksLikeHtml(bodyContent)
    ? renderRichBodyHtml(bodyContent)
    : bodyContent
        .split(/\n\n+/)
        .filter(Boolean)
        .map(
          (p) =>
            `<p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#2d2d2d">${esc(p.trim()).replace(/\n/g, '<br/>')}</p>`,
        )
        .join('');

  const titleBlock = titleText
    ? `<h1 style="margin:0 0 28px;font-size:28px;font-weight:800;color:#1a1a1a;line-height:1.2;letter-spacing:-0.02em">${esc(titleText)}</h1>`
    : '';

  const campaignImageBlock = normalizedCampaignImageUrl
    ? `<div style="margin:0 0 24px;text-align:center"><img src="${esc(normalizedCampaignImageUrl)}" alt="Image de campagne" style="display:inline-block;max-width:100%;height:auto;border:0;border-radius:14px" /></div>`
    : '';

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<div style="text-align:center;margin:36px 0">
          <a href="${esc(ctaUrl)}" style="display:inline-block;background:#8C1A1A;color:#ffffff;font-weight:700;font-size:15px;padding:15px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.03em;box-shadow:0 4px 14px rgba(140,26,26,0.35)">${esc(ctaLabel)}</a>
        </div>`
      : '';

  const footerNoteBlock = footerNote
    ? `<p style="margin:0 0 14px;font-size:13px;color:#666;line-height:1.6">${esc(footerNote)}</p>`
    : '';

  const previewSnippet = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;color:transparent">${esc(previewText)}</div>`
    : '';

  // Header image: displayed prominently above the name bar if provided.
  // Falls back to the inline-embedded logo (cid:) so it renders even when the
  // email client blocks external images.
  const headerImageBlock = normalizedHeaderImageUrl
    ? `<img src="${esc(normalizedHeaderImageUrl)}" alt="Logo" width="160" style="display:block;margin:0 auto 16px;max-width:160px;height:auto;border:0" />`
    : `<img src="cid:${INLINE_LOGO_CID}" alt="Level Up in Germany" width="140" style="display:block;margin:0 auto 12px;max-width:140px;height:auto;border:0" />`;


  return `<!DOCTYPE html>
<html lang="fr" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${esc(subject)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @media only screen and (max-width:600px){
      .email-wrapper{padding:16px 12px!important}
      .email-card{border-radius:12px!important}
      .email-header{padding:24px 24px!important}
      .email-body{padding:28px 24px 24px!important}
      .email-footer{padding:20px 24px!important}
      h1{font-size:22px!important}
      .cta-btn{padding:13px 28px!important;font-size:14px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0eded;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  ${previewSnippet}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-wrapper" style="background-color:#f0eded;padding:40px 20px">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%" class="email-card">

        <!-- ══ HEADER ══ -->
        <tr>
          <td class="email-header" style="background-color:#130505;padding:32px 40px;text-align:center;border-radius:16px 16px 0 0">
            ${headerImageBlock}
            <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.45)">Level Up in Germany</p>
          </td>
        </tr>

        <!-- ══ ACCENT BAR ══ -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,#8C1A1A 0%,#C0392B 50%,#e05050 100%)"></td>
        </tr>

        <!-- ══ BODY ══ -->
        <tr>
          <td class="email-body" style="background-color:#ffffff;padding:44px 40px 36px">
            ${titleBlock}
            ${campaignImageBlock}
            ${paragraphs}
            ${ctaBlock}
          </td>
        </tr>

        <!-- ══ CONTACT & SOCIAL FOOTER ══ -->
        <tr>
          <td style="background-color:#ffffff;padding:0 40px 8px">
            ${emailLinksFooterEnglishHtml()}
          </td>
        </tr>

        <!-- ══ SIGNATURE ══ -->
        <tr>
          <td style="background-color:#ffffff;padding:0 40px 28px">
            <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 24px"/>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top;padding-right:12px">
                  <div style="width:36px;height:36px;background:#8C1A1A;border-radius:50%;text-align:center;line-height:36px;font-size:14px;color:white;font-weight:700">L</div>
                </td>
                <td style="vertical-align:top">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1a1a1a">The Level Up in Germany Team</p>
                  <p style="margin:0;font-size:12px;color:#999;line-height:1.5">African community in Germany</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ FOOTER ══ -->
        <tr>
          <td class="email-footer" style="background-color:#f9f7f7;padding:24px 40px;border-top:1px solid #eeeeee;border-radius:0 0 16px 16px">
            ${footerNoteBlock}
            <p style="margin:0 0 8px;font-size:11px;color:#bbb;line-height:1.6">Level Up in Germany · Germany · <a href="${siteBaseUrl}" style="color:#bbb;text-decoration:underline">${siteBaseUrl.replace(/^https?:\/\//, '')}</a></p>
            <p style="margin:0;font-size:11px;color:#ccc;line-height:1.6">
              You're receiving this email because you subscribed to our newsletter.&nbsp;
              <a href="${esc(unsubscribeUrl)}" style="color:#8C1A1A;text-decoration:underline;font-weight:600">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildCampaignText(content: CampaignContent, unsubscribeUrl: string): string {
  const lines: string[] = [];
  if (content.titleText) {
    lines.push(content.titleText, '='.repeat(content.titleText.length), '');
  }
  lines.push(content.titleText ? '' : '');
  const bodyText = looksLikeHtml(content.bodyContent)
    ? htmlToPlainText(content.bodyContent)
    : content.bodyContent;
  lines.push(bodyText, '');
  if (content.ctaLabel && content.ctaUrl) {
    lines.push(`→ ${content.ctaLabel}: ${content.ctaUrl}`, '');
  }
  lines.push(emailLinksFooterEnglishText());
  lines.push('--', 'The Level Up in Germany Team', 'Germany', '');
  lines.push(`Unsubscribe: ${unsubscribeUrl}`);
  return lines.join('\n');
}

// ── Multilingual email rendering ────────────────────────────────────────────

export type MultilingualLocale = 'fr' | 'en' | 'de';

const LOCALE_FLAG: Record<MultilingualLocale, string> = { fr: '🇫🇷', en: '🇬🇧', de: '🇩🇪' };
const LOCALE_NAME: Record<MultilingualLocale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
};
const LOCALE_JUMP_LABEL: Record<MultilingualLocale, string> = {
  fr: 'Lire en français',
  en: 'Read in English',
  de: 'Auf Deutsch lesen',
};

export interface MultilingualSection {
  locale: MultilingualLocale;
  content: CampaignContent;
}

/**
 * Build ONE email containing all available locale sections, stacked vertically
 * with anchor jump links at the top. Header image, campaign image, CTA URL and
 * footer (unsubscribe / contact links) are shared across sections.
 *
 * The first section in `sections` is treated as the primary language and drives
 * the `<html lang>` attribute; the rest follow in the provided order.
 */
export function buildMultilingualCampaignHtml(
  sections: ReadonlyArray<MultilingualSection>,
  unsubscribeUrl: string,
  siteBaseUrl: string,
  sharedSubject?: string,
): string {
  if (sections.length === 0) {
    throw new Error('buildMultilingualCampaignHtml: at least one section required');
  }

  const primary = sections[0];
  const previewText = primary.content.previewText;
  const headerImageUrl = primary.content.headerImageUrl;
  const campaignImageUrl = primary.content.campaignImageUrl;
  const ctaUrl = primary.content.ctaUrl;

  const normalizedHeaderImageUrl = absoluteUrl(headerImageUrl, siteBaseUrl);
  const normalizedCampaignImageUrl = absoluteUrl(campaignImageUrl, siteBaseUrl);
  const subjectForTitle = sharedSubject || primary.content.subject;

  const previewSnippet = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;color:transparent">${esc(previewText)}</div>`
    : '';

  const headerImageBlock = normalizedHeaderImageUrl
    ? `<img src="${esc(normalizedHeaderImageUrl)}" alt="Logo" width="160" style="display:block;margin:0 auto 16px;max-width:160px;height:auto;border:0" />`
    : `<img src="cid:${INLINE_LOGO_CID}" alt="Level Up in Germany" width="140" style="display:block;margin:0 auto 12px;max-width:140px;height:auto;border:0" />`;

  // Campaign image: shared, displayed once at the top of the body
  const campaignImageBlock = normalizedCampaignImageUrl
    ? `<div style="margin:0 0 28px;text-align:center"><img src="${esc(normalizedCampaignImageUrl)}" alt="" style="display:inline-block;max-width:100%;height:auto;border:0;border-radius:14px" /></div>`
    : '';

  // Language nav (only if more than one section)
  const langNav =
    sections.length > 1
      ? `
        <div style="margin:0 0 28px;padding:14px 16px;background:#f6efef;border-radius:10px;border:1px solid #efe0e0;text-align:center">
          <p style="margin:0 0 8px;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#8C1A1A">
            Choose your language · Wähle deine Sprache · Choisis ta langue
          </p>
          <p style="margin:0;font-size:13px;line-height:1.9">
            ${sections
              .map(
                (s) =>
                  `<a href="#section-${s.locale}" style="display:inline-block;margin:0 6px;padding:5px 12px;background:#ffffff;border:1px solid #efe0e0;border-radius:999px;color:#8C1A1A;text-decoration:none;font-weight:600">${LOCALE_FLAG[s.locale]} ${esc(LOCALE_NAME[s.locale])}</a>`,
              )
              .join('')}
          </p>
        </div>`
      : '';

  // Per-section block (title, body, CTA, footer note)
  const sectionBlock = (s: MultilingualSection, index: number, total: number): string => {
    const { content, locale } = s;

    const paragraphs = looksLikeHtml(content.bodyContent)
      ? renderRichBodyHtml(content.bodyContent)
      : content.bodyContent
          .split(/\n\n+/)
          .filter(Boolean)
          .map(
            (p) =>
              `<p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#2d2d2d">${esc(p.trim()).replace(/\n/g, '<br/>')}</p>`,
          )
          .join('');

    const titleBlock = content.titleText
      ? `<h2 style="margin:0 0 24px;font-size:24px;font-weight:800;color:#1a1a1a;line-height:1.2;letter-spacing:-0.02em">${esc(content.titleText)}</h2>`
      : '';

    const ctaBlock =
      content.ctaLabel && (content.ctaUrl || ctaUrl)
        ? `<div style="text-align:center;margin:32px 0">
            <a href="${esc(content.ctaUrl || ctaUrl || '#')}" style="display:inline-block;background:#8C1A1A;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.03em;box-shadow:0 4px 14px rgba(140,26,26,0.35)">${esc(content.ctaLabel)}</a>
          </div>`
        : '';

    const footerNoteBlock = content.footerNote
      ? `<p style="margin:18px 0 0;padding:14px 16px;background:#fafafa;border-left:3px solid #8C1A1A;border-radius:6px;font-size:13px;color:#666;line-height:1.6">${esc(content.footerNote)}</p>`
      : '';

    const langChip = `
      <div style="margin:0 0 18px">
        <span style="display:inline-block;padding:4px 12px;background:#1a0a0a;color:#ffffff;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase">${LOCALE_FLAG[locale]} ${esc(LOCALE_NAME[locale])}</span>
      </div>`;

    // Other-language jump links (small, under each section)
    const others = sections.filter((x) => x.locale !== locale);
    const jumpLinks =
      others.length > 0
        ? `<p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center">
            ${others
              .map(
                (o) =>
                  `<a href="#section-${o.locale}" style="color:#8C1A1A;text-decoration:none;margin:0 6px">${LOCALE_FLAG[o.locale]} ${esc(LOCALE_JUMP_LABEL[o.locale])}</a>`,
              )
              .join(' · ')}
          </p>`
        : '';

    const divider =
      index < total - 1
        ? `<div style="margin:36px -40px 36px;height:1px;background:linear-gradient(90deg,transparent 0%,#e8d8d8 25%,#e8d8d8 75%,transparent 100%)"></div>`
        : '';

    return `
      <a id="section-${locale}" name="section-${locale}" style="display:block;height:1px;line-height:1px;font-size:1px">&nbsp;</a>
      ${langChip}
      ${titleBlock}
      ${paragraphs}
      ${ctaBlock}
      ${footerNoteBlock}
      ${jumpLinks}
      ${divider}
    `;
  };

  const sectionsHtml = sections.map((s, i) => sectionBlock(s, i, sections.length)).join('');

  return `<!DOCTYPE html>
<html lang="${primary.locale}" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${esc(subjectForTitle)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @media only screen and (max-width:600px){
      .email-wrapper{padding:16px 12px!important}
      .email-card{border-radius:12px!important}
      .email-header{padding:24px 24px!important}
      .email-body{padding:28px 24px 24px!important}
      .email-footer{padding:20px 24px!important}
      h2{font-size:20px!important}
      .cta-btn{padding:13px 28px!important;font-size:14px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0eded;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  ${previewSnippet}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-wrapper" style="background-color:#f0eded;padding:40px 20px">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%" class="email-card">

        <tr>
          <td class="email-header" style="background-color:#130505;padding:32px 40px;text-align:center;border-radius:16px 16px 0 0">
            ${headerImageBlock}
            <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.45)">Level Up in Germany</p>
          </td>
        </tr>

        <tr>
          <td style="height:3px;background:linear-gradient(90deg,#8C1A1A 0%,#C0392B 50%,#e05050 100%)"></td>
        </tr>

        <tr>
          <td class="email-body" style="background-color:#ffffff;padding:36px 40px 28px">
            ${campaignImageBlock}
            ${langNav}
            ${sectionsHtml}
          </td>
        </tr>

        <tr>
          <td style="background-color:#ffffff;padding:0 40px 8px">
            ${emailLinksFooterEnglishHtml()}
          </td>
        </tr>

        <tr>
          <td style="background-color:#ffffff;padding:0 40px 28px">
            <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 24px"/>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top;padding-right:12px">
                  <div style="width:36px;height:36px;background:#8C1A1A;border-radius:50%;text-align:center;line-height:36px;font-size:14px;color:white;font-weight:700">L</div>
                </td>
                <td style="vertical-align:top">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1a1a1a">The Level Up in Germany Team</p>
                  <p style="margin:0;font-size:12px;color:#999;line-height:1.5">African community in Germany</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td class="email-footer" style="background-color:#f9f7f7;padding:24px 40px;border-top:1px solid #eeeeee;border-radius:0 0 16px 16px">
            <p style="margin:0 0 8px;font-size:11px;color:#bbb;line-height:1.6">Level Up in Germany · Germany · <a href="${siteBaseUrl}" style="color:#bbb;text-decoration:underline">${siteBaseUrl.replace(/^https?:\/\//, '')}</a></p>
            <p style="margin:0 0 4px;font-size:11px;color:#999;line-height:1.6">
              You're receiving this email because you subscribed to our newsletter.
            </p>
            <p style="margin:0;font-size:11px;color:#ccc;line-height:1.6">
              <a href="${esc(unsubscribeUrl)}" style="color:#8C1A1A;text-decoration:underline;font-weight:600">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildMultilingualCampaignText(
  sections: ReadonlyArray<MultilingualSection>,
  unsubscribeUrl: string,
): string {
  const lines: string[] = [];
  for (const s of sections) {
    lines.push(`══ ${LOCALE_FLAG[s.locale]} ${LOCALE_NAME[s.locale].toUpperCase()} ══`, '');
    if (s.content.titleText) {
      lines.push(s.content.titleText, '─'.repeat(Math.min(s.content.titleText.length, 60)), '');
    }
    const bodyText = looksLikeHtml(s.content.bodyContent)
      ? htmlToPlainText(s.content.bodyContent)
      : s.content.bodyContent;
    lines.push(bodyText, '');
    if (s.content.ctaLabel && s.content.ctaUrl) {
      lines.push(`→ ${s.content.ctaLabel}: ${s.content.ctaUrl}`, '');
    }
    if (s.content.footerNote) {
      lines.push(s.content.footerNote, '');
    }
    lines.push('');
  }
  lines.push(emailLinksFooterEnglishText());
  lines.push('--', 'The Level Up in Germany Team', 'Germany', '');
  lines.push(`Unsubscribe: ${unsubscribeUrl}`);
  return lines.join('\n');
}

export interface SendCampaignParams {
  toEmail: string;
  unsubscribeToken: string;
  siteBaseUrl: string;
  content: CampaignContent;
  /**
   * Optional first name of the recipient. When provided, placeholders such as
   * `{{firstName}}` and `{{greeting}}` in subject / title / preview / body are
   * replaced with personalized values. When null/undefined/empty, placeholders
   * gracefully fall back to a neutral greeting.
   */
  recipientFirstName?: string | null;
  /**
   * Optional list of files to attach to the email. Each entry must contain a
   * `filename` and a base64-encoded `content` (no data URL prefix). Forwarded
   * as-is to the Resend API.
   */
  attachments?: ReadonlyArray<{ filename: string; content: string }>;
}

/**
 * Personalize campaign text using placeholders.
 *
 * Supported tokens:
 *   - `{{firstName}}`           → first name, or empty if unknown
 *   - `{{firstName|fallback}}`  → first name, or the literal fallback if unknown
 *   - `{{greeting}}`            → "Bonjour Marie," / "Hallo Marie," / "Hi Marie,"
 *                                 or "Bonjour," / "Hallo," / "Hi," when unknown.
 *                                 Language is inferred from existing words in the
 *                                 source text (defaults to FR).
 *
 * Also cleans up the artefacts of empty replacements (double spaces, "Bonjour ,",
 * leading whitespace lines, etc.).
 */
export function personalizeCampaignText(text: string, firstName: string | null | undefined): string {
  if (!text) return text;
  const name = (firstName ?? '').trim();

  // Detect language for {{greeting}}
  const lower = text.toLowerCase();
  const lang: 'fr' | 'de' | 'en' =
    /\b(hallo|liebe|sehr geehrte|guten tag|moin)\b/.test(lower) ? 'de' :
    /\b(hi|hello|hey|dear|good morning|good afternoon)\b/.test(lower) ? 'en' :
    'fr';
  const greetingWord = lang === 'de' ? 'Hallo' : lang === 'en' ? 'Hi' : 'Bonjour';
  const greeting = name ? `${greetingWord} ${name},` : `${greetingWord},`;

  let out = text
    .replace(/\{\{\s*greeting\s*\}\}/gi, greeting)
    .replace(/\{\{\s*firstName\s*\|\s*([^}]*?)\s*\}\}/gi, (_m, fb) => name || fb)
    .replace(/\{\{\s*firstName\s*\}\}/gi, name);

  if (!name) {
    // Clean residue when first name was empty:
    //   "Bonjour ," → "Bonjour,"   "Bonjour  ," → "Bonjour,"
    out = out.replace(/([A-Za-zÀ-ÿ])\s+,/g, '$1,');
    //   "  ," at start of line → ","
    out = out.replace(/[ \t]+,/g, ',');
    // Collapse runs of spaces/tabs (preserve newlines)
    out = out.replace(/[ \t]{2,}/g, ' ');
    // Trim leading spaces inside paragraphs
    out = out.split('\n').map((l) => l.replace(/^[ \t]+/, (s) => s)).join('\n');
  }

  return out;
}

const personalizeContent = (content: CampaignContent, firstName: string | null | undefined): CampaignContent => ({
  ...content,
  subject: personalizeCampaignText(content.subject, firstName),
  previewText: content.previewText ? personalizeCampaignText(content.previewText, firstName) : content.previewText,
  titleText: content.titleText ? personalizeCampaignText(content.titleText, firstName) : content.titleText,
  bodyContent: personalizeCampaignText(content.bodyContent, firstName),
  ctaLabel: content.ctaLabel ? personalizeCampaignText(content.ctaLabel, firstName) : content.ctaLabel,
  footerNote: content.footerNote ? personalizeCampaignText(content.footerNote, firstName) : content.footerNote,
});

/**
 * Build the `attachments` array for the Resend API call. Always prepends the
 * inline logo (referenced via `cid:lug-logo` in the HTML) when no custom
 * `headerImageUrl` was provided, so the brand logo renders even in clients
 * that block remote images by default (Gmail, Outlook, …).
 */
async function buildResendAttachments(
  userAttachments: ReadonlyArray<{ filename: string; content: string }> | undefined,
  embedLogo: boolean,
  siteBaseUrl?: string,
): Promise<Array<Record<string, string>>> {
  const out: Array<Record<string, string>> = [];
  if (embedLogo) {
    const logo = await getInlineLogoAttachment(siteBaseUrl);
    if (logo) {
      out.push({
        filename: logo.filename,
        content: logo.content,
        content_id: logo.content_id,
        content_type: logo.content_type,
      });
    }
  }
  if (userAttachments) {
    for (const a of userAttachments) {
      out.push({ filename: a.filename, content: a.content });
    }
  }
  return out;
}

export async function sendCampaignEmail(params: SendCampaignParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    'Level Up in Germany <info@levelupingermany.com>';

  const personalized = personalizeContent(params.content, params.recipientFirstName);
  const unsubscribeUrl = `${params.siteBaseUrl}/api/unsubscribe?token=${encodeURIComponent(params.unsubscribeToken)}`;
  const html = buildCampaignHtml(personalized, unsubscribeUrl, params.siteBaseUrl);
  const text = buildCampaignText(personalized, unsubscribeUrl);

  if (!apiKey) {
    console.warn('[newsletter] RESEND_API_KEY manquant — email non envoyé à', params.toEmail);
    throw new Error('email_not_configured');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.toEmail],
      subject: personalized.subject,
      html,
      text,
      attachments: await buildResendAttachments(params.attachments, !params.content.headerImageUrl, params.siteBaseUrl),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[newsletter] Resend error:', res.status, errText);
    throw new Error(`resend_failed: ${res.status}`);
  }
}

// ── Multilingual send ──────────────────────────────────────────────────────

export interface SendMultilingualCampaignParams {
  toEmail: string;
  unsubscribeToken: string;
  siteBaseUrl: string;
  /**
   * Ordered list of locale sections (the first one drives the subject line and
   * is shown first in the email body).
   */
  sections: ReadonlyArray<MultilingualSection>;
  recipientFirstName?: string | null;
  attachments?: ReadonlyArray<{ filename: string; content: string }>;
}

/**
 * Build a single email containing every available locale section, then send it
 * through Resend. Personalization placeholders (`{{firstName}}`, `{{greeting}}`)
 * are applied independently to each section so the right language greeting is
 * rendered.
 *
 * The subject line is taken from the first (primary) section, after
 * personalization.
 */
export async function sendMultilingualCampaignEmail(
  params: SendMultilingualCampaignParams,
): Promise<void> {
  if (params.sections.length === 0) {
    throw new Error('sendMultilingualCampaignEmail: at least one section required');
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    'Level Up in Germany <info@levelupingermany.com>';

  const personalizedSections: MultilingualSection[] = params.sections.map((s) => ({
    locale: s.locale,
    content: personalizeContent(s.content, params.recipientFirstName),
  }));

  const subject = personalizedSections[0].content.subject;
  const unsubscribeUrl = `${params.siteBaseUrl}/api/unsubscribe?token=${encodeURIComponent(params.unsubscribeToken)}`;
  const html = buildMultilingualCampaignHtml(personalizedSections, unsubscribeUrl, params.siteBaseUrl, subject);
  const text = buildMultilingualCampaignText(personalizedSections, unsubscribeUrl);

  if (!apiKey) {
    console.warn('[newsletter] RESEND_API_KEY manquant — email non envoyé à', params.toEmail);
    throw new Error('email_not_configured');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.toEmail],
      subject,
      html,
      text,
      attachments: await buildResendAttachments(params.attachments, !params.sections[0].content.headerImageUrl, params.siteBaseUrl),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[newsletter] Resend error:', res.status, errText);
    throw new Error(`resend_failed: ${res.status}`);
  }
}
