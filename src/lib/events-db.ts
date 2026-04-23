import type { EventData } from '@/content/events';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const LOCALE_LIST = [...locales] as Locale[];
const FALLBACK_LOCALE: Locale = 'fr';

type LocaleRecord<T> = Record<Locale, T>;

export const eventInclude = {
  translations: true,
  venue: {
    include: {
      translations: true,
    },
  },
  prices: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      translations: true,
    },
  },
  scheduleSections: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      translations: true,
    },
  },
  scheduleItems: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      translations: true,
      itemSpeakers: {
        orderBy: { sortOrder: 'asc' as const },
        include: {
          speaker: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  },
  eventSpeakers: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      speaker: {
        include: {
          translations: true,
        },
      },
    },
  },
  eventOrganizations: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      organization: {
        include: {
          translations: true,
        },
      },
    },
  },
  mediaItems: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      translations: true,
    },
  },
  documents: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      translations: true,
    },
  },
} satisfies Prisma.EventInclude;

export type EventWithRelations = Prisma.EventGetPayload<{
  include: typeof eventInclude;
}>;

export type EventLocaleContent = {
  title: string;
  theme: string;
  tagline: string;
  timeRange: string;
  price: string;
  audience: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueRoom: string;
  dateLabel: string;
  dateShort: string;
  programmeTitle: string;
  programmeSubtitle: string;
  galleryIntro: string;
  archiveSummary: string;
};

export type EventScheduleItemTranslation = {
  title: string;
  subtitle: string;
};

export type EventSpeakerTranslation = {
  profession: string;
  description: string;
};

export type EventGalleryTranslation = {
  altText: string;
};

export type EventDocumentTranslation = {
  title: string;
  description: string;
};

export type EventFormRelationItem = {
  id?: string;
  sortOrder: number;
};

export type EventFormPayload = {
  slug: string;
  year: number;
  status: string;
  sortOrder: number;
  showPrice: boolean;
  priceBlurred: boolean;
  heroBackgroundImage: string;
  contactEmail: string;
  contactPhone: string;
  contactInstagram: string;
  content: LocaleRecord<EventLocaleContent>;
  scheduleItems: Array<
    EventFormRelationItem & {
      timeLabel: string;
      translations: LocaleRecord<EventScheduleItemTranslation>;
    }
  >;
  speakers: Array<
    EventFormRelationItem & {
      name: string;
      translations: LocaleRecord<EventSpeakerTranslation>;
    }
  >;
  organizations: Array<
    EventFormRelationItem & {
      name: string;
      kind: string;
    }
  >;
  gallery: Array<
    EventFormRelationItem & {
      url: string;
      translations: LocaleRecord<EventGalleryTranslation>;
    }
  >;
  documents: Array<
    EventFormRelationItem & {
      url: string;
      kind: string;
      translations: LocaleRecord<EventDocumentTranslation>;
    }
  >;
};

export type EventArchiveCard = {
  id: string;
  slug: string;
  year: number;
  title: string;
  archiveSummary: string;
  dateLabel: string;
  venueName: string;
  venueCity: string;
  documents: Array<{
    id: string;
    title: string;
    url: string;
  }>;
};

function createLocaleRecord<T>(factory: (locale: Locale) => T): LocaleRecord<T> {
  return LOCALE_LIST.reduce((acc, locale) => {
    acc[locale] = factory(locale);
    return acc;
  }, {} as LocaleRecord<T>);
}

