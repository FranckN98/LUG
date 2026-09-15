/**
 * Mandatory "Organiser son trajet" block — Deutsche Bahn + carpool (WhatsApp).
 *
 * Per spec: must appear in every Level Up 2026 campaign email, positioned
 * after the main content/last CTA and before the footer. The two URLs below
 * are fixed (official Level Up 2026 campaign brief) — do not change them.
 * Cards are stacked (not side-by-side) intentionally: this is the most
 * robust layout across Gmail/Outlook/Apple Mail without relying on fragile
 * two-column email CSS hacks, and mobile rendering is the priority.
 */

export const TRAVEL_BLOCK_DB_URL = 'https://www.eventanreise-bahn.de/de/events/58072';
export const TRAVEL_BLOCK_CARPOOL_URL =
  'https://chat.whatsapp.com/GzrHzPYuxZWE6b0xBcnHMH?s=cl&p=i&mlu=0&ilr=4';

type TravelLocale = 'fr' | 'en' | 'de';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const COPY: Record<
  TravelLocale,
  {
    heading: string;
    intro: string;
    trainTitle: string;
    trainText: string;
    trainCta: string;
    carpoolTitle: string;
    carpoolText: string;
    carpoolCta: string;
  }
> = {
  fr: {
    heading: '🚆🚗 Vous venez à Frankfurt ?',
    intro: 'Organisez dès maintenant votre trajet pour Level Up.',
    trainTitle: '🚆 Venir avec Deutsche Bahn',
    trainText:
      "Consultez l'offre événementielle Deutsche Bahn dédiée à Level Up et organisez votre trajet vers Frankfurt Airport.",
    trainCta: 'Organiser mon trajet en train',
    carpoolTitle: '🚗 Trouver ou proposer un covoiturage',
    carpoolText:
      "Vous venez en voiture ou cherchez une place ? Rejoignez le groupe officiel de covoiturage Level Up et organisez directement votre trajet avec d'autres participants.",
    carpoolCta: 'Rejoindre le groupe covoiturage',
  },
  en: {
    heading: '🚆🚗 Coming to Frankfurt?',
    intro: 'Organize your journey to Level Up right now.',
    trainTitle: '🚆 Travel with Deutsche Bahn',
    trainText:
      'Check the Deutsche Bahn event offer dedicated to Level Up and plan your trip to Frankfurt Airport.',
    trainCta: 'Plan my train journey',
    carpoolTitle: '🚗 Find or offer a carpool',
    carpoolText:
      'Coming by car, or looking for a seat? Join the official Level Up carpool group and organize your trip directly with other attendees.',
    carpoolCta: 'Join the carpool group',
  },
  de: {
    heading: '🚆🚗 Kommen Sie nach Frankfurt?',
    intro: 'Organisieren Sie jetzt Ihre Anreise zu Level Up.',
    trainTitle: '🚆 Anreise mit der Deutschen Bahn',
    trainText:
      'Nutzen Sie das Deutsche-Bahn-Eventangebot für Level Up und organisieren Sie Ihre Anreise zum Frankfurt Airport.',
    trainCta: 'Meine Zugreise planen',
    carpoolTitle: '🚗 Fahrgemeinschaft finden oder anbieten',
    carpoolText:
      'Sie kommen mit dem Auto oder suchen einen Platz? Treten Sie der offiziellen Level Up Fahrgemeinschaftsgruppe bei und organisieren Sie Ihre Fahrt direkt mit anderen Teilnehmenden.',
    carpoolCta: 'Fahrgemeinschaftsgruppe beitreten',
  },
};

function resolveLocale(locale?: string): TravelLocale {
  return locale === 'en' || locale === 'de' ? locale : 'fr';
}

/** HTML card for one travel option (train or carpool). */
function optionCard(title: string, text: string, ctaLabel: string, ctaUrl: string, accent: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 14px;background:#fafafa;border:1px solid #ececec;border-radius:12px">
      <tr>
        <td style="padding:20px 22px">
          <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#1a1a1a">${esc(title)}</p>
          <p style="margin:0 0 16px;font-size:13.5px;line-height:1.65;color:#555">${esc(text)}</p>
          <a href="${esc(ctaUrl)}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;background:${accent};color:#ffffff;font-weight:700;font-size:13.5px;padding:12px 22px;border-radius:8px;text-decoration:none;letter-spacing:0.02em">
            ${esc(ctaLabel)}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Full HTML block, ready to insert after the last CTA and before the footer. */
export function buildTravelBlockHtml(locale?: string): string {
  const c = COPY[resolveLocale(locale)];
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 32px">
      <tr>
        <td style="padding-bottom:4px">
          <h3 style="margin:0 0 6px;font-size:18px;font-weight:800;color:#1a1a1a">${esc(c.heading)}</h3>
          <p style="margin:0 0 18px;font-size:14px;color:#555">${esc(c.intro)}</p>
        </td>
      </tr>
      <tr>
        <td>
          ${optionCard(c.trainTitle, c.trainText, c.trainCta, TRAVEL_BLOCK_DB_URL, '#EC0016')}
          ${optionCard(c.carpoolTitle, c.carpoolText, c.carpoolCta, TRAVEL_BLOCK_CARPOOL_URL, '#25D366')}
        </td>
      </tr>
    </table>`;
}

/** Plain-text equivalent, for the text/plain part of the email. */
export function buildTravelBlockText(locale?: string): string {
  const c = COPY[resolveLocale(locale)];
  return [
    '',
    c.heading,
    c.intro,
    '',
    c.trainTitle,
    c.trainText,
    `→ ${c.trainCta}: ${TRAVEL_BLOCK_DB_URL}`,
    '',
    c.carpoolTitle,
    c.carpoolText,
    `→ ${c.carpoolCta}: ${TRAVEL_BLOCK_CARPOOL_URL}`,
  ].join('\n');
}
