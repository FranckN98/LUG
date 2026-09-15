/**
 * Newsletter subscriber tags — shared vocabulary + (de)serialization helpers.
 *
 * `NewsletterSubscriber.tags` is stored as a single comma-separated string
 * (existing column, no migration needed — see `src/lib/memberNewsletter.ts`
 * for the same convention used elsewhere). These helpers make it safe to
 * treat that string as a proper multi-value tag list from the admin UI.
 *
 * "Purchased" is a manually-applied tag, not an automated purchase detector:
 * the app has no reliable order↔contact link (checkout is an external
 * widget/redirect, see TicketingConfig.checkoutUrl), so we never invent that
 * data — an admin ticks the tag by hand when they know a contact bought.
 */

export const NEWSLETTER_TAG_OPTIONS = [
  'Career',
  'Business',
  'Healthcare',
  'Student',
  'Professional',
  'Partner',
  'Speaker',
  'Purchased',
] as const;

export type NewsletterTag = typeof NEWSLETTER_TAG_OPTIONS[number];

export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Normalize + dedupe a list of tag strings, keeping only known + free-form (non-empty) values. */
export function normalizeTagsInput(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const t = raw.trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
  }
  return out;
}

export function serializeTags(tags: string[]): string | null {
  const normalized = normalizeTagsInput(tags);
  return normalized.length > 0 ? normalized.join(',') : null;
}