function emptyEventLocaleContent(): EventLocaleContent {
  return {
    title: '',
    theme: '',
    tagline: '',
    timeRange: '',
    price: '',
    audience: '',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueRoom: '',
    dateLabel: '',
    dateShort: '',
    programmeTitle: '',
    programmeSubtitle: '',
    galleryIntro: '',
    archiveSummary: '',
  };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function integer(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
}

function normalizeStatus(value: unknown): string {
  const normalized = text(value).toLowerCase();
  if (normalized === 'published' || normalized === 'draft' || normalized === 'archived' || normalized === 'upcoming') {
    return normalized;
  }
  return 'draft';
}

function normalizeOrganizationKind(value: unknown): string {
  return text(value).toLowerCase() === 'sponsor' ? 'sponsor' : 'partner';
}

function normalizeDocumentKind(value: unknown): string {
  return text(value).toLowerCase() === 'archive_link' ? 'archive_link' : 'summary_pdf';
}

function normalizeSlugFragment(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'item';
}

function splitTimeLabel(timeLabel: string) {
  const parts = timeLabel
    .split(/\s*(?:-|–|—)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    startTime: parts[0] ?? null,
    endTime: parts[1] ?? null,
  };
}

function joinTimeLabel(startTime?: string | null, endTime?: string | null) {
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return startTime || endTime || '';
}

function localePriority(locale?: Locale) {
  return locale ? [locale, ...LOCALE_LIST.filter((item) => item !== locale)] : LOCALE_LIST;
}

function pickLocaleItem<T extends { locale: string }>(items: T[], locale?: Locale) {
  return localePriority(locale)
    .map((current) => items.find((item) => item.locale === current))
    .find(Boolean) ?? items[0] ?? null;
}

function firstNonEmpty(values: string[]) {
  return values.find((value) => value.trim()) ?? '';
}

function fallbackLocaleFromContent(content: LocaleRecord<EventLocaleContent>) {
  return (
    localePriority().find((locale) => {
      const item = content[locale];
      return Boolean(item.title || item.theme || item.archiveSummary);
    }) ?? FALLBACK_LOCALE
  );
}

function contentHasVenueData(content: LocaleRecord<EventLocaleContent>) {
  return LOCALE_LIST.some((locale) => {
    const item = content[locale];
    return Boolean(item.venueName || item.venueAddress || item.venueCity || item.venueRoom);
  });
}

function localizedEventContent(content: LocaleRecord<EventLocaleContent>, locale: Locale) {
  const active = content[locale];
  const fallback = content[fallbackLocaleFromContent(content)];

  return {
    title: active.title || fallback.title,
    theme: active.theme || fallback.theme,
    tagline: active.tagline || fallback.tagline,
    timeRange: active.timeRange || fallback.timeRange,
    price: active.price || fallback.price,
    audience: active.audience || fallback.audience,
    venueName: active.venueName || fallback.venueName,
    venueAddress: active.venueAddress || fallback.venueAddress,
    venueCity: active.venueCity || fallback.venueCity,
    venueRoom: active.venueRoom || fallback.venueRoom,
    dateLabel: active.dateLabel || fallback.dateLabel,
    dateShort: active.dateShort || fallback.dateShort,
    programmeTitle: active.programmeTitle || fallback.programmeTitle,
    programmeSubtitle: active.programmeSubtitle || fallback.programmeSubtitle,
    galleryIntro: active.galleryIntro || fallback.galleryIntro,
    archiveSummary: active.archiveSummary || fallback.archiveSummary,
  };
}

function normalizeLocaleContentMap(value: unknown) {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  return createLocaleRecord((locale) => {
    const localeRecord = record[locale] && typeof record[locale] === 'object' ? (record[locale] as Record<string, unknown>) : {};

    return {
      title: text(localeRecord.title),
      theme: text(localeRecord.theme),
      tagline: text(localeRecord.tagline),
      timeRange: text(localeRecord.timeRange),
      price: text(localeRecord.price),
      audience: text(localeRecord.audience),
      venueName: text(localeRecord.venueName),
      venueAddress: text(localeRecord.venueAddress),
      venueCity: text(localeRecord.venueCity),
      venueRoom: text(localeRecord.venueRoom),
      dateLabel: text(localeRecord.dateLabel),
      dateShort: text(localeRecord.dateShort),
      programmeTitle: text(localeRecord.programmeTitle),
      programmeSubtitle: text(localeRecord.programmeSubtitle),
      galleryIntro: text(localeRecord.galleryIntro),
      archiveSummary: text(localeRecord.archiveSummary),
    };
  });
}

function normalizeRelationArray<T>(
  value: unknown,
  mapper: (item: Record<string, unknown>, index: number) => T | null,
): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      return mapper(item as Record<string, unknown>, index);
    })
    .filter((item): item is T => item !== null);
}

function normalizeScheduleItemTranslations(value: unknown, fallback: Record<string, unknown>) {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return createLocaleRecord((locale) => {
    const localeRecord = record[locale] && typeof record[locale] === 'object' ? (record[locale] as Record<string, unknown>) : fallback;
    return {
      title: text(localeRecord.title),
      subtitle: text(localeRecord.subtitle),
    };
  });
}

