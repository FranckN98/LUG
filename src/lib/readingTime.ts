import type { Locale } from '@/i18n/config';

const WORDS_PER_MINUTE = 200;

const LABELS: Record<Locale, (m: number) => string> = {
  fr: (m) => `${m} min de lecture`,
  en: (m) => `${m} min read`,
  de: (m) => `${m} Min. Lesezeit`,
};

export function countWords(body: string): number {
  if (!body) return 0;
  const stripped = body
    // Markdown images / links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Bold/italic markers
    .replace(/[*_`#>~-]+/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) return 0;
  return stripped.split(' ').length;
}

export function getReadingMinutes(body: string): number {
  return Math.max(1, Math.ceil(countWords(body) / WORDS_PER_MINUTE));
}

export function formatReadingTime(body: string, locale: Locale): string {
  return LABELS[locale](getReadingMinutes(body));
}
