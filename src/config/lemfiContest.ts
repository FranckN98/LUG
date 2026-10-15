/**
 * Jeu concours Level Up in Germany x LemFi — réglages.
 *
 * Variables d'environnement (toutes optionnelles, lues à l'exécution) :
 *   LEMFI_PARTNER_URL               remplace le lien partenaire par défaut du bouton « Télécharger LemFi » (https://…)
 *   LEMFI_CASHBACK_CONFIRMED=true   affiche « Recevez 25 % de cashback » (uniquement après accord de LemFi)
 *   LEMFI_EXISTING_USERS_CONFIRMED=true   affiche la mention « Vous utilisez déjà LemFi ? … »
 *   LEMFI_RETENTION_DAYS            durée de conservation des participations (défaut 90 jours)
 *   LEMFI_FROM_EMAIL                expéditeur des e-mails (défaut : NEWSLETTER_FROM_EMAIL)
 */

export const LEMFI_FIRST_NUMBER = 200;
export const LEMFI_LAST_NUMBER = 350;
export const LEMFI_CAPACITY = LEMFI_LAST_NUMBER - LEMFI_FIRST_NUMBER + 1;
export const LEMFI_COUNTER_ID = 'lemfi';

/** Limite de taille annoncée aux participants. */
export const LEMFI_MAX_PROOF_BYTES = 5 * 1024 * 1024;
/** Les fonctions Vercel refusent les corps de requête > 4,5 Mo : le client réduit l'image au-delà. */
export const LEMFI_CLIENT_TARGET_BYTES = 4_000_000;

export const LEMFI_DEFAULT_RETENTION_DAYS = 90;

/** Lien de parrainage officiel LemFi (bouton « Télécharger LemFi »). */
export const LEMFI_DEFAULT_PARTNER_URL = 'https://referral.lemfi.com/hKwsPoVa66b';

function flag(name: string): boolean {
  return process.env[name]?.trim().toLowerCase() === 'true';
}

function httpUrlOrNull(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const u = new URL(raw.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export type LemfiPublicSettings = {
  partnerUrl: string | null;
  cashbackConfirmed: boolean;
  existingUsersConfirmed: boolean;
};

export function getLemfiPublicSettings(): LemfiPublicSettings {
  return {
    partnerUrl: httpUrlOrNull(process.env.LEMFI_PARTNER_URL) ?? LEMFI_DEFAULT_PARTNER_URL,
    cashbackConfirmed: flag('LEMFI_CASHBACK_CONFIRMED'),
    existingUsersConfirmed: flag('LEMFI_EXISTING_USERS_CONFIRMED'),
  };
}

export function getLemfiRetentionDays(): number {
  const n = Number.parseInt(process.env.LEMFI_RETENTION_DAYS ?? '', 10);
  if (!Number.isFinite(n) || n < 1) return LEMFI_DEFAULT_RETENTION_DAYS;
  return Math.min(n, 3650);
}