function normalizeSpeakerTranslations(value: unknown, fallback: Record<string, unknown>) {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return createLocaleRecord((locale) => {
    const localeRecord = record[locale] && typeof record[locale] === 'object' ? (record[locale] as Record<string, unknown>) : fallback;
    return {
      profession: text(localeRecord.profession),
      description: text(localeRecord.description),
    };
  });
}

function normalizeGalleryTranslations(value: unknown, fallback: Record<string, unknown>) {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return createLocaleRecord((locale) => {
    const localeRecord = record[locale] && typeof record[locale] === 'object' ? (record[locale] as Record<string, unknown>) : fallback;
    return {
      altText: text(localeRecord.altText),
    };
  });
}

function normalizeDocumentTranslations(value: unknown, fallback: Record<string, unknown>) {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return createLocaleRecord((locale) => {
    const localeRecord = record[locale] && typeof record[locale] === 'object' ? (record[locale] as Record<string, unknown>) : fallback;
    return {
      title: text(localeRecord.title),
      description: text(localeRecord.description),
    };
  });
}

function inferLegacyContent(record: Record<string, unknown>) {
  const content = createLocaleRecord(() => emptyEventLocaleContent());

  content[FALLBACK_LOCALE] = {
    title: text(record.title),
    theme: text(record.theme),
    tagline: text(record.tagline),
    timeRange: text(record.timeRange),
    price: text(record.price),
    audience: text(record.audience),
    venueName: text(record.venueName),
    venueAddress: text(record.venueAddress),
    venueCity: text(record.venueCity),
    venueRoom: text(record.venueRoom),
    dateLabel: text(record.dateLabel),
    dateShort: text(record.dateShort),
    programmeTitle: text(record.programmeTitle),
    programmeSubtitle: text(record.programmeSubtitle),
    galleryIntro: text(record.galleryIntro),
    archiveSummary: text(record.archiveSummary),
  };

  return content;
}

export function normalizeEventPayload(input: unknown): EventFormPayload {
  const record = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const hasTranslations = record.content && typeof record.content === 'object';

  return {
    slug: text(record.slug),
    year: integer(record.year, new Date().getFullYear()),
    status: normalizeStatus(record.status),
    sortOrder: integer(record.sortOrder, 0),
    showPrice: bool(record.showPrice, false),
    priceBlurred: bool(record.priceBlurred, false),
    heroBackgroundImage: text(record.heroBackgroundImage),
    contactEmail: text(record.contactEmail),
    contactPhone: text(record.contactPhone),
    contactInstagram: text(record.contactInstagram),
    content: hasTranslations ? normalizeLocaleContentMap(record.content) : inferLegacyContent(record),
    scheduleItems: normalizeRelationArray(record.scheduleItems, (item, index) => ({
      id: text(item.id) || undefined,
      sortOrder: integer(item.sortOrder, index),
      timeLabel: text(item.timeLabel),
      translations: normalizeScheduleItemTranslations(item.translations, item),
    })).filter(
      (item) =>
        item.timeLabel ||
        LOCALE_LIST.some((locale) => item.translations[locale].title || item.translations[locale].subtitle),
    ),
    speakers: normalizeRelationArray(record.speakers, (item, index) => ({
      id: text(item.id) || undefined,
      sortOrder: integer(item.sortOrder, index),
      name: text(item.name),
      translations: normalizeSpeakerTranslations(item.translations, item),
    })).filter((item) => item.name),
    organizations: normalizeRelationArray(record.organizations, (item, index) => ({
      id: text(item.id) || undefined,
      sortOrder: integer(item.sortOrder, index),
      name: text(item.name),
      kind: normalizeOrganizationKind(item.kind),
    })).filter((item) => item.name),
    gallery: normalizeRelationArray(record.gallery, (item, index) => ({
      id: text(item.id) || undefined,
      sortOrder: integer(item.sortOrder, index),
      url: text(item.url),
      translations: normalizeGalleryTranslations(item.translations, item),
    })).filter((item) => item.url),
    documents: normalizeRelationArray(record.documents, (item, index) => ({
      id: text(item.id) || undefined,
      sortOrder: integer(item.sortOrder, index),
      url: text(item.url),
      kind: normalizeDocumentKind(item.kind),
      translations: normalizeDocumentTranslations(item.translations, item),
    })).filter((item) => item.url),
  };
}

