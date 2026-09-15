import type { Locale } from '@/i18n/config';
import { BOT_KNOWLEDGE, type BotKnowledgeEntry } from '@/content/botKnowledge';

export interface BotMatch {
  entry: BotKnowledgeEntry;
  score: number;
}

/** Lowercase, strip accents/punctuation for locale-agnostic keyword matching. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((word) => word.length > 2);
}

/**
 * Finds the knowledge-base entries best matching a free-text message,
 * scored by keyword-phrase hits (weighted) plus single-word overlap with
 * the entry's canonical question.
 */
export function findBestMatches(message: string, locale: Locale, limit = 3): BotMatch[] {
  const entries = BOT_KNOWLEDGE[locale] ?? BOT_KNOWLEDGE.en;
  const normalizedMessage = normalize(message);
  const queryTokens = new Set(tokenize(message));
  if (!normalizedMessage) return [];

  const scored: BotMatch[] = entries.map((entry) => {
    let score = 0;
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalize(keyword);
      if (normalizedKeyword && normalizedMessage.includes(normalizedKeyword)) {
        score += normalizedKeyword.split(' ').length * 2;
      }
    }
    for (const token of tokenize(entry.question)) {
      if (queryTokens.has(token)) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const CONTACT_FALLBACK: Record<Locale, string> = {
  fr: "Je n'ai pas de réponse précise à ce sujet. Pour obtenir de l'aide, contactez l'équipe à info@levelupingermany.com ou via la page \"Contact\" du site.",
  en: "I don't have a precise answer for that. For help, please contact the team at info@levelupingermany.com or via the \"Contact\" page of the site.",
  de: "Dazu habe ich keine genaue Antwort. Wenden Sie sich für Hilfe an info@levelupingermany.com oder über die Seite \"Contact\" der Website.",
};

export function getContactFallback(locale: Locale): string {
  return CONTACT_FALLBACK[locale] ?? CONTACT_FALLBACK.en;
}
