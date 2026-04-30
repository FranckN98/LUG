function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

import { emailLinksFooterHtml, emailLinksFooterText, emailHeaderLogoHtml } from './emailFooter';

const SUBJECT = 'Merci pour votre intérêt – Level Up Germany';

const BODY_TEXT = (pdfUrl: string) =>
  `Bonjour,

Merci pour votre intérêt pour notre événement Level Up in Germany.

Nous avons documenté les moments clés, les insights et les échanges dans ce mini-livre que vous pouvez télécharger ici :
${pdfUrl}

Nous espérons que cette lecture vous apportera de la valeur et vous inspirera.

Nous serions ravis de vous compter parmi nous lors de la prochaine édition.

À très bientôt,
L'équipe Level Up${emailLinksFooterText()}`;

const BODY_HTML = (pdfUrl: string) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f6f4f4;font-family:system-ui,Segoe UI,sans-serif;line-height:1.6;color:#1a1a1a">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
${emailHeaderLogoHtml()}
<div style="padding:8px 32px 32px">
<p>Bonjour,</p>
<p>Merci pour votre intérêt pour notre événement Level Up in Germany.</p>
<p>Nous avons documenté les moments clés, les insights et les échanges dans ce mini-livre que vous pouvez télécharger ici :</p>
<p><a href="${esc(pdfUrl)}" style="color:#8C1A1A;font-weight:600">${esc(pdfUrl)}</a></p>
<p>Nous espérons que cette lecture vous apportera de la valeur et vous inspirera.</p>
<p>Nous serions ravis de vous compter parmi nous lors de la prochaine édition.</p>
<p>À très bientôt,<br/>L'équipe Level Up</p>
${emailLinksFooterHtml()}
<hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
<p style="font-size:12px;color:#666">Level Up in Germany · ${new Date().toISOString()}</p>
</div>
</div>
</body></html>`;

/**
 * Sends the PDF link email to the subscriber (Resend).
 * From address must be verified in Resend (domain or sandbox).
 */
export async function sendNewsletterPdfEmail(toEmail: string, pdfAbsoluteUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    process.env.FORMS_FROM_EMAIL?.trim() ||
    'Level Up in Germany <onboarding@resend.dev>';

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn('[subscribe] RESEND_API_KEY manquant — e-mail non envoyé vers', toEmail);
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
      to: [toEmail],
      subject: SUBJECT,
      text: BODY_TEXT(pdfAbsoluteUrl),
      html: BODY_HTML(pdfAbsoluteUrl),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    // eslint-disable-next-line no-console
    console.error('[subscribe] Resend refusé:', res.status, errText, '| from:', from, '| to:', toEmail);
    throw new Error(`resend_failed: ${res.status} ${errText}`);
  }
}