function hasAnyLocalizedTitle(payload: EventFormPayload) {
  return LOCALE_LIST.some((locale) => payload.content[locale].title);
}

export function validateEventPayload(payload: EventFormPayload) {
  if (!payload.slug) return 'Le slug est requis.';
  if (!Number.isFinite(payload.year) || payload.year < 2000 || payload.year > 2100) {
    return 'L\'année est invalide.';
  }
  if (!hasAnyLocalizedTitle(payload)) {
    return 'Au moins un titre localisé est requis.';
  }
  return null;
}

function formatDateLabel(event: EventWithRelations, label?: string) {
  if (label) return label;
  if (!event.startsAt) return '';

  const start = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(event.startsAt);

  if (!event.endsAt) return start;

  const end = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(event.endsAt);

  return start === end ? start : `${start} - ${end}`;
}

function documentTypeFromKind(kind: string) {
  return kind === 'archive_link' ? 'archive_link' : 'event_book';
}

function documentKindFromType(type: string) {
  return type === 'archive_link' ? 'archive_link' : 'summary_pdf';
}

function titleForLocale(content: LocaleRecord<EventLocaleContent>, locale: Locale, slug: string) {
  return localizedEventContent(content, locale).title || slug;
}

async function syncVenue(tx: Prisma.TransactionClient, payload: EventFormPayload, currentVenueId?: string | null) {
  if (!contentHasVenueData(payload.content)) {
    return null;
  }

  const baseLocale = fallbackLocaleFromContent(payload.content);
  const baseContent = localizedEventContent(payload.content, baseLocale);

  let venueId = currentVenueId ?? null;

  if (venueId) {
    await tx.venue.update({
      where: { id: venueId },
      data: {
        name: baseContent.venueName || titleForLocale(payload.content, baseLocale, payload.slug),
        addressLine1: baseContent.venueAddress || '',
        city: baseContent.venueCity || '',
        country: 'Germany',
      },
    });
  } else {
    const venue = await tx.venue.create({
      data: {
        name: baseContent.venueName || titleForLocale(payload.content, baseLocale, payload.slug),
        addressLine1: baseContent.venueAddress || '',
        city: baseContent.venueCity || '',
        country: 'Germany',
      },
    });
    venueId = venue.id;
  }

  for (const locale of LOCALE_LIST) {
    const item = localizedEventContent(payload.content, locale);

    await tx.venueTranslation.upsert({
      where: {
        venueId_locale: {
          venueId,
          locale,
        },
      },
      update: {
        displayName: item.venueName,
        addressLabel: item.venueAddress,
        cityLabel: item.venueCity,
        shortDescription: item.venueRoom,
      },
      create: {
        venueId,
        locale,
        displayName: item.venueName,
        addressLabel: item.venueAddress,
        cityLabel: item.venueCity,
        shortDescription: item.venueRoom,
      },
    });
  }

  return venueId;
}

async function syncEventTranslations(tx: Prisma.TransactionClient, eventId: string, payload: EventFormPayload) {
  for (const locale of LOCALE_LIST) {
    const item = localizedEventContent(payload.content, locale);

    await tx.eventTranslation.upsert({
      where: {
        eventId_locale: {
          eventId,
          locale,
        },
      },
      update: {
        name: item.title || titleForLocale(payload.content, FALLBACK_LOCALE, payload.slug),
        title: item.title || titleForLocale(payload.content, FALLBACK_LOCALE, payload.slug),
        subtitle: item.tagline,
        shortDescription: item.archiveSummary,
        heroText: item.timeRange,
        audienceLabel: item.audience,
        badgeText: item.theme,
        galleryIntro: item.galleryIntro,
        dateFallbackLabel: item.dateLabel,
        dateTbaLabel: item.dateShort,
      },
      create: {
        eventId,
        locale,
        name: item.title || titleForLocale(payload.content, FALLBACK_LOCALE, payload.slug),
        title: item.title || titleForLocale(payload.content, FALLBACK_LOCALE, payload.slug),
        subtitle: item.tagline,
        shortDescription: item.archiveSummary,
        heroText: item.timeRange,
        audienceLabel: item.audience,
        badgeText: item.theme,
        galleryIntro: item.galleryIntro,
        dateFallbackLabel: item.dateLabel,
        dateTbaLabel: item.dateShort,
      },
    });
  }
}

