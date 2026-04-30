"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { MediaPicker } from '@/app/admin/components/MediaPicker';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import type {
  EventDocumentTranslation,
  EventFormPayload,
  EventGalleryTranslation,
  EventLocaleContent,
  EventScheduleItemTranslation,
  EventSpeakerTranslation,
} from '@/lib/events-db';

type EditorEvent = (EventFormPayload & { id?: string }) | undefined;
type ScheduleItem = EventFormPayload['scheduleItems'][number];
type SpeakerItem = EventFormPayload['speakers'][number];
type OrganizationItem = EventFormPayload['organizations'][number];
type GalleryItem = EventFormPayload['gallery'][number];
type DocumentItem = EventFormPayload['documents'][number];

type LocalizedField = keyof EventLocaleContent;

const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  de: 'DE',
};

const inputCls = 'w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-accent/40 focus:bg-white/[0.09] transition';
const textareaCls = `${inputCls} resize-y leading-relaxed`;

function createLocaleRecord<T>(factory: () => T): Record<Locale, T> {
  return locales.reduce((acc, locale) => {
    acc[locale] = factory();
    return acc;
  }, {} as Record<Locale, T>);
}

function emptyContent(): EventLocaleContent {
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

function emptyScheduleTranslation(): EventScheduleItemTranslation {
  return { title: '', subtitle: '' };
}

function emptySpeakerTranslation(): EventSpeakerTranslation {
  return { profession: '', description: '' };
}

function emptyGalleryTranslation(): EventGalleryTranslation {
  return { altText: '' };
}

function emptyDocumentTranslation(): EventDocumentTranslation {
  return { title: '', description: '' };
}

function createEmptyScheduleItem(sortOrder: number): ScheduleItem {
  return {
    sortOrder,
    timeLabel: '',
    blockType: 'morning',
    translations: createLocaleRecord(emptyScheduleTranslation),
  };
}

function createEmptySpeaker(sortOrder: number): SpeakerItem {
  return {
    sortOrder,
    name: '',
    translations: createLocaleRecord(emptySpeakerTranslation),
  };
}

function createEmptyOrganization(sortOrder: number): OrganizationItem {
  return { sortOrder, name: '', kind: 'partner' };
}

function createEmptyGalleryItem(sortOrder: number): GalleryItem {
  return {
    sortOrder,
    url: '',
    translations: createLocaleRecord(emptyGalleryTranslation),
  };
}

function createEmptyDocument(sortOrder: number): DocumentItem {
  return {
    sortOrder,
    url: '',
    kind: 'summary_pdf',
    isVisible: true,
    translations: createLocaleRecord(emptyDocumentTranslation),
  };
}

function firstTitle(event?: EditorEvent) {
  if (!event) return '';
  return locales.map((locale) => event.content?.[locale]?.title ?? '').find(Boolean) ?? event.slug;
}

function createInitialForm(event?: EditorEvent): EventFormPayload {
  return {
    slug: event?.slug ?? '',
    year: event?.year ?? new Date().getFullYear(),
    status: event?.status ?? 'draft',
    sortOrder: event?.sortOrder ?? 0,
    showPrice: event?.showPrice ?? false,
    priceBlurred: event?.priceBlurred ?? false,
    heroBackgroundImage: event?.heroBackgroundImage ?? '',
    contactEmail: event?.contactEmail ?? '',
    contactPhone: event?.contactPhone ?? '',
    contactInstagram: event?.contactInstagram ?? '',
    content: event?.content ?? createLocaleRecord(emptyContent),
    scheduleItems: event?.scheduleItems?.length ? event.scheduleItems : [createEmptyScheduleItem(0)],
    speakers: event?.speakers?.length ? event.speakers : [createEmptySpeaker(0)],
    organizations: event?.organizations?.length ? event.organizations : [createEmptyOrganization(0)],
    gallery: event?.gallery?.length ? event.gallery : [createEmptyGalleryItem(0)],
    documents: event?.documents?.length ? event.documents : [createEmptyDocument(0)],
  };
}

type SectionCardProps = {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
};

function SectionCard({ id, eyebrow, title, children }: SectionCardProps) {
  return (
    <section id={id} className="scroll-mt-32 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-accent/70">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

type RepeaterProps<T> = {
  title: string;
  description: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  enableDragDrop?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
};

function Repeater<T>({
  title,
  description,
  items,
  onAdd,
  onRemove,
  enableDragDrop = false,
  onReorder,
  renderItem,
}: RepeaterProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function resetDragState() {
    setDraggedIndex(null);
    setOverIndex(null);
  }

  function handleDrop(targetIndex: number) {
    if (!enableDragDrop || !onReorder || draggedIndex === null || draggedIndex === targetIndex) {
      resetDragState();
      return;
    }

    onReorder(draggedIndex, targetIndex);
    resetDragState();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-white/40">{description}</p>
        </div>
        <button type="button" onClick={onAdd} className="rounded-xl border border-primary/20 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10">
          Ajouter
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            onDragOver={(e) => {
              if (!enableDragDrop) return;
              e.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(e) => {
              if (!enableDragDrop) return;
              e.preventDefault();
              handleDrop(index);
            }}
            onDragLeave={() => {
              if (!enableDragDrop) return;
              setOverIndex((current) => (current === index ? null : current));
            }}
            className={`rounded-2xl border bg-black/10 p-4 transition ${
              overIndex === index ? 'border-primary/40 ring-1 ring-primary/30' : 'border-white/10'
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {enableDragDrop ? (
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDraggedIndex(index)}
                    onDragEnd={resetDragState}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:border-primary/40 hover:text-white cursor-grab active:cursor-grabbing"
                    title="Glisser pour réordonner"
                    aria-label="Glisser pour réordonner"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M7 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                    </svg>
                  </button>
                ) : null}
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Élément {index + 1}</span>
              </div>
              <button type="button" onClick={() => onRemove(index)} className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10">
                Supprimer
              </button>
            </div>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminEventEditor({ event }: { event?: EditorEvent }) {
  const router = useRouter();
  const [formData, setFormData] = useState<EventFormPayload>(() => createInitialForm(event));
  const [baselinePayload, setBaselinePayload] = useState(() => JSON.stringify(createInitialForm(event)));
  const [activeLocale, setActiveLocale] = useState<Locale>('fr');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formId = event?.id ? 'event-editor-form-edit' : 'event-editor-form-new';
  const saveLabel = event?.id ? 'Enregistrer les modifications' : 'Créer l’édition';
  const hasChanges = JSON.stringify(formData) !== baselinePayload;
  const localeContent = formData.content[activeLocale];

  function scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function updateField<K extends keyof EventFormPayload>(field: K, value: EventFormPayload[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateContentField(field: LocalizedField, value: string) {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [activeLocale]: {
          ...prev.content[activeLocale],
          [field]: value,
        },
      },
    }));
  }

  function updateListItem<K extends 'scheduleItems' | 'speakers' | 'organizations' | 'gallery' | 'documents'>(
    field: K,
    index: number,
    patch: Partial<EventFormPayload[K][number]>,
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateScheduleTranslation(index: number, patch: Partial<EventScheduleItemTranslation>) {
    setFormData((prev) => ({
      ...prev,
      scheduleItems: prev.scheduleItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              translations: {
                ...item.translations,
                [activeLocale]: {
                  ...item.translations[activeLocale],
                  ...patch,
                },
              },
            }
          : item,
      ),
    }));
  }

  function updateSpeakerTranslation(index: number, patch: Partial<EventSpeakerTranslation>) {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              translations: {
                ...item.translations,
                [activeLocale]: {
                  ...item.translations[activeLocale],
                  ...patch,
                },
              },
            }
          : item,
      ),
    }));
  }

  function updateGalleryTranslation(index: number, patch: Partial<EventGalleryTranslation>) {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              translations: {
                ...item.translations,
                [activeLocale]: {
                  ...item.translations[activeLocale],
                  ...patch,
                },
              },
            }
          : item,
      ),
    }));
  }

  function updateDocumentTranslation(index: number, patch: Partial<EventDocumentTranslation>) {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              translations: {
                ...item.translations,
                [activeLocale]: {
                  ...item.translations[activeLocale],
                  ...patch,
                },
              },
            }
          : item,
      ),
    }));
  }

  function addListItem<K extends 'scheduleItems' | 'speakers' | 'organizations' | 'gallery' | 'documents'>(
    field: K,
    factory: (sortOrder: number) => EventFormPayload[K][number],
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], factory(prev[field].length)],
    }));
  }

  function removeListItem<K extends 'scheduleItems' | 'speakers' | 'organizations' | 'gallery' | 'documents'>(
    field: K,
    index: number,
    factory: () => EventFormPayload[K][number],
  ) {
    setFormData((prev) => {
      const nextItems = prev[field].filter((_, itemIndex) => itemIndex !== index);
      return {
        ...prev,
        [field]: (nextItems.length ? nextItems : [factory()]).map((item, itemIndex) => ({
          ...item,
          sortOrder: itemIndex,
        })),
      };
    });
  }

  function reorderList<K extends 'scheduleItems' | 'speakers' | 'organizations' | 'gallery' | 'documents'>(
    field: K,
    fromIndex: number,
    toIndex: number,
  ) {
    setFormData((prev) => {
      const list = [...prev[field]];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);

      const withUpdatedOrder = list.map((item, index) => ({
        ...item,
        sortOrder: index,
      }));

      return {
        ...prev,
        [field]: withUpdatedOrder,
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const method = event?.id ? 'PATCH' : 'POST';
    const url = event?.id ? `/api/admin/events/${event.id}` : '/api/admin/events';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setSaving(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? 'Erreur lors de la sauvegarde de l\'événement.');
      return;
    }

    if (event?.id) {
      setSuccess('Modifications sauvegardées.');
      setBaselinePayload(JSON.stringify(formData));
      router.refresh();
      return;
    }

    router.push('/admin/events');
    router.refresh();
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/events" className="text-white/35 hover:text-white transition focus:outline-none">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">{event?.id ? 'Modifier' : 'Nouveau'}</p>
            <h1 className="text-2xl font-bold text-white">{event?.id ? `Éditer ${firstTitle(event)}` : 'Créer une édition dynamique'}</h1>
          </div>
        </div>

        <form id={formId} onSubmit={handleSubmit} className="space-y-6 pb-28">
          <div className="sticky top-3 z-30 rounded-2xl border border-white/15 bg-[#140a0acc]/95 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">{LOCALE_LABELS[activeLocale]}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasChanges ? 'bg-amber-500/15 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'}`}>
                {hasChanges ? 'Modifications non sauvegardées' : 'Tout est sauvegardé'}
              </span>
              <div className="ml-auto flex flex-wrap gap-2">
                <button type="button" onClick={() => scrollToSection('event-base')} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/75 hover:border-primary/30 hover:text-white">Base</button>
                <button type="button" onClick={() => scrollToSection('event-content')} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/75 hover:border-primary/30 hover:text-white">Langue</button>
                <button type="button" onClick={() => scrollToSection('event-programme')} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/75 hover:border-primary/30 hover:text-white">Programme</button>
                <button type="button" onClick={() => scrollToSection('event-venue')} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/75 hover:border-primary/30 hover:text-white">Lieu</button>
                <button type="button" onClick={() => scrollToSection('event-people')} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/75 hover:border-primary/30 hover:text-white">People</button>
                <button type="submit" disabled={saving || !hasChanges} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] transition hover:bg-[#a82020] disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Sauvegarde…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>

          <SectionCard id="event-base" eyebrow="Base" title="Informations générales">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Slug *</label>
                <input className={inputCls} value={formData.slug} onChange={(e) => updateField('slug', e.target.value)} required />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Année *</label>
                <input type="number" className={inputCls} value={formData.year} onChange={(e) => updateField('year', Number(e.target.value))} required />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Statut</label>
                <select className={inputCls} value={formData.status} onChange={(e) => updateField('status', e.target.value)}>
                  <option value="draft">Brouillon</option>
                  <option value="upcoming">À venir</option>
                  <option value="published">Publié</option>
                  <option value="finished">Terminé</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Ordre</label>
                <input type="number" className={inputCls} value={formData.sortOrder} onChange={(e) => updateField('sortOrder', Number(e.target.value))} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Image hero (lien en ligne)</label>
                <input className={inputCls} value={formData.heroBackgroundImage} onChange={(e) => updateField('heroBackgroundImage', e.target.value)} placeholder="https://..." />
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-3 pt-6">
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80">
                  <input type="checkbox" checked={formData.showPrice} onChange={(e) => updateField('showPrice', e.target.checked)} />
                  Afficher le prix
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80">
                  <input type="checkbox" checked={formData.priceBlurred} onChange={(e) => updateField('priceBlurred', e.target.checked)} />
                  Prix flouté
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="event-content" eyebrow="Langue" title="Contenu traduit">
            <div className="flex flex-wrap gap-2">
              {locales.map((locale) => (
                <button
                  key={locale}
                  type="button"
                  onClick={() => setActiveLocale(locale)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition ${
                    activeLocale === locale
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'border border-white/10 bg-white/[0.03] text-white/60 hover:border-primary/30 hover:text-white'
                  }`}
                >
                  {LOCALE_LABELS[locale]}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Titre *</label>
                <input className={inputCls} value={localeContent.title} onChange={(e) => updateContentField('title', e.target.value)} required={activeLocale === 'fr'} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Thème</label>
                <input className={inputCls} value={localeContent.theme} onChange={(e) => updateContentField('theme', e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Tagline</label>
                <input className={inputCls} value={localeContent.tagline} onChange={(e) => updateContentField('tagline', e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Créneau horaire</label>
                <input className={inputCls} value={localeContent.timeRange} onChange={(e) => updateContentField('timeRange', e.target.value)} placeholder="09h00 - 18h00" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Date affichée</label>
                <input className={inputCls} value={localeContent.dateLabel} onChange={(e) => updateContentField('dateLabel', e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Date courte</label>
                <input className={inputCls} value={localeContent.dateShort} onChange={(e) => updateContentField('dateShort', e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Prix</label>
                <input className={inputCls} value={localeContent.price} onChange={(e) => updateContentField('price', e.target.value)} placeholder="40 €" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Audience</label>
                <input className={inputCls} value={localeContent.audience} onChange={(e) => updateContentField('audience', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Résumé archive</label>
                <textarea className={textareaCls} rows={3} value={localeContent.archiveSummary} onChange={(e) => updateContentField('archiveSummary', e.target.value)} placeholder="Résumé court affiché dans les archives." />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Intro galerie</label>
                <textarea className={textareaCls} rows={2} value={localeContent.galleryIntro} onChange={(e) => updateContentField('galleryIntro', e.target.value)} placeholder="Texte affiché au-dessus de la galerie." />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="event-programme" eyebrow="Programme" title="Programme principal">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Titre du programme</label>
                <input className={inputCls} value={localeContent.programmeTitle} onChange={(e) => updateContentField('programmeTitle', e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Sous-titre du programme</label>
                <input className={inputCls} value={localeContent.programmeSubtitle} onChange={(e) => updateContentField('programmeSubtitle', e.target.value)} />
              </div>
            </div>

            <Repeater
              title={`Items du programme (${LOCALE_LABELS[activeLocale]})`}
              description="Temps/intervalle partagé, contenu traduit selon la langue active. Glissez-déposez pour réordonner."
              items={formData.scheduleItems}
              onAdd={() => addListItem('scheduleItems', createEmptyScheduleItem)}
              onRemove={(index) => removeListItem('scheduleItems', index, () => createEmptyScheduleItem(0))}
              enableDragDrop
              onReorder={(fromIndex, toIndex) => reorderList('scheduleItems', fromIndex, toIndex)}
              renderItem={(item, index) => (
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Horaire</label>
                    <input className={inputCls} value={item.timeLabel} onChange={(e) => updateListItem('scheduleItems', index, { timeLabel: e.target.value })} placeholder="09:00 - 09:30" />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Bloc</label>
                    <select className={inputCls} value={item.blockType ?? 'morning'} onChange={(e) => updateListItem('scheduleItems', index, { blockType: e.target.value })}>
                      <option value="anchoring">Ancrage</option>
                      <option value="morning">Matinée</option>
                      <option value="noon">Midi</option>
                      <option value="afternoon">Après-midi</option>
                      <option value="closing">Clôture</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Titre ({LOCALE_LABELS[activeLocale]})</label>
                    <input className={inputCls} value={item.translations[activeLocale].title} onChange={(e) => updateScheduleTranslation(index, { title: e.target.value })} />
                  </div>
                  <div className="col-span-4">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Sous-titre ({LOCALE_LABELS[activeLocale]})</label>
                    <input className={inputCls} value={item.translations[activeLocale].subtitle} onChange={(e) => updateScheduleTranslation(index, { subtitle: e.target.value })} />
                  </div>
                </div>
              )}
            />
          </SectionCard>

          <SectionCard id="event-venue" eyebrow="Venue" title="Lieu et contact">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Nom du lieu</label>
                <input className={inputCls} value={localeContent.venueName} onChange={(e) => updateContentField('venueName', e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Ville</label>
                <input className={inputCls} value={localeContent.venueCity} onChange={(e) => updateContentField('venueCity', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Adresse</label>
                <input className={inputCls} value={localeContent.venueAddress} onChange={(e) => updateContentField('venueAddress', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Salle / précision</label>
                <input className={inputCls} value={localeContent.venueRoom} onChange={(e) => updateContentField('venueRoom', e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">E-mail</label>
                <input className={inputCls} value={formData.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Téléphone</label>
                <input className={inputCls} value={formData.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Instagram</label>
                <input className={inputCls} value={formData.contactInstagram} onChange={(e) => updateField('contactInstagram', e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="event-people" eyebrow="People" title="Speakers, partenaires, galerie et documents">
            <Repeater
              title={`Speakers (${LOCALE_LABELS[activeLocale]})`}
              description="Nom partagé, profession et description traduits."
              items={formData.speakers}
              onAdd={() => addListItem('speakers', createEmptySpeaker)}
              onRemove={(index) => removeListItem('speakers', index, () => createEmptySpeaker(0))}
              renderItem={(item, index) => (
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Nom *</label>
                    <input className={inputCls} value={item.name} onChange={(e) => updateListItem('speakers', index, { name: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Profession</label>
                    <input className={inputCls} value={item.translations[activeLocale].profession} onChange={(e) => updateSpeakerTranslation(index, { profession: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Ordre</label>
                    <input type="number" className={inputCls} value={item.sortOrder} onChange={(e) => updateListItem('speakers', index, { sortOrder: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Description</label>
                    <textarea className={textareaCls} rows={2} value={item.translations[activeLocale].description} onChange={(e) => updateSpeakerTranslation(index, { description: e.target.value })} />
                  </div>
                </div>
              )}
            />

            <Repeater
              title="Partenaires et sponsors"
              description="Les noms sont partagés entre les langues."
              items={formData.organizations}
              onAdd={() => addListItem('organizations', createEmptyOrganization)}
              onRemove={(index) => removeListItem('organizations', index, () => createEmptyOrganization(0))}
              renderItem={(item, index) => (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Nom *</label>
                    <input className={inputCls} value={item.name} onChange={(e) => updateListItem('organizations', index, { name: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Type</label>
                    <select className={inputCls} value={item.kind} onChange={(e) => updateListItem('organizations', index, { kind: e.target.value })}>
                      <option value="partner">Partenaire</option>
                      <option value="sponsor">Sponsor</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Ordre</label>
                    <input type="number" className={inputCls} value={item.sortOrder} onChange={(e) => updateListItem('organizations', index, { sortOrder: Number(e.target.value) })} />
                  </div>
                </div>
              )}
            />

            <Repeater
              title={`Galerie (${LOCALE_LABELS[activeLocale]})`}
              description="Ajoutez et supprimez des images via la médiathèque web, puis traduisez le texte alternatif."
              items={formData.gallery}
              onAdd={() => addListItem('gallery', createEmptyGalleryItem)}
              onRemove={(index) => removeListItem('gallery', index, () => createEmptyGalleryItem(0))}
              renderItem={(item, index) => (
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <MediaPicker
                      label="Image de la galerie *"
                      value={item.url}
                      onChange={(url) => updateListItem('gallery', index, { url })}
                      defaultCategory="event"
                      placeholder="/media/... ou URL externe"
                      helperText="Cliquez sur Médiathèque pour uploader ou sélectionner une image."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Texte alternatif</label>
                    <input className={inputCls} value={item.translations[activeLocale].altText} onChange={(e) => updateGalleryTranslation(index, { altText: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Ordre</label>
                    <input type="number" className={inputCls} value={item.sortOrder} onChange={(e) => updateListItem('gallery', index, { sortOrder: Number(e.target.value) })} />
                  </div>
                </div>
              )}
            />

            <Repeater
              title={`Documents (${LOCALE_LABELS[activeLocale]})`}
              description="PDF résumé ou lien d'archive, avec titre et description traduits."
              items={formData.documents}
              onAdd={() => addListItem('documents', createEmptyDocument)}
              onRemove={(index) => removeListItem('documents', index, () => createEmptyDocument(0))}
              renderItem={(item, index) => (
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">URL *</label>
                    <input className={inputCls} value={item.url} onChange={(e) => updateListItem('documents', index, { url: e.target.value })} placeholder="https://... ou /downloads/..." />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Type</label>
                    <select className={inputCls} value={item.kind} onChange={(e) => updateListItem('documents', index, { kind: e.target.value })}>
                      <option value="summary_pdf">Résumé PDF</option>
                      <option value="archive_link">Lien archive</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Ordre</label>
                    <input type="number" className={inputCls} value={item.sortOrder} onChange={(e) => updateListItem('documents', index, { sortOrder: Number(e.target.value) })} />
                  </div>
                    <div className="md:col-span-4">
                      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 cursor-pointer">
                        <input type="checkbox" checked={item.isVisible ?? true} onChange={(e) => updateListItem('documents', index, { isVisible: e.target.checked })} />
                        <span>Téléchargement activé (visible sur la page publique une fois l'événement publié ou terminé)</span>
                      </label>
                    </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Titre</label>
                    <input className={inputCls} value={item.translations[activeLocale].title} onChange={(e) => updateDocumentTranslation(index, { title: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Description</label>
                    <textarea className={textareaCls} rows={2} value={item.translations[activeLocale].description} onChange={(e) => updateDocumentTranslation(index, { description: e.target.value })} />
                  </div>
                </div>
              )}
            />
          </SectionCard>

          {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          {success ? <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving || !hasChanges} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] transition hover:bg-[#a82020] disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Sauvegarde…' : saveLabel}
            </button>
            <Link href="/admin/events" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white">
              Annuler
            </Link>
          </div>
        </form>

        <button
          type="submit"
          form={formId}
          disabled={saving || !hasChanges}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(140,26,26,0.45)] transition hover:bg-[#a82020] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
