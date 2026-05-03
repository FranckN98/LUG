/**
 * Newsletter campaign i18n helpers.
 *
 * Mirrors the blog approach: a campaign keeps legacy fields as a fallback,
 * and an array of `translations` (FR/EN/DE) holds the per-locale content.
 *
 * `pickCampaignTranslation(campaign, locale)` returns the best available
 * content for the requested locale, falling back gracefully to the closest
 * available translation, then to legacy scalar fields.
 */

export const CAMPAIGN_LOCALES = ['fr', 'en', 'de'] as const;
export type CampaignLocale = typeof CAMPAIGN_LOCALES[number];

export type CampaignTranslationLike = {
  locale: string;
  subject: string;
  previewText: string | null;
  titleText: string | null;
  bodyContent: string;
  ctaLabel: string | null;
  footerNote: string | null;
};

export type CampaignLike = {
  subject: string;
  previewText: string | null;
  titleText: string | null;
  bodyContent: string;
  ctaLabel: string | null;
  footerNote: string | null;
  translations?: CampaignTranslationLike[] | null;
};

const FALLBACK_CHAIN: Record<CampaignLocale, CampaignLocale[]> = {
  fr: ['fr', 'en', 'de'],
  en: ['en', 'fr', 'de'],
  de: ['de', 'en', 'fr'],
};

const isUsable = (t: CampaignTranslationLike | undefined): t is CampaignTranslationLike =>
  !!t && !!t.subject?.trim() && !!t.bodyContent?.trim();

export type PickedCampaignContent = {
  locale: CampaignLocale | 'legacy';
  subject: string;
  previewText: string | null;
  titleText: string | null;
  bodyContent: string;
  ctaLabel: string | null;
  footerNote: string | null;
};

export function pickCampaignTranslation(
  campaign: CampaignLike,
  locale: string,
): PickedCampaignContent {
  const target = (CAMPAIGN_LOCALES as readonly string[]).includes(locale)
    ? (locale as CampaignLocale)
    : 'fr';
  const chain = FALLBACK_CHAIN[target];
  const translations = campaign.translations ?? [];

  for (const candidate of chain) {
    const tr = translations.find((t) => t.locale === candidate);
    if (isUsable(tr)) {
      return {
        locale: candidate,
        subject: tr.subject,
        previewText: tr.previewText,
        titleText: tr.titleText,
        bodyContent: tr.bodyContent,
        ctaLabel: tr.ctaLabel,
        footerNote: tr.footerNote,
      };
    }
  }

  // Legacy fallback (older campaigns without translations rows yet)
  return {
    locale: 'legacy',
    subject: campaign.subject,
    previewText: campaign.previewText,
    titleText: campaign.titleText,
    bodyContent: campaign.bodyContent,
    ctaLabel: campaign.ctaLabel,
    footerNote: campaign.footerNote,
  };
}

/** Normalize raw input { fr?, en?, de? } into an array shape ready for nested writes. */
export type CampaignTranslationInput = {
  subject?: string;
  previewText?: string | null;
  titleText?: string | null;
  bodyContent?: string;
  ctaLabel?: string | null;
  footerNote?: string | null;
};

export function normalizeCampaignTranslations(
  input: Partial<Record<CampaignLocale, CampaignTranslationInput>>,
): Array<{ locale: CampaignLocale } & Required<Pick<CampaignTranslationInput, 'subject' | 'bodyContent'>> & CampaignTranslationInput> {
  const out: Array<{ locale: CampaignLocale } & Required<Pick<CampaignTranslationInput, 'subject' | 'bodyContent'>> & CampaignTranslationInput> = [];
  for (const loc of CAMPAIGN_LOCALES) {
    const v = input[loc];
    if (!v) continue;
    const subject = v.subject?.trim();
    const bodyContent = v.bodyContent?.trim();
    if (!subject || !bodyContent) continue;
    out.push({
      locale: loc,
      subject,
      bodyContent,
      previewText: v.previewText?.trim() || null,
      titleText: v.titleText?.trim() || null,
      ctaLabel: v.ctaLabel?.trim() || null,
      footerNote: v.footerNote?.trim() || null,
    });
  }
  return out;
}

/**
 * Pick the best translation to mirror onto legacy scalar fields (so older email
 * paths and any code reading `campaign.subject` still work).
 * Priority: fr → en → de → first available.
 */
export function pickLegacyMirror(
  translations: Array<{ locale: CampaignLocale } & CampaignTranslationInput>,
): {
  subject: string;
  previewText: string | null;
  titleText: string | null;
  bodyContent: string;
  ctaLabel: string | null;
  footerNote: string | null;
} | null {
  if (translations.length === 0) return null;
  const order: CampaignLocale[] = ['fr', 'en', 'de'];
  const best =
    order.map((l) => translations.find((t) => t.locale === l)).find(Boolean) ??
    translations[0];
  if (!best || !best.subject || !best.bodyContent) return null;
  return {
    subject: best.subject!,
    previewText: best.previewText ?? null,
    titleText: best.titleText ?? null,
    bodyContent: best.bodyContent!,
    ctaLabel: best.ctaLabel ?? null,
    footerNote: best.footerNote ?? null,
  };
}