async function syncEventPrices(tx: Prisma.TransactionClient, eventId: string, payload: EventFormPayload) {
  await tx.eventPrice.deleteMany({ where: { eventId } });

  const hasPrice = LOCALE_LIST.some((locale) => payload.content[locale].price);
  if (!hasPrice) return;

  await tx.eventPrice.create({
    data: {
      eventId,
      type: 'general',
      sortOrder: 0,
      isVisible: payload.showPrice,
      translations: {
        create: LOCALE_LIST.map((locale) => ({
          locale,
          label: localizedEventContent(payload.content, locale).price,
          infoText: '',
        })),
      },
    },
  });
}

async function syncSchedule(tx: Prisma.TransactionClient, eventId: string, payload: EventFormPayload) {
  await tx.scheduleItem.deleteMany({ where: { eventId } });
  await tx.scheduleSection.deleteMany({ where: { eventId } });

  const hasSection =
    payload.scheduleItems.length > 0 ||
    LOCALE_LIST.some((locale) => {
      const item = payload.content[locale];
      return Boolean(item.programmeTitle || item.programmeSubtitle);
    });

  let sectionId: string | null = null;

  if (hasSection) {
    const section = await tx.scheduleSection.create({
      data: {
        eventId,
        sortOrder: 0,
        translations: {
          create: LOCALE_LIST.map((locale) => ({
            locale,
            title: localizedEventContent(payload.content, locale).programmeTitle || 'Programme',
            subtitle: localizedEventContent(payload.content, locale).programmeSubtitle,
          })),
        },
      },
    });

    sectionId = section.id;
  }

  for (const item of payload.scheduleItems) {
    const { startTime, endTime } = splitTimeLabel(item.timeLabel);

    await tx.scheduleItem.create({
      data: {
        eventId,
        sectionId,
        startTime,
        endTime,
        sortOrder: item.sortOrder,
        translations: {
          create: LOCALE_LIST.map((locale) => ({
            locale,
            title: item.translations[locale].title,
            subtitle: item.translations[locale].subtitle,
            description: item.translations[locale].subtitle,
          })),
        },
      },
    });
  }
}

async function syncSpeakers(tx: Prisma.TransactionClient, eventId: string, payload: EventFormPayload) {
  const existingLinks = await tx.eventSpeaker.findMany({
    where: { eventId },
    select: { speakerId: true },
  });

  await tx.eventSpeaker.deleteMany({ where: { eventId } });

  if (existingLinks.length > 0) {
    await tx.speaker.deleteMany({
      where: {
        id: {
          in: existingLinks.map((item) => item.speakerId),
        },
      },
    });
  }

  for (let index = 0; index < payload.speakers.length; index += 1) {
    const speaker = payload.speakers[index];

    const createdSpeaker = await tx.speaker.create({
      data: {
        slug: `${payload.slug}-speaker-${index + 1}-${normalizeSlugFragment(speaker.name)}-${crypto.randomUUID().slice(0, 6)}`,
        displayName: speaker.name,
        sortOrder: speaker.sortOrder,
        translations: {
          create: LOCALE_LIST.map((locale) => ({
            locale,
            role: speaker.translations[locale].profession,
            shortBio: speaker.translations[locale].description,
            longBio: speaker.translations[locale].description,
          })),
        },
      },
    });

    await tx.eventSpeaker.create({
      data: {
        eventId,
        speakerId: createdSpeaker.id,
        sortOrder: speaker.sortOrder,
      },
    });
  }
}

