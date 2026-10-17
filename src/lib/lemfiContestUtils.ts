/** Fonctions pures du jeu concours LemFi (sans accès base de données). */

export const LEMFI_STATUSES = ['pending', 'validated', 'rejected'] as const;
export type LemfiStatus = (typeof LEMFI_STATUSES)[number];

export function isLemfiStatus(v: unknown): v is LemfiStatus {
  return typeof v === 'string' && (LEMFI_STATUSES as readonly string[]).includes(v);
}

export const LEMFI_STATUS_LABEL_FR: Record<LemfiStatus, string> = {
  pending: 'En attente',
  validated: 'Validé',
  rejected: 'Refusé',
};

export function formatLemfiNumber(n: number): string {
  return `LU${n}`;
}

/** « LU215 », « lu 215 » ou « 215 » → 215 ; autre chose → null. */
export function parseNumberQuery(q: string): number | null {
  const m = q.trim().match(/^(?:lu\s*)?(\d{3})$/i);
  return m ? Number.parseInt(m[1]!, 10) : null;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

// Construit via RegExp : le tsconfig du projet vise une cible < ES2015, qui refuse le drapeau /u en littéral.
const NAME_RE = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M}\\s'’.-]*$", 'u');

/** Retourne le nom nettoyé, ou null s'il est invalide. */
export function cleanPersonName(raw: string): string | null {
  const v = raw.replace(/\s+/g, ' ').trim();
  if (v.length < 1 || v.length > 60) return null;
  return NAME_RE.test(v) ? v : null;
}

export function isValidSubmissionKey(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(v);
}

export type ProofMime = 'image/jpeg' | 'image/png' | 'image/webp';

/** Détermine le vrai type d'image d'après sa signature (le type déclaré par le navigateur n'est pas fiable). */
export function detectProofMime(b: Uint8Array): ProofMime | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

export type LemfiWinnerStatus = 'won' | 'forfeited';

/** Nom du lot nettoyé, ou null s'il est vide, trop long ou contient des caractères de contrôle. */
export function cleanPrizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.replace(/\s+/g, ' ').trim();
  if (v.length < 1 || v.length > 60) return null;
  return /[\u0000-\u001f\u007f]/.test(v) ? null : v;
}

/**
 * Tirage uniforme sans remise (Fisher-Yates partiel).
 * `randomInt(max)` doit renvoyer un entier uniforme dans [0, max[.
 */
export function pickRandom<T>(items: readonly T[], count: number, randomInt: (max: number) => number): T[] {
  const pool = items.slice();
  const n = Math.min(Math.max(Math.floor(count), 0), pool.length);
  for (let i = 0; i < n; i++) {
    const j = i + randomInt(pool.length - i);
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  return pool.slice(0, n);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
