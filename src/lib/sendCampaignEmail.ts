function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

import { emailLinksFooterHtml, emailLinksFooterText } from '@/lib/emailFooter';

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

  const paragraphs = bodyContent
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

  // Header image: displayed prominently above the name bar if provided
  const headerImageBlock = normalizedHeaderImageUrl
    ? `<img src="${esc(normalizedHeaderImageUrl)}" alt="Logo" width="160" style="display:block;margin:0 auto 16px;max-width:160px;height:auto;border:0" />`
    : `<img src="${siteBaseUrl}/logo.png" alt="Level Up in Germany" width="140" style="display:block;margin:0 auto 12px;max-width:140px;height:auto;border:0" />`;


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
            ${emailLinksFooterHtml()}
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
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1a1a1a">L'équipe Level Up in Germany</p>
                  <p style="margin:0;font-size:12px;color:#999;line-height:1.5">Communauté africaine en Allemagne</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ FOOTER ══ -->
        <tr>
          <td class="email-footer" style="background-color:#f9f7f7;padding:24px 40px;border-top:1px solid #eeeeee;border-radius:0 0 16px 16px">
            ${footerNoteBlock}
            <p style="margin:0 0 8px;font-size:11px;color:#bbb;line-height:1.6">Level Up in Germany · Deutschland · <a href="${siteBaseUrl}" style="color:#bbb;text-decoration:underline">${siteBaseUrl.replace(/^https?:\/\//, '')}</a></p>
            <p style="margin:0;font-size:11px;color:#ccc;line-height:1.6">
              Vous recevez cet e-mail car vous êtes inscrit(e) à notre newsletter.&nbsp;
              <a href="${esc(unsubscribeUrl)}" style="color:#8C1A1A;text-decoration:underline;font-weight:600">Se désabonner</a>
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
  lines.push(content.bodyContent, '');
  if (content.ctaLabel && content.ctaUrl) {
    lines.push(`→ ${content.ctaLabel}: ${content.ctaUrl}`, '');
  }
  lines.push(emailLinksFooterText());
  lines.push('--', "L'équipe Level Up in Germany", 'Deutschland', '');
  lines.push(`Se désabonner : ${unsubscribeUrl}`);
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
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[newsletter] Resend error:', res.status, errText);
    throw new Error(`resend_failed: ${res.status}`);
  }
}