async function syncOrganizations(tx: Prisma.TransactionClient, eventId: string, payload: EventFormPayload) {
  const existingLinks = await tx.eventOrganization.findMany({
    where: { eventId },
    select: { organizationId: true },
  });

  await tx.eventOrganization.deleteMany({ where: { eventId } });

  if (existingLinks.length > 0) {
    await tx.organization.deleteMany({
      where: {
        id: {
          in: existingLinks.map((item) => item.organizationId),
        },
      },
    });
  }

  for (let index = 0; index < payload.organizations.length; index += 1) {
    const organization = payload.organizations[index];

    const createdOrganization = await tx.organization.create({
      data: {
        slug: `${payload.slug}-org-${index + 1}-${normalizeSlugFragment(organization.name)}-${crypto.randomUUID().slice(0, 6)}`,
        name: organization.name,
        category: organization.kind,
        sortOrder: organization.sortOrder,
        translations: {
          create: LOCALE_LIST.map((locale) => ({
            locale,
            shortDescription: '',
          })),
        },
      },
    });

    await tx.eventOrganization.create({
      data: {
        eventId,
        organizationId: createdOrganization.id,
        category: organization.kind,
        sortOrder: organization.sortOrder,
      },
    });
  }
}

async function syncGallery(tx: Prisma.TransactionClient, eventId: string, payload: EventFormPayload) {
  await tx.eventMedia.deleteMany({ where: { eventId } });

  for (const item of payload.gallery) {
    await tx.eventMedia.create({
      data: {
        eventId,
        type: 'gallery',
        url: item.url,
        sortOrder: item.sortOrder,
        translations: {
          create: LOCALE_LIST.map((locale) => ({
            locale,
            altText: item.translations[locale].altText,
            caption: '',
          })),
        },
      },
    });
  }
}

async function syncDocuments(tx: Prisma.TransactionClient, eventId: string, payload: EventFormPayload) {
  await tx.eventDocument.deleteMany({ where: { eventId } });

  for (const item of payload.documents) {
    await tx.eventDocument.create({
      data: {
        eventId,
        type: documentTypeFromKind(item.kind),
        url: item.url,
        sortOrder: item.sortOrder,
        translations: {
          create: LOCALE_LIST.map((locale) => ({
            locale,
            title: item.translations[locale].title,
            description: item.translations[locale].description,
          })),
        },
      },
    });
  }
}

async function syncEventRelations(tx: Prisma.TransactionClient, eventId: string, payload: EventFormPayload) {
  await syncEventTranslations(tx, eventId, payload);
  await syncEventPrices(tx, eventId, payload);
  await syncSchedule(tx, eventId, payload);
  await syncSpeakers(tx, eventId, payload);
  await syncOrganizations(tx, eventId, payload);
  await syncGallery(tx, eventId, payload);
  await syncDocuments(tx, eventId, payload);
}

export async function createEventRecord(payload: EventFormPayload) {
  return prisma.$transaction(async (tx) => {
    const baseLocale = fallbackLocaleFromContent(payload.content);
    const baseContent = localizedEventContent(payload.content, baseLocale);
    const venueId = await syncVenue(tx, payload, null);

    const event = await tx.event.create({
      data: {
        slug: payload.slug,
        year: payload.year,
        status: payload.status,
        sortOrder: payload.sortOrder,
        heroImageUrl: payload.heroBackgroundImage || null,
        heroBadge: baseContent.theme || null,
        contactEmail: payload.contactEmail || null,
        contactPhone: payload.contactPhone || null,
        contactInstagram: payload.contactInstagram || null,
        showPrice: payload.showPrice,
        priceBlurred: payload.priceBlurred,
        publishedAt: payload.status === 'published' ? new Date() : null,
        venueId,
      },
    });

    await syncEventRelations(tx, event.id, payload);

    return tx.event.findUniqueOrThrow({ where: { id: event.id }, include: eventInclude });
  });
}

export async function updateEventRecord(eventId: string, payload: EventFormPayload, currentVenueId?: string | null) {
  return prisma.$transaction(async (tx) => {
    const baseLocale = fallbackLocaleFromContent(payload.content);
    const baseContent = localizedEventContent(payload.content, baseLocale);
    const venueId = await syncVenue(tx, payload, currentVenueId ?? null);

    await tx.event.update({
      where: { id: eventId },
      data: {
        slug: payload.slug,
        year: payload.year,
        status: payload.status,
        sortOrder: payload.sortOrder,
        heroImageUrl: payload.heroBackgroundImage || null,
        heroBadge: baseContent.theme || null,
        contactEmail: payload.contactEmail || null,
        contactPhone: payload.contactPhone || null,
        contactInstagram: payload.contactInstagram || null,
        showPrice: payload.showPrice,
        priceBlurred: payload.priceBlurred,
        publishedAt: payload.status === 'published' ? new Date() : null,
        venueId,
      },
    });

    await syncEventRelations(tx, eventId, payload);

    return tx.event.findUniqueOrThrow({ where: { id: eventId }, include: eventInclude });
  });
}

