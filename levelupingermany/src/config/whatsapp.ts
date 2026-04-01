import type { Locale } from '@/i18n/config';

const DEFAULT_PHONE = '4915204256834';

const PREFILL: Record<Locale, string> = {
  de: 'Hallo Level Up in Germany, ich möchte der Community beitreten.',
  en: 'Hello Level Up in Germany, I would like to join the community.',
  fr: 'Bonjour Level Up in Germany, je souhaite rejoindre la communauté.',
};

/**
 * Lien WhatsApp pour rejoindre (groupe ou chat).
 * Définir NEXT_PUBLIC_WHATSAPP_JOIN_URL pour un lien d’invitation de groupe (recommandé).
 * Sinon : wa.me avec numéro officiel.
 */
export function getWhatsAppJoinUrl(locale: Locale): string {
  const custom = process.env.NEXT_PUBLIC_WHATSAPP_JOIN_URL?.trim();
  if (custom) return custom;
  const text = encodeURIComponent(PREFILL[locale] ?? PREFILL.en);
  return `https://wa.me/${DEFAULT_PHONE}?text=${text}`;
}
