/**
 * Shared, trilingual (FR / DE / EN) email footer with links to:
 *  - main website
 *  - social networks (LinkedIn, Instagram, TikTok)
 *  - ambassadors WhatsApp community
 *
 * Used by transactional emails (newsletter PDF, member status, etc.).
 *
 * Note: campaign emails (sendCampaignEmail.ts) have their own footer and are
 * not affected by this module.
 */

import { SOCIAL_LINKS } from '@/data/social';

/**
 * Canonical production URL used for ALL email content (logos, links, footer).
 * Hardcoded to .com because that is the active public domain — using
 * NEXT_PUBLIC_SITE_URL is unreliable for email clients (env may be missing
 * or contain typos like .de). Override only via EMAIL_SITE_URL if needed.
 */
const SITE_URL =
  (process.env.EMAIL_SITE_URL?.trim() || 'https://www.levelupingermany.com').replace(/\/$/, '');

const AMBASSADOR_WHATSAPP_URL = 'https://chat.whatsapp.com/Ip3P51uCMGu0TblrkVBSst';

/** Direct WhatsApp/phone contact (kept in sync with /contact and /imprint pages). */
const CONTACT_PHONE_DISPLAY = '+49 152 04256840';
const CONTACT_PHONE_E164 = '+4915204256840'; // tel: scheme
const CONTACT_PHONE_WA = '4915204256840'; // wa.me requires no '+'
const CONTACT_WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE_WA}`;
const CONTACT_TEL_URL = `tel:${CONTACT_PHONE_E164}`;

/** Public contact email (kept in sync with FORMS_TO_EMAIL / NEWSLETTER_FROM_EMAIL). */
const CONTACT_EMAIL = 'info@levelupingermany.com';
const CONTACT_EMAIL_URL = `mailto:${CONTACT_EMAIL}`;

/** Public absolute URL of the Level Up in Germany logo (served from /public). */
export const EMAIL_LOGO_URL = `${SITE_URL}/logo.png`;

/**
 * Centered logo block to render at the top of transactional emails.
 * Uses absolute URLs so all email clients (Gmail, Outlook, Apple Mail) load it.
 */
export function emailHeaderLogoHtml(opts: { background?: string; width?: number } = {}): string {
  const bg = opts.background ?? '#ffffff';
  const w = opts.width ?? 140;
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${bg}">
  <tr>
    <td align="center" style="padding:24px 24px 8px">
      <a href="${SITE_URL}" style="text-decoration:none;border:0;outline:none">
        <img src="${EMAIL_LOGO_URL}" alt="Level Up in Germany" width="${w}" style="display:block;border:0;outline:none;max-width:${w}px;height:auto" />
      </a>
    </td>
  </tr>
</table>`;
}

const TEXT = {
  fr: {
    stayConnected: 'Restez connecté à Level Up in Germany',
    visitSite: 'Notre site',
    followUs: 'Suivez-nous',
    joinAmbassadors: 'Rejoignez notre communauté WhatsApp des Ambassadeurs',
    contactUs: 'Nous contacter',
    writeUs: 'Écrivez-nous',
    callOrWhatsApp: 'Appel ou WhatsApp',
  },
  de: {
    stayConnected: 'Bleiben Sie mit Level Up in Germany in Verbindung',
    visitSite: 'Unsere Website',
    followUs: 'Folgen Sie uns',
    joinAmbassadors: 'Treten Sie unserer Botschafter-WhatsApp-Community bei',
    contactUs: 'Kontakt',
    writeUs: 'Schreiben Sie uns',
    callOrWhatsApp: 'Anruf oder WhatsApp',
  },
  en: {
    stayConnected: 'Stay connected with Level Up in Germany',
    visitSite: 'Our website',
    followUs: 'Follow us',
    joinAmbassadors: 'Join our Ambassadors WhatsApp community',
    contactUs: 'Get in touch',
    writeUs: 'Write to us',
    callOrWhatsApp: 'Call or WhatsApp',
  },
} as const;