function localizedTranslationContent(event: EventWithRelations, locale: Locale) {
  const translation = pickLocaleItem(event.translations, locale);
  const venueTranslation = event.venue ? pickLocaleItem(event.venue.translations, locale) : null;
  const sectionTranslation = event.scheduleSections[0] ? pickLocaleItem(event.scheduleSections[0].translations, locale) : null;
  const priceTranslation = event.prices[0] ? pickLocaleItem(event.prices[0].translations, locale) : null;

  return {
    title: translation?.title || translation?.name || event.slug,
    theme: translation?.badgeText || event.heroBadge || '',
    tagline: translation?.subtitle || '',
    timeRange: translation?.heroText || '',
    price: priceTranslation?.label || '',
    audience: translation?.audienceLabel || '',
    venueName: venueTranslation?.displayName || event.venue?.name || '',
    venueAddress: venueTranslation?.addressLabel || event.venue?.addressLine1 || '',
    venueCity: venueTranslation?.cityLabel || event.venue?.city || '',
    venueRoom: venueTranslation?.shortDescription || '',
    dateLabel: formatDateLabel(event, translation?.dateFallbackLabel || ''),
    dateShort: translation?.dateTbaLabel || String(event.year),
    programmeTitle: sectionTranslation?.title || '',
    programmeSubtitle: sectionTranslation?.subtitle || '',
    galleryIntro: translation?.galleryIntro || '',
    archiveSummary: translation?.shortDescription || '',
  } satisfies EventLocaleContent;
}

function localizedScheduleItem(item: EventWithRelations['scheduleItems'][number], locale: Locale) {
  const translation = pickLocaleItem(item.translations, locale);
  return {
    title: translation?.title || '',
    subtitle: translation?.subtitle || translation?.description || '',
  };
}

function localizedSpeaker(link: EventWithRelations['eventSpeakers'][number], locale: Locale) {
  const translation = pickLocaleItem(link.speaker.translations, locale);
  return {
    profession: translation?.role || '',
    description: firstNonEmpty([translation?.shortBio || '', translation?.longBio || '']),
  };
}

function localizedGalleryItem(item: EventWithRelations['mediaItems'][number], locale: Locale) {
  const translation = pickLocaleItem(item.translations, locale);
  return {
    altText: translation?.altText || '',
  };
}

function localizedDocument(item: EventWithRelations['documents'][number], locale: Locale) {
  const translation = pickLocaleItem(item.translations, locale);
  return {
    title: translation?.title || item.url,
    description: translation?.description || '',
  };
}

export function serializeEventForForm(event: EventWithRelations): EventFormPayload & { id: string } {
  return {
    id: event.id,
    slug: event.slug,
    year: event.year,
    status: event.status,
    sortOrder: event.sortOrder,
    showPrice: event.showPrice,
    priceBlurred: event.priceBlurred,
    heroBackgroundImage: event.heroImageUrl || '',
    contactEmail: event.contactEmail || '',
    contactPhone: event.contactPhone || '',
    contactInstagram: event.contactInstagram || '',
    content: createLocaleRecord((locale) => localizedTranslationContent(event, locale)),
    scheduleItems: event.scheduleItems.map((item) => ({
      id: item.id,
      sortOrder: item.sortOrder,
      timeLabel: joinTimeLabel(item.startTime, item.endTime),
      translations: createLocaleRecord((locale) => localizedScheduleItem(item, locale)),
    })),
    speakers: event.eventSpeakers.map((link) => ({
      id: link.id,
      sortOrder: link.sortOrder,
      name: link.speaker.displayName,
      translations: createLocaleRecord((locale) => localizedSpeaker(link, locale)),
    })),
    organizations: event.eventOrganizations.map((link) => ({
      id: link.id,
      sortOrder: link.sortOrder,
      name: link.organization.name,
      kind: link.category,
    })),
    gallery: event.mediaItems
      .filter((item) => item.type === 'gallery')
      .map((item) => ({
        id: item.id,
        sortOrder: item.sortOrder,
        url: item.url,
        translations: createLocaleRecord((locale) => localizedGalleryItem(item, locale)),
      })),
    documents: event.documents.map((item) => ({
      id: item.id,
      sortOrder: item.sortOrder,
      url: item.url,
      kind: documentKindFromType(item.type),
      translations: createLocaleRecord((locale) => localizedDocument(item, locale)),
    })),
  };
}

