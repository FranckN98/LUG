import { Resend } from 'resend';
import { getSiteUrl } from '@/config/site';
import type { Locale } from '@/i18n/config';
import { getLemfiCopy, resolveLemfiLocale } from '@/content/lemfi-contest';
import { EMAIL_LOGO_URL } from './emailFooter';
import { escapeHtml, formatLemfiNumber } from './lemfiContestUtils';

export type EmailResult = { ok: true; id: string } | { ok: false; error: string };

export function trackingUrl(accessToken: string, locale: Locale): string {
  return `${getSiteUrl()}/${locale}/lemfi-contest/track/${accessToken}`;
}

function fromAddress(): string {
  return (
    process.env.LEMFI_FROM_EMAIL?.trim() ||
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    'Level Up in Germany <info@levelupingermany.com>'
  );
}

/**
 * Envoie l'e-mail de confirmation dans la langue du participant. Ne lève jamais d'exception.
 * `ok: true` UNIQUEMENT si Resend a accepté le message et renvoyé un identifiant.
 */
export async function sendConfirmationEmail(p: {
  to: string;
  firstName: string;
  sequentialNumber: number;
  accessToken: string;
  locale: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: 'not_configured' };

  const locale = resolveLemfiLocale(p.locale);
  const t = getLemfiCopy(locale).email;
  const number = formatLemfiNumber(p.sequentialNumber);
  const link = trackingUrl(p.accessToken, locale);

  const html = `<!DOCTYPE html>
<html lang="${locale}"><body style="margin:0;padding:0;background:#f4f1eb;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden">
<tr><td style="background:#0a3d27;padding:20px 24px;border-bottom:3px solid #F5B800"><img src="${EMAIL_LOGO_URL}" alt="Level Up in Germany" height="44" style="display:block;border:0;height:44px;background:#ffffff;border-radius:8px;padding:4px 10px"></td></tr>
<tr><td style="padding:28px 24px">
<p style="margin:0 0 12px;font-size:16px">${escapeHtml(t.greeting(p.firstName))}</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.5"><strong>${escapeHtml(t.received)}</strong></p>
<p style="margin:0 0 4px;font-size:14px;color:#555">${escapeHtml(t.numberLabel)}</p>
<p style="margin:0 0 16px;font-size:36px;font-weight:bold;color:#0a3d27;letter-spacing:1px">${number}</p>
<p style="margin:0 0 6px;font-size:15px"><strong>${escapeHtml(t.statusLabel)}:</strong> ${escapeHtml(t.statusValue)}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.5">${escapeHtml(t.eligibility)}</p>
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#F5B800;color:#0a2b1b;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:999px;font-size:15px">${escapeHtml(t.button)}</a></p>
<p style="margin:0;font-size:12px;color:#777;line-height:1.5">${escapeHtml(t.personalNote)}<br>${escapeHtml(t.fallback)} ${link}</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [
    t.greeting(p.firstName),
    '',
    t.received,
    `${t.numberLabel}: ${number}`,
    `${t.statusLabel}: ${t.statusValue}`,
    t.eligibility,
    '',
    `${t.button}: ${link}`,
    t.personalNote,
  ].join('\n');

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from: fromAddress(),
      to: p.to,
      subject: t.subject(number),
      html,
      text,
      tags: [{ name: 'category', value: 'lemfi_confirmation' }],
    });
    if (error || !data?.id) return { ok: false, error: error?.message ?? 'no_message_id' };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown_error' };
  }
}
