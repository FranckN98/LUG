import { createHash } from 'crypto';
import { DEFAULT_FEEDBACK_TAGS, FEEDBACK_LIMITS } from '@/content/feedback';
import { cleanPersonName, isValidEmail, normalizeEmail } from './lemfiContestUtils';

export { DEFAULT_FEEDBACK_TAGS };

// ── Codes à usage unique ────────────────────────────────────────────────────

/** 31 symboles sans I, L, O, 0, 1 (confusions à la saisie). 10 symboles ≈ 50 bits. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 10;

/** `randomInt(max)` doit renvoyer un entier uniforme dans [0, max[ (crypto.randomInt en production). */
export function generateCode(randomInt: (max: number) => number): string {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

export function formatCode(code: string): string {
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

/** « abcde-fghjk » → « ABCDEFGHJK » ; null si le format est invalide. */
export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.toUpperCase().replace(/[\s-]/g, '');
  if (v.length !== CODE_LENGTH) return null;
  for (const ch of v) if (CODE_ALPHABET.indexOf(ch) === -1) return null;
  return v;
}

/** Seul ce hash est conservé en base ; `FEEDBACK_CODE_PEPPER` (facultatif) rend un vol de base inexploitable. */
export function hashCode(code: string, pepper: string = process.env.FEEDBACK_CODE_PEPPER ?? ''): string {
  return createHash('sha256').update(`${pepper}:${code}`).digest('hex');
}

// ── Dates ───────────────────────────────────────────────────────────────────

/** Jour courant à Berlin, à minuit UTC (colonne DATE) : l'heure d'envoi n'est jamais conservée. */
export function berlinDay(now: Date = new Date()): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return new Date(`${ymd}T00:00:00.000Z`);
}

export function isIsoDay(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00.000Z`));
}

// ── Saisie ──────────────────────────────────────────────────────────────────

type Cleaned<T> = { ok: true; value: T } | { ok: false };

/** Texte libre : retours à la ligne normalisés, caractères de contrôle retirés, vide → null. */
export function cleanFreeText(raw: unknown, max: number): Cleaned<string | null> {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false };
  const v = raw
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim();
  if (v.length > max) return { ok: false };
  return { ok: true, value: v || null };
}

function cleanOptionalName(raw: unknown): Cleaned<string | null> {
  if (raw === undefined || raw === null) return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false };
  if (!raw.trim()) return { ok: true, value: null };
  const name = cleanPersonName(raw);
  return name ? { ok: true, value: name } : { ok: false };
}

export function cleanTagName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.replace(/\s+/g, ' ').trim();
  if (v.length < 1 || v.length > 40) return null;
  return /[\u0000-\u001f\u007f]/.test(v) ? null : v;
}

export type FeedbackInput = {
  code: string;
  rating: number;
  highlights: string | null;
  likesAndImprovements: string | null;
  wantedSpeakers: string | null;
  wantedTopics: string | null;
  isSigned: boolean;
  firstName: string | null;
  lastName: string | null;
  news: { email: string; firstName: string | null; lastName: string | null } | null;
};

export type ParsedFeedback =
  | { ok: true; value: FeedbackInput }
  | { ok: false; code: 'code' | 'codeFormat' | 'rating' | 'email' | 'name' | 'tooLong' | 'invalid'; field?: string };

export function parseFeedbackBody(body: unknown): ParsedFeedback {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false, code: 'invalid' };
  const b = body as Record<string, unknown>;

  if (typeof b.code !== 'string' || !b.code.trim()) return { ok: false, code: 'code', field: 'code' };
  const code = normalizeCode(b.code);
  if (!code) return { ok: false, code: 'codeFormat', field: 'code' };

  const rating = b.rating;
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, code: 'rating', field: 'rating' };
  }

  const texts = {
    highlights: cleanFreeText(b.highlights, FEEDBACK_LIMITS.longText),
    likesAndImprovements: cleanFreeText(b.likesAndImprovements, FEEDBACK_LIMITS.longText),
    wantedSpeakers: cleanFreeText(b.wantedSpeakers, FEEDBACK_LIMITS.shortText),
    wantedTopics: cleanFreeText(b.wantedTopics, FEEDBACK_LIMITS.shortText),
  };
  for (const [field, res] of Object.entries(texts)) {
    if (!res.ok) return { ok: false, code: 'tooLong', field };
  }

  let firstName: string | null = null;
  let lastName: string | null = null;
  if (b.sign === true) {
    const f = cleanOptionalName(b.firstName);
    if (!f.ok) return { ok: false, code: 'name', field: 'firstName' };
    const l = cleanOptionalName(b.lastName);
    if (!l.ok) return { ok: false, code: 'name', field: 'lastName' };
    firstName = f.value;
    lastName = l.value;
  }

  let news: FeedbackInput['news'] = null;
  if (b.news === true) {
    const email = typeof b.newsEmail === 'string' ? normalizeEmail(b.newsEmail) : '';
    if (!email || !isValidEmail(email)) return { ok: false, code: 'email', field: 'newsEmail' };
    const f = cleanOptionalName(b.newsFirstName);
    if (!f.ok) return { ok: false, code: 'name', field: 'newsFirstName' };
    const l = cleanOptionalName(b.newsLastName);
    if (!l.ok) return { ok: false, code: 'name', field: 'newsLastName' };
    news = { email, firstName: f.value, lastName: l.value };
  }

  const val = <K extends keyof typeof texts>(k: K) => {
    const r = texts[k];
    return r.ok ? r.value : null;
  };

  return {
    ok: true,
    value: {
      code,
      rating,
      highlights: val('highlights'),
      likesAndImprovements: val('likesAndImprovements'),
      wantedSpeakers: val('wantedSpeakers'),
      wantedTopics: val('wantedTopics'),
      // Signé seulement si un nom a réellement été saisi.
      isSigned: !!(firstName || lastName),
      firstName,
      lastName,
      news,
    },
  };
}

// ── Filtres d'administration ────────────────────────────────────────────────

export type FeedbackFilters = {
  rating?: number;
  from?: string;
  to?: string;
  signed?: 'signed' | 'anonymous';
  q?: string;
  tagId?: string;
};

export function parseFeedbackFilters(sp: URLSearchParams): FeedbackFilters {
  const f: FeedbackFilters = {};
  const rating = Number.parseInt(sp.get('rating') ?? '', 10);
  if (rating >= 1 && rating <= 5) f.rating = rating;
  const from = sp.get('from');
  if (isIsoDay(from)) f.from = from;
  const to = sp.get('to');
  if (isIsoDay(to)) f.to = to;
  const signed = sp.get('signed');
  if (signed === 'signed' || signed === 'anonymous') f.signed = signed;
  const q = sp.get('q')?.trim().slice(0, 100);
  if (q) f.q = q;
  const tagId = sp.get('tag');
  if (tagId && /^[0-9a-f-]{36}$/i.test(tagId)) f.tagId = tagId;
  return f;
}

// ── CSV ─────────────────────────────────────────────────────────────────────

/** Neutralise les formules de tableur (=, +, -, @) puis applique les guillemets CSV. */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Séparateur « ; » et BOM UTF-8 : s'ouvre correctement dans Excel en français. */
export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(';'));
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