export function mapEventToEventData(event: EventWithRelations, locale: Locale): EventData {
  const form = serializeEventForForm(event);
  const content = localizedEventContent(form.content, locale);
  const summaryPdf = form.documents.find((item) => item.kind === 'summary_pdf');
  const isUpcoming = event.status === 'upcoming';
  const publicProgramme = isUpcoming
    ? []
    : form.scheduleItems.map((item) => ({
        time: item.timeLabel,
        title: item.translations[locale].title || firstNonEmpty(LOCALE_LIST.map((key) => item.translations[key].title)),
        desc: item.translations[locale].subtitle || firstNonEmpty(LOCALE_LIST.map((key) => item.translations[key].subtitle)) || undefined,
      }));

  return {
    theme: content.theme || undefined,
    tagline: content.tagline || undefined,
    timeRange: content.timeRange || undefined,
    programmeTitle: isUpcoming ? undefined : content.programmeTitle || undefined,
    programmeSubtitle: isUpcoming ? undefined : content.programmeSubtitle || undefined,
    showPrice: form.showPrice,
    priceBlurred: form.priceBlurred,
    price: content.price || undefined,
    heroBackgroundImage: form.heroBackgroundImage || undefined,
    audience: content.audience || undefined,
    programme: publicProgramme,
    speakers: form.speakers.map((item) => ({
      name: item.name,
      role: item.translations[locale].profession || firstNonEmpty(LOCALE_LIST.map((key) => item.translations[key].profession)),
      domain: item.translations[locale].description || firstNonEmpty(LOCALE_LIST.map((key) => item.translations[key].description)),
    })),
    venue: {
      name: content.venueName,
      address: content.venueAddress,
      city: content.venueCity,
      room: content.venueRoom || undefined,
    },
    date: content.dateLabel,
    dateShort: content.dateShort || undefined,
    partners: form.organizations.map((item) => (item.kind === 'sponsor' ? `Sponsor · ${item.name}` : item.name)),
    contact:
      form.contactEmail || form.contactPhone || form.contactInstagram
        ? {
            email: form.contactEmail || undefined,
            phone: form.contactPhone || undefined,
            instagram: form.contactInstagram || undefined,
          }
        : undefined,
    gallery: form.gallery.map((item) => item.url),
    galleryIntro: content.galleryIntro || undefined,
    videos: [],
    firstEditionBookUrl: summaryPdf?.url,
  };
}

export function mapEventToArchiveCard(event: EventWithRelations, locale: Locale): EventArchiveCard {
  const form = serializeEventForForm(event);
  const content = localizedEventContent(form.content, locale);

  return {
    id: event.id,
    slug: event.slug,
    year: event.year,
    title: content.title,
    archiveSummary: content.archiveSummary,
    dateLabel: content.dateLabel || content.dateShort || String(event.year),
    venueName: content.venueName,
    venueCity: content.venueCity,
    documents: form.documents.map((item) => ({
      id: item.id ?? `${event.id}-${item.sortOrder}`,
      title: item.translations[locale].title || firstNonEmpty(LOCALE_LIST.map((key) => item.translations[key].title)) || item.url,
      url: item.url,
    })),
  };
}

export function getEventHeadline(event: EventWithRelations, locale: Locale) {
  const content = localizedTranslationContent(event, locale);
  return {
    title: content.title,
    summary: content.archiveSummary,
  };
}

export async function getPublishedEvents() {
  return prisma.event.findMany({
    where: { status: 'published', deletedAt: null },
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: eventInclude,
  });
}

export async function getLandingEvents() {
  return prisma.event.findMany({
    where: {
      deletedAt: null,
      status: {
        in: ['published', 'upcoming'],
      },
    },
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: eventInclude,
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({ where: { id }, include: eventInclude });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: { slug, deletedAt: null },
    include: eventInclude,
  });
}