/** HTML block to append inside the email body (before any <hr/>/footer). */
export function emailLinksFooterHtml(): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:32px 0 0;border-top:1px solid #eee;padding-top:20px">
  <tr><td style="font-family:system-ui,'Segoe UI',Arial,sans-serif;color:#1a0a0a;font-size:14px;line-height:1.6">
    <p style="margin:0 0 12px;font-weight:600;color:#8C1A1A">
      ${TEXT.fr.stayConnected} · ${TEXT.de.stayConnected} · ${TEXT.en.stayConnected}
    </p>

    <p style="margin:0 0 8px">
      🌐 <a href="${SITE_URL}" style="color:#8C1A1A;text-decoration:none"><strong>${SITE_URL.replace(/^https?:\/\//, '')}</strong></a>
      &nbsp;—&nbsp;
      <span style="color:#666;font-size:13px">${TEXT.fr.visitSite} / ${TEXT.de.visitSite} / ${TEXT.en.visitSite}</span>
    </p>

    <p style="margin:0 0 8px">
      ✉️ <a href="${CONTACT_EMAIL_URL}" style="color:#8C1A1A;text-decoration:none"><strong>${CONTACT_EMAIL}</strong></a>
      &nbsp;—&nbsp;
      <span style="color:#666;font-size:13px">${TEXT.fr.writeUs} / ${TEXT.de.writeUs} / ${TEXT.en.writeUs}</span>
    </p>

    <p style="margin:0 0 8px">
      📞 <a href="${CONTACT_TEL_URL}" style="color:#8C1A1A;text-decoration:none"><strong>${CONTACT_PHONE_DISPLAY}</strong></a>
      &nbsp;·&nbsp;
      <a href="${CONTACT_WHATSAPP_URL}" style="color:#25D366;text-decoration:none;font-weight:600">WhatsApp</a>
      &nbsp;—&nbsp;
      <span style="color:#666;font-size:13px">${TEXT.fr.callOrWhatsApp} / ${TEXT.de.callOrWhatsApp} / ${TEXT.en.callOrWhatsApp}</span>
    </p>

    <p style="margin:0 0 8px">
      📱 <a href="${SOCIAL_LINKS.linkedin}" style="color:#8C1A1A;text-decoration:none">LinkedIn</a>
      &nbsp;·&nbsp;
      <a href="${SOCIAL_LINKS.instagram}" style="color:#8C1A1A;text-decoration:none">Instagram</a>
      &nbsp;·&nbsp;
      <a href="${SOCIAL_LINKS.tiktok}" style="color:#8C1A1A;text-decoration:none">TikTok</a>
      &nbsp;—&nbsp;
      <span style="color:#666;font-size:13px">${TEXT.fr.followUs} / ${TEXT.de.followUs} / ${TEXT.en.followUs}</span>
    </p>

    <p style="margin:0 0 8px">
      💬 <a href="${AMBASSADOR_WHATSAPP_URL}" style="color:#25D366;text-decoration:none;font-weight:600">${TEXT.fr.joinAmbassadors}</a>
    </p>
    <p style="margin:0 0 4px;font-size:13px;color:#666">
      ${TEXT.de.joinAmbassadors} · <a href="${AMBASSADOR_WHATSAPP_URL}" style="color:#25D366;text-decoration:none">${AMBASSADOR_WHATSAPP_URL.replace(/^https?:\/\//, '')}</a>
    </p>
    <p style="margin:0 0 0;font-size:13px;color:#666">
      ${TEXT.en.joinAmbassadors}
    </p>
  </td></tr>
</table>`;
}

/** Plain-text equivalent for the same footer, appended to text-only bodies. */
export function emailLinksFooterText(): string {
  return [
    '',
    '— — —',
    `${TEXT.fr.stayConnected} / ${TEXT.de.stayConnected} / ${TEXT.en.stayConnected}`,
    '',
    `🌐 ${SITE_URL}`,
    `   ${TEXT.fr.visitSite} / ${TEXT.de.visitSite} / ${TEXT.en.visitSite}`,
    '',
    `✉️  ${CONTACT_EMAIL}`,
    `   ${TEXT.fr.writeUs} / ${TEXT.de.writeUs} / ${TEXT.en.writeUs}`,
    '',
    `📞 ${CONTACT_PHONE_DISPLAY}  ·  WhatsApp: ${CONTACT_WHATSAPP_URL}`,
    `   ${TEXT.fr.callOrWhatsApp} / ${TEXT.de.callOrWhatsApp} / ${TEXT.en.callOrWhatsApp}`,
    '',
    `📱 LinkedIn:  ${SOCIAL_LINKS.linkedin}`,
    `   Instagram: ${SOCIAL_LINKS.instagram}`,
    `   TikTok:    ${SOCIAL_LINKS.tiktok}`,
    `   ${TEXT.fr.followUs} / ${TEXT.de.followUs} / ${TEXT.en.followUs}`,
    '',
    `💬 ${TEXT.fr.joinAmbassadors}:`,
    `   ${TEXT.de.joinAmbassadors}`,
    `   ${TEXT.en.joinAmbassadors}`,
    `   ${AMBASSADOR_WHATSAPP_URL}`,
    '',
  ].join('\n');
}
