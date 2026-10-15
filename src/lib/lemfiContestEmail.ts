import { Resend } from 'resend';
import { getSiteUrl } from '@/config/site';
import { EMAIL_LOGO_URL } from './emailFooter';
import { escapeHtml, formatLemfiNumber } from './lemfiContestUtils';

export type EmailResult = { ok: true; id: string } | { ok: false; error: string };

export function trackingUrl(accessToken: string): string {
  return `${getSiteUrl()}/lemfi-contest/track/${accessToken}`;
}

function fromAddress(): string {
  return (
    process.env.LEMFI_FROM_EMAIL?.trim() ||
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    'Level Up in Germany <info@levelupingermany.com>'
  );
}

/**
 * Envoie l'e-mail de confirmation. Ne lève jamais d'exception.
 * `ok: true` UNIQUEMENT si Resend a accepté le message et renvoyé un identifiant.
 */
export async function sendConfirmationEmail(p: {
  to: string;
  firstName: string;
  sequentialNumber: number;
  accessToken: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: 'not_configured' };

  const number = formatLemfiNumber(p.sequentialNumber);
  const link = trackingUrl(p.accessToken);
  const name = escapeHtml(p.firstName);

  const html = `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#f4f1eb;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#8C1A1A;padding:20px 24px"><img src="${EMAIL_LOGO_URL}" alt="Level Up in Germany" height="44" style="display:block;border:0;height:44px"></td></tr>
<tr><td style="padding:28px 24px">
<p style="margin:0 0 12px;font-size:16px">Bonjour ${name},</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.5"><strong>Participation reçue</strong> au jeu concours Level Up in Germany × LemFi.</p>
<p style="margin:0 0 4px;font-size:14px;color:#555">Votre numéro</p>
<p style="margin:0 0 16px;font-size:34px;font-weight:bold;color:#8C1A1A;letter-spacing:1px">${number}</p>
<p style="margin:0 0 6px;font-size:15px"><strong>Statut :</strong> en attente de vérification</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.5">Votre éligibilité au tirage sera confirmée après vérification de votre preuve.</p>
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#E98C0B;color:#1a1a1a;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:999px;font-size:15px">Suivre ma participation</a></p>
<p style="margin:0;font-size:12px;color:#777;line-height:1.5">Ce lien est personnel : ne le partagez pas.<br>Si le bouton ne fonctionne pas, copiez cette adresse : ${link}</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [
    `Bonjour ${p.firstName},`,
    '',
    'Participation reçue au jeu concours Level Up in Germany × LemFi.',
    `Votre numéro : ${number}`,
    'Statut : en attente de vérification.',
    'Votre éligibilité au tirage sera confirmée après vérification de votre preuve.',
    '',
    `Suivre ma participation : ${link}`,
    'Ce lien est personnel : ne le partagez pas.',
  ].join('\n');

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from: fromAddress(),
      to: p.to,
      subject: `Participation reçue – ${number} – Level Up in Germany × LemFi`,
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
