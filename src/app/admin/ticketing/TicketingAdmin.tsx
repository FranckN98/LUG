'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminNotify } from '@/app/admin/components/AdminToaster';

// ── Types ──────────────────────────────────────────────────────────────────────

type AdminLocale = 'fr' | 'en' | 'de';
const ADMIN_LOCALES: AdminLocale[] = ['fr', 'en', 'de'];
const ADMIN_LOCALE_LABELS: Record<AdminLocale, string> = { fr: 'FR', en: 'EN', de: 'DE' };

interface ConfigTranslationFields {
  pageTitle: string;
  pageSubtitle: string;
  pageIntro: string;
  eventDate: string;
  eventLocation: string;
  ctaButtonText: string;
}

interface PassTranslationFields {
  name: string;
  label: string;
  targetAudience: string;
  description: string;
  highlights: string[];
  includes: string[];
  decisionPhrase: string;
  availabilityNote: string;
}

function parseTranslations<T>(raw: string | undefined): Partial<Record<'en' | 'de', Partial<T>>> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

interface TicketingPass {
  id: string;
  name: string;
  label: string;
  targetAudience: string;
  description: string;
  highlights: string; // JSON
  includes: string;   // JSON
  decisionPhrase: string;
  priceCents: number;
  oldPriceCents: number | null;
  currency: string;
  status: string;
  isActive: boolean;
  checkoutUrl: string;
  colorPrimary: string;
  colorSecondary: string;
  sortOrder: number;
  availabilityNote: string | null;
  translations: string; // JSON: Partial<Record<'en'|'de', Partial<PassTranslationFields>>>
}

interface TicketingConfig {
  isNewTicketingActive: boolean;
  ticketingProvider: string;
  pageTitle: string;
  pageSubtitle: string;
  pageIntro: string;
  eventDate: string;
  eventLocation: string;
  ctaButtonText: string;
  checkoutUrl: string;
  weezeventUrl: string;
  videoUrl: string;
  parkingLocations: string;
  translations: string; // JSON: Partial<Record<'en'|'de', Partial<ConfigTranslationFields>>>
  passes: TicketingPass[];
}

// ── Shared UI helpers ──────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg bg-white/[0.08] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1';
const sectionCls = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6';
const textareaCls =
  'w-full rounded-lg bg-white/[0.08] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition resize-none';

// ── Locale tabs + auto-translate row (reused for global settings + pass form) ──

function LocaleTranslateBar({
  activeLocale,
  onChangeLocale,
  hasSourceContent,
  translating,
  translateError,
  translateProvider,
  onTranslate,
}: {
  activeLocale: AdminLocale;
  onChangeLocale: (locale: AdminLocale) => void;
  hasSourceContent: (locale: AdminLocale) => boolean;
  translating: AdminLocale | null;
  translateError: string;
  translateProvider: string | null;
  onTranslate: (source: AdminLocale) => void;
}) {
  const sources = ADMIN_LOCALES.filter((l) => l !== activeLocale && hasSourceContent(l));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {ADMIN_LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => onChangeLocale(locale)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition ${
              activeLocale === locale
                ? 'bg-accent text-[#1a0606] shadow-lg shadow-accent/20'
                : 'border border-white/10 bg-white/[0.03] text-white/60 hover:border-accent/30 hover:text-white'
            }`}
          >
            {ADMIN_LOCALE_LABELS[locale]}
          </button>
        ))}
      </div>
      {activeLocale !== 'fr' && sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/20 bg-accent/[0.05] px-3 py-2.5">
          <svg className="h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/70">
            Traduire vers {ADMIN_LOCALE_LABELS[activeLocale]} depuis :
          </span>
          {sources.map((l) => {
            const isLoading = translating === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => onTranslate(l)}
                disabled={!!translating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-[0.7rem] font-semibold text-accent transition hover:bg-accent/25 disabled:cursor-wait disabled:opacity-50"
              >
                {isLoading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent/40 border-t-accent" /> : null}
                {ADMIN_LOCALE_LABELS[l]}
              </button>
            );
          })}
          {translateProvider && <span className="ml-auto text-[0.65rem] text-white/40">✓ via {translateProvider}</span>}
          {translateError && <span className="ml-auto text-[0.65rem] text-red-300">⚠ {translateError}</span>}
        </div>
      )}
    </div>
  );
}

async function callTranslateApi(source: AdminLocale, target: AdminLocale, fields: Record<string, string>) {
  const cleaned = Object.fromEntries(Object.entries(fields).filter(([, v]) => v.trim() !== ''));
  if (Object.keys(cleaned).length === 0) {
    throw new Error(`La langue source (${ADMIN_LOCALE_LABELS[source]}) est vide.`);
  }
  const res = await fetch('/api/admin/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, target, fields: cleaned }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error || `HTTP ${res.status}`);
  }
  return (await res.json()) as { provider?: string; values?: Record<string, string> };
}

// ── Default pass template ──────────────────────────────────────────────────────

const DEFAULT_PASS = {
  name: '',
  label: '',
  targetAudience: '',
  description: '',
  highlights: '[]',
  includes: '[]',
  decisionPhrase: '',
  priceCents: 0,
  oldPriceCents: null as number | null,
  currency: 'EUR',
  status: 'available',
  isActive: true,
  checkoutUrl: '',
  colorPrimary: '#1a4a2e',
  colorSecondary: '#2d7a4f',
  sortOrder: 0,
  availabilityNote: '',
};

const PASS_COLOR_PRESETS = [
  { label: 'Vert (Career)', primary: '#1a4a2e', secondary: '#2d7a4f' },
  { label: 'Bleu (Healthcare)', primary: '#1a2a4a', secondary: '#2d4f7a' },
  { label: 'Doré (Business)', primary: '#4a2e1a', secondary: '#8c5a1e' },
  { label: 'Violet', primary: '#2e1a4a', secondary: '#5a2d7a' },
  { label: 'Rouge', primary: '#4a1a1a', secondary: '#8c1a1a' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: '✅ Disponible' },
  { value: 'coming_soon', label: '⏳ Bientôt disponible' },
  { value: 'sold_out', label: '🔴 Sold out' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseJsonList(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function listToJson(items: string[]): string {
  return JSON.stringify(items.filter(Boolean));
}

function centsToEuros(cents: number): string {
  return (cents / 100).toFixed(2);
}

function eurosToCents(val: string): number {
  return Math.round(parseFloat(val.replace(',', '.')) * 100) || 0;
}

// ── Pass form (create/edit) ────────────────────────────────────────────────────

function PassForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: Partial<TicketingPass>;
  onSave: (data: Omit<TicketingPass, 'id'>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    ...DEFAULT_PASS,
    ...initial,
    highlights: initial.highlights ?? '[]',
    includes: initial.includes ?? '[]',
  });

  const [activeLocale, setActiveLocale] = useState<AdminLocale>('fr');
  const [translationsState, setTranslationsState] = useState<Partial<Record<'en' | 'de', Partial<PassTranslationFields>>>>(
    () => parseTranslations<PassTranslationFields>(initial.translations)
  );
  const [translating, setTranslating] = useState<AdminLocale | null>(null);
  const [translateError, setTranslateError] = useState('');
  const [translateProvider, setTranslateProvider] = useState<string | null>(null);

  // Edit lists as plain text (one item per line), per locale
  const [highlightsTextByLocale, setHighlightsTextByLocale] = useState<Record<AdminLocale, string>>({
    fr: parseJsonList(form.highlights).join('\n'),
    en: (translationsState.en?.highlights ?? []).join('\n'),
    de: (translationsState.de?.highlights ?? []).join('\n'),
  });
  const [includesTextByLocale, setIncludesTextByLocale] = useState<Record<AdminLocale, string>>({
    fr: parseJsonList(form.includes).join('\n'),
    en: (translationsState.en?.includes ?? []).join('\n'),
    de: (translationsState.de?.includes ?? []).join('\n'),
  });
  const [priceEuros, setPriceEuros] = useState(centsToEuros(form.priceCents));
  const [oldPriceEuros, setOldPriceEuros] = useState(
    form.oldPriceCents != null ? centsToEuros(form.oldPriceCents) : ''
  );

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  type SimpleField = 'name' | 'label' | 'targetAudience' | 'description' | 'decisionPhrase' | 'availabilityNote';

  function getSimple(field: SimpleField): string {
    if (activeLocale === 'fr') return (form[field] as string | null) ?? '';
    return (translationsState[activeLocale]?.[field] as string | undefined) ?? '';
  }

  function setSimple(field: SimpleField, value: string) {
    if (activeLocale === 'fr') {
      set(field, value);
      return;
    }
    const locale = activeLocale;
    setTranslationsState((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  }

  const highlightsText = highlightsTextByLocale[activeLocale];
  const includesText = includesTextByLocale[activeLocale];
  function setHighlightsText(value: string) {
    setHighlightsTextByLocale((prev) => ({ ...prev, [activeLocale]: value }));
  }
  function setIncludesText(value: string) {
    setIncludesTextByLocale((prev) => ({ ...prev, [activeLocale]: value }));
  }

  async function translatePassFromLocale(source: AdminLocale) {
    const target = activeLocale;
    if (source === target || target === 'fr') return;
    setTranslateError('');
    setTranslateProvider(null);
    setTranslating(source);
    try {
      const fields: Record<string, string> =
        source === 'fr'
          ? {
              name: form.name,
              label: form.label,
              targetAudience: form.targetAudience,
              description: form.description,
              decisionPhrase: form.decisionPhrase,
              availabilityNote: form.availabilityNote ?? '',
              highlights: highlightsTextByLocale.fr,
              includes: includesTextByLocale.fr,
            }
          : {
              name: translationsState[source]?.name ?? '',
              label: translationsState[source]?.label ?? '',
              targetAudience: translationsState[source]?.targetAudience ?? '',
              description: translationsState[source]?.description ?? '',
              decisionPhrase: translationsState[source]?.decisionPhrase ?? '',
              availabilityNote: translationsState[source]?.availabilityNote ?? '',
              highlights: highlightsTextByLocale[source],
              includes: includesTextByLocale[source],
            };
      const result = await callTranslateApi(source, target, fields);
      const values = result.values ?? {};
      setTranslationsState((prev) => ({
        ...prev,
        [target]: {
          ...prev[target],
          name: values.name ?? prev[target]?.name ?? '',
          label: values.label ?? prev[target]?.label ?? '',
          targetAudience: values.targetAudience ?? prev[target]?.targetAudience ?? '',
          description: values.description ?? prev[target]?.description ?? '',
          decisionPhrase: values.decisionPhrase ?? prev[target]?.decisionPhrase ?? '',
          availabilityNote: values.availabilityNote ?? prev[target]?.availabilityNote ?? '',
        },
      }));
      if (values.highlights) setHighlightsTextByLocale((prev) => ({ ...prev, [target]: values.highlights }));
      if (values.includes) setIncludesTextByLocale((prev) => ({ ...prev, [target]: values.includes }));
      setTranslateProvider(result.provider ?? null);
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : 'Échec de la traduction');
    } finally {
      setTranslating(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const translations: Partial<Record<'en' | 'de', PassTranslationFields>> = {};
    (['en', 'de'] as const).forEach((locale) => {
      translations[locale] = {
        name: translationsState[locale]?.name ?? '',
        label: translationsState[locale]?.label ?? '',
        targetAudience: translationsState[locale]?.targetAudience ?? '',
        description: translationsState[locale]?.description ?? '',
        decisionPhrase: translationsState[locale]?.decisionPhrase ?? '',
        availabilityNote: translationsState[locale]?.availabilityNote ?? '',
        highlights: highlightsTextByLocale[locale].split('\n').map((s) => s.trim()).filter(Boolean),
        includes: includesTextByLocale[locale].split('\n').map((s) => s.trim()).filter(Boolean),
      };
    });
    onSave({
      ...form,
      priceCents: eurosToCents(priceEuros),
      oldPriceCents: oldPriceEuros ? eurosToCents(oldPriceEuros) : null,
      highlights: listToJson(highlightsTextByLocale.fr.split('\n')),
      includes: listToJson(includesTextByLocale.fr.split('\n')),
      availabilityNote: form.availabilityNote || null,
      translations: JSON.stringify(translations),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <LocaleTranslateBar
        activeLocale={activeLocale}
        onChangeLocale={setActiveLocale}
        hasSourceContent={(locale) => (locale === 'fr' ? form.name.trim() !== '' : (translationsState[locale]?.name ?? '').trim() !== '')}
        translating={translating}
        translateError={translateError}
        translateProvider={translateProvider}
        onTranslate={translatePassFromLocale}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nom du ticket {activeLocale === 'fr' ? '*' : `(${ADMIN_LOCALE_LABELS[activeLocale]})`}</label>
          <input className={inputCls} value={getSimple('name')} onChange={(e) => setSimple('name', e.target.value)} required={activeLocale === 'fr'} placeholder="Career Launch Pass" />
        </div>
        <div>
          <label className={labelCls}>Label / Parcours {activeLocale === 'fr' ? '*' : `(${ADMIN_LOCALE_LABELS[activeLocale]})`}</label>
          <input className={inputCls} value={getSimple('label')} onChange={(e) => setSimple('label', e.target.value)} required={activeLocale === 'fr'} placeholder="Carrière & Employabilité" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Cible / Pour qui</label>
        <input className={inputCls} value={getSimple('targetAudience')} onChange={(e) => setSimple('targetAudience', e.target.value)} placeholder="Pour les étudiants, Azubis et jeunes diplômés." />
      </div>

      <div>
        <label className={labelCls}>Description courte</label>
        <textarea className={textareaCls} rows={3} value={getSimple('description')} onChange={(e) => setSimple('description', e.target.value)} placeholder="Courte description du parcours…" />
      </div>

      <div>
        <label className={labelCls}>Vous découvrirez notamment (1 élément par ligne)</label>
        <textarea className={textareaCls} rows={6} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} placeholder={"Les secteurs qui recrutent en Allemagne.\nComment construire un CV attractif.\n…"} />
      </div>

      <div>
        <label className={labelCls}>Inclus (1 élément par ligne)</label>
        <textarea className={textareaCls} rows={5} value={includesText} onChange={(e) => setIncludesText(e.target.value)} placeholder={"Accès à toutes les conférences\nAccès aux keynotes\nDeep Dive Carrière\n…"} />
      </div>

      <div>
        <label className={labelCls}>Phrase de décision</label>
        <textarea className={textareaCls} rows={2} value={getSimple('decisionPhrase')} onChange={(e) => setSimple('decisionPhrase', e.target.value)} placeholder="Choisissez ce billet si…" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Prix (€)</label>
          <input type="number" step="0.01" min="0" className={inputCls} value={priceEuros} onChange={(e) => setPriceEuros(e.target.value)} placeholder="49.00" />
        </div>
        <div>
          <label className={labelCls}>Ancien prix (€, optionnel)</label>
          <input type="number" step="0.01" min="0" className={inputCls} value={oldPriceEuros} onChange={(e) => setOldPriceEuros(e.target.value)} placeholder="79.00" />
        </div>
        <div>
          <label className={labelCls}>Devise</label>
          <input className={inputCls} value={form.currency} onChange={(e) => set('currency', e.target.value)} placeholder="EUR" maxLength={3} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Statut de disponibilité</label>
          <select
            className="w-full rounded-lg bg-[#190c0c] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Note de disponibilité (optionnel)</label>
          <input className={inputCls} value={getSimple('availabilityNote')} onChange={(e) => setSimple('availabilityNote', e.target.value)} placeholder="Places limitées !" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Lien de paiement / checkout URL</label>
        <input className={inputCls} value={form.checkoutUrl} onChange={(e) => set('checkoutUrl', e.target.value)} placeholder="https://tickets.levelupingermany.com/…" />
        <p className="mt-1 text-[11px] text-white/30">Laisser vide pour utiliser l'URL globale de la billetterie.</p>
      </div>

      <div>
        <label className={labelCls}>Couleurs de la carte</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {PASS_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => { set('colorPrimary', preset.primary); set('colorSecondary', preset.secondary); }}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/60 hover:border-white/30 hover:text-white transition"
            >
              <span className="h-3 w-3 rounded-full" style={{ background: preset.primary }} />
              {preset.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Couleur principale</label>
            <div className="flex gap-2">
              <input type="color" value={form.colorPrimary} onChange={(e) => set('colorPrimary', e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent p-0.5" />
              <input className={inputCls} value={form.colorPrimary} onChange={(e) => set('colorPrimary', e.target.value)} placeholder="#1a4a2e" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Couleur secondaire</label>
            <div className="flex gap-2">
              <input type="color" value={form.colorSecondary} onChange={(e) => set('colorSecondary', e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent p-0.5" />
              <input className={inputCls} value={form.colorSecondary} onChange={(e) => set('colorSecondary', e.target.value)} placeholder="#2d7a4f" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Ordre d'affichage</label>
          <input type="number" className={inputCls} value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => set('isActive', !form.isActive)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.isActive ? 'bg-[#2d7a4f]' : 'bg-white/15'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-white/70">Ticket visible</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#2d7a4f] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#3a9960] disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer le ticket'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/60 hover:text-white transition"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

// ── Main admin component ───────────────────────────────────────────────────────

const DEFAULT_CONFIG: TicketingConfig = {
  isNewTicketingActive: false,
  ticketingProvider: 'tailor',
  pageTitle: 'Level Up in Germany 2026',
  pageSubtitle: 'Une journée pour accélérer votre avenir en Allemagne.',
  pageIntro: '',
  eventDate: '17 octobre 2026',
  eventLocation: 'Francfort',
  ctaButtonText: 'Choisir mon billet',
  checkoutUrl: 'https://tickets.levelupingermany.com/checkout/view-event/id/8530693/chk/dedb8063676704001e57efe8d44b4302/?modal_widget=true&widget=true',
  weezeventUrl: 'https://www.weezevent.com/widget_billeterie.php?id_evenement=2098465&widget_key=E2098465&locale=de_DE&color_primary=red&code=red',
  videoUrl: '',
  parkingLocations: '[]',
  translations: '{}',
  passes: [],
};

export default function TicketingAdmin() {
  const [config, setConfig] = useState<TicketingConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  const [activeConfigLocale, setActiveConfigLocale] = useState<AdminLocale>('fr');
  const [configTranslating, setConfigTranslating] = useState<AdminLocale | null>(null);
  const [configTranslateError, setConfigTranslateError] = useState('');
  const [configTranslateProvider, setConfigTranslateProvider] = useState<string | null>(null);

  // Which pass is being edited (id) or 'new' or null
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const configTranslationsParsed = parseTranslations<ConfigTranslationFields>(config.translations);

  function getConfigField(field: keyof ConfigTranslationFields): string {
    if (activeConfigLocale === 'fr') return config[field];
    return configTranslationsParsed[activeConfigLocale]?.[field] ?? '';
  }

  function setConfigField(field: keyof ConfigTranslationFields, value: string) {
    if (activeConfigLocale === 'fr') {
      setConfig((c) => ({ ...c, [field]: value }));
      return;
    }
    const locale = activeConfigLocale;
    setConfig((c) => {
      const parsed = parseTranslations<ConfigTranslationFields>(c.translations);
      const next = { ...parsed, [locale]: { ...parsed[locale], [field]: value } };
      return { ...c, translations: JSON.stringify(next) };
    });
  }

  async function translateConfigFromLocale(source: AdminLocale) {
    const target = activeConfigLocale;
    if (source === target || target === 'fr') return;
    setConfigTranslateError('');
    setConfigTranslateProvider(null);
    setConfigTranslating(source);
    try {
      const parsed = parseTranslations<ConfigTranslationFields>(config.translations);
      const fields: Record<string, string> =
        source === 'fr'
          ? {
              pageTitle: config.pageTitle,
              pageSubtitle: config.pageSubtitle,
              pageIntro: config.pageIntro,
              eventDate: config.eventDate,
              eventLocation: config.eventLocation,
              ctaButtonText: config.ctaButtonText,
            }
          : {
              pageTitle: parsed[source]?.pageTitle ?? '',
              pageSubtitle: parsed[source]?.pageSubtitle ?? '',
              pageIntro: parsed[source]?.pageIntro ?? '',
              eventDate: parsed[source]?.eventDate ?? '',
              eventLocation: parsed[source]?.eventLocation ?? '',
              ctaButtonText: parsed[source]?.ctaButtonText ?? '',
            };
      const result = await callTranslateApi(source, target, fields);
      const values = result.values ?? {};
      setConfig((c) => {
        const p = parseTranslations<ConfigTranslationFields>(c.translations);
        const next = {
          ...p,
          [target]: {
            ...p[target],
            pageTitle: values.pageTitle ?? p[target]?.pageTitle ?? '',
            pageSubtitle: values.pageSubtitle ?? p[target]?.pageSubtitle ?? '',
            pageIntro: values.pageIntro ?? p[target]?.pageIntro ?? '',
            eventDate: values.eventDate ?? p[target]?.eventDate ?? '',
            eventLocation: values.eventLocation ?? p[target]?.eventLocation ?? '',
            ctaButtonText: values.ctaButtonText ?? p[target]?.ctaButtonText ?? '',
          },
        };
        return { ...c, translations: JSON.stringify(next) };
      });
      setConfigTranslateProvider(result.provider ?? null);
    } catch (err) {
      setConfigTranslateError(err instanceof Error ? err.message : 'Échec de la traduction');
    } finally {
      setConfigTranslating(null);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ticketing');
      if (res.ok) {
        const data = await res.json();
        setConfig({ ...DEFAULT_CONFIG, ...data, passes: data.passes ?? [] });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveGlobal() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ticketing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        adminNotify.success('Configuration enregistrée !');
      } else {
        adminNotify.error('Erreur lors de la sauvegarde.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function savePass(data: Omit<TicketingPass, 'id'>) {
    setPassSaving(true);
    try {
      const isNew = editing === 'new';
      const url = isNew
        ? '/api/admin/ticketing/passes'
        : `/api/admin/ticketing/passes/${editing}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        adminNotify.success(isNew ? 'Ticket créé !' : 'Ticket mis à jour !');
        setEditing(null);
        await load();
      } else {
        adminNotify.error('Erreur lors de la sauvegarde du ticket.');
      }
    } finally {
      setPassSaving(false);
    }
  }

  async function deletePass(id: string) {
    try {
      const res = await fetch(`/api/admin/ticketing/passes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        adminNotify.success('Ticket supprimé.');
        setConfirmDelete(null);
        await load();
      } else {
        adminNotify.error('Erreur lors de la suppression.');
      }
    } catch {
      adminNotify.error('Erreur réseau.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-accent" />
      </div>
    );
  }

  const editingPass = editing && editing !== 'new'
    ? config.passes.find((p) => p.id === editing)
    : undefined;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">Billetterie</p>
        <h1 className="text-2xl font-bold text-white">Billetterie 2026</h1>
        <p className="mt-1 text-sm text-white/35">Gérez la nouvelle expérience de billetterie Level Up in Germany.</p>
      </div>

      {/* ── Toggle activation ────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">Nouvelle billetterie 2026</h2>
            <p className="mt-1 text-sm text-white/45">
              Lorsque cette option est activée, la nouvelle page de billetterie avec les parcours
              Career, Healthcare et Business est affichée. Lorsqu'elle est désactivée, l'ancienne
              billetterie reste visible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfig((c) => ({ ...c, isNewTicketingActive: !c.isNewTicketingActive }))}
            className={`relative mt-1 h-7 w-14 shrink-0 rounded-full transition-colors ${config.isNewTicketingActive ? 'bg-[#2d7a4f]' : 'bg-white/15'}`}
            role="switch"
            aria-checked={config.isNewTicketingActive}
          >
            <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${config.isNewTicketingActive ? 'translate-x-7' : ''}`} />
          </button>
        </div>
        <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.isNewTicketingActive ? 'bg-[#1a4a2e] text-[#4ade80]' : 'bg-white/5 text-white/40'}`}>
          {config.isNewTicketingActive ? '✅ Nouvelle billetterie ACTIVE' : '⏸ Ancienne billetterie affichée'}
        </p>
      </div>

      {/* ── Global settings ──────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h2 className="mb-5 text-base font-semibold text-white">Paramètres globaux de la page</h2>
        <div className="mb-5">
          <LocaleTranslateBar
            activeLocale={activeConfigLocale}
            onChangeLocale={setActiveConfigLocale}
            hasSourceContent={(locale) => (locale === 'fr' ? config.pageTitle.trim() !== '' : (configTranslationsParsed[locale]?.pageTitle ?? '').trim() !== '')}
            translating={configTranslating}
            translateError={configTranslateError}
            translateProvider={configTranslateProvider}
            onTranslate={translateConfigFromLocale}
          />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Titre principal {activeConfigLocale !== 'fr' && `(${ADMIN_LOCALE_LABELS[activeConfigLocale]})`}</label>
              <input className={inputCls} value={getConfigField('pageTitle')} onChange={(e) => setConfigField('pageTitle', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Sous-titre {activeConfigLocale !== 'fr' && `(${ADMIN_LOCALE_LABELS[activeConfigLocale]})`}</label>
              <input className={inputCls} value={getConfigField('pageSubtitle')} onChange={(e) => setConfigField('pageSubtitle', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Texte d'introduction {activeConfigLocale !== 'fr' && `(${ADMIN_LOCALE_LABELS[activeConfigLocale]})`}</label>
            <textarea
              className={textareaCls}
              rows={4}
              value={getConfigField('pageIntro')}
              onChange={(e) => setConfigField('pageIntro', e.target.value)}
              placeholder="Que vous soyez étudiant, jeune professionnel…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Date de l'événement {activeConfigLocale !== 'fr' && `(${ADMIN_LOCALE_LABELS[activeConfigLocale]})`}</label>
              <input className={inputCls} value={getConfigField('eventDate')} onChange={(e) => setConfigField('eventDate', e.target.value)} placeholder="17 octobre 2026" />
            </div>
            <div>
              <label className={labelCls}>Lieu {activeConfigLocale !== 'fr' && `(${ADMIN_LOCALE_LABELS[activeConfigLocale]})`}</label>
              <input className={inputCls} value={getConfigField('eventLocation')} onChange={(e) => setConfigField('eventLocation', e.target.value)} placeholder="Francfort" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Texte du bouton principal {activeConfigLocale !== 'fr' && `(${ADMIN_LOCALE_LABELS[activeConfigLocale]})`}</label>
              <input className={inputCls} value={getConfigField('ctaButtonText')} onChange={(e) => setConfigField('ctaButtonText', e.target.value)} placeholder="Choisir mon billet" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Fournisseur de billetterie (pop-up)</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: 'tailor', title: 'Tailor Ticket', desc: 'Widget Tailor Ticket actuel' },
                { value: 'weezevent', title: 'Weezevent', desc: 'Widget Weezevent' },
              ].map((opt) => {
                const active = config.ticketingProvider === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, ticketingProvider: opt.value }))}
                    className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-accent bg-accent/10'
                        : 'border-white/10 bg-white/[0.04] hover:border-white/25'
                    }`}
                    role="radio"
                    aria-checked={active}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span
                        className={`h-3.5 w-3.5 rounded-full border-2 ${
                          active ? 'border-accent bg-accent' : 'border-white/30'
                        }`}
                      />
                      {opt.title}
                    </span>
                    <span className="text-[11px] text-white/40">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-white/30">
              Le pop-up « Acheter mon billet » ouvrira le widget du fournisseur sélectionné.
            </p>
          </div>

          <div>
            <label className={labelCls}>URL Tailor Ticket</label>
            <input className={inputCls} value={config.checkoutUrl} onChange={(e) => setConfig((c) => ({ ...c, checkoutUrl: e.target.value }))} placeholder="https://tickets.levelupingermany.com/…" />
            <p className="mt-1 text-[11px] text-white/30">Widget affiché dans le pop-up quand « Tailor Ticket » est sélectionné.</p>
          </div>

          <div>
            <label className={labelCls}>URL Weezevent</label>
            <input className={inputCls} value={config.weezeventUrl} onChange={(e) => setConfig((c) => ({ ...c, weezeventUrl: e.target.value }))} placeholder="https://www.weezevent.com/widget_billeterie.php?id_evenement=…" />
            <p className="mt-1 text-[11px] text-white/30">Widget affiché dans le pop-up quand « Weezevent » est sélectionné.</p>
          </div>

          <div>
            <label className={labelCls}>Lien vidéo YouTube (bouton Play)</label>
            <input className={inputCls} value={config.videoUrl} onChange={(e) => setConfig((c) => ({ ...c, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/watch?v=…" />
            <p className="mt-1 text-[11px] text-white/30">Vidéo ouverte par le bouton Play animé sous l'image de la billetterie. Laissez vide pour masquer le bouton.</p>
          </div>

          <div className="border-t border-white/10 pt-5">
            <h3 className="text-sm font-semibold text-white">Accès et parkings</h3>
            <p className="mt-1 text-xs text-white/40">Les photos et intervenants viennent automatiquement de l'édition 2026 dans « Événements ».</p>
          </div>

          <div>
            <label className={labelCls}>Parkings (JSON)</label>
            <textarea
              className={textareaCls}
              rows={6}
              value={config.parkingLocations}
              onChange={(e) => setConfig((c) => ({ ...c, parkingLocations: e.target.value }))}
              placeholder={'[\n  { "name": "Parking principal", "address": "Adresse complète, Frankfurt", "note": "5 min à pied" }\n]'}
            />
            <p className="mt-1 text-[11px] text-white/30">Renseignez le nom, l'adresse complète et une note facultative. Une carte est créée pour chaque parking.</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={saveGlobal}
            disabled={saving}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#1a0606] shadow transition hover:bg-accent-light disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer les paramètres globaux'}
          </button>
        </div>
      </div>

      {/* ── Tickets ──────────────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Tickets ({config.passes.length})
          </h2>
          {editing !== 'new' && (
            <button
              onClick={() => setEditing('new')}
              className="flex items-center gap-1.5 rounded-xl bg-[#1a4a2e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d7a4f]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un ticket
            </button>
          )}
        </div>

        {/* New pass form */}
        {editing === 'new' && (
          <div className="mb-6 rounded-xl border border-[#2d7a4f]/30 bg-[#1a4a2e]/10 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Nouveau ticket</h3>
            <PassForm
              initial={{}}
              onSave={savePass}
              onCancel={() => setEditing(null)}
              saving={passSaving}
            />
          </div>
        )}

        {/* Pass list */}
        <div className="space-y-4">
          {config.passes.length === 0 && editing !== 'new' && (
            <p className="py-8 text-center text-sm text-white/30">
              Aucun ticket configuré. Cliquez sur « Ajouter un ticket » pour commencer.
            </p>
          )}

          {config.passes.map((pass) => (
            <div key={pass.id} className="rounded-xl border border-white/8 bg-white/[0.02]">
              {editing === pass.id ? (
                <div className="p-5">
                  <h3 className="mb-4 text-sm font-semibold text-white">Modifier : {pass.name}</h3>
                  <PassForm
                    initial={pass}
                    onSave={savePass}
                    onCancel={() => setEditing(null)}
                    saving={passSaving}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  {/* Color swatch */}
                  <div
                    className="h-10 w-10 shrink-0 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${pass.colorPrimary}, ${pass.colorSecondary})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{pass.name}</span>
                      <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/45">{pass.label}</span>
                      {!pass.isActive && (
                        <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-[10px] text-red-400">Inactif</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-white/40">
                      {pass.priceCents > 0
                        ? `${(pass.priceCents / 100).toFixed(2)} ${pass.currency}`
                        : 'Prix non défini'}
                      {' · '}
                      {STATUS_OPTIONS.find((s) => s.value === pass.status)?.label ?? pass.status}
                      {' · Ordre : '}{pass.sortOrder}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setEditing(pass.id)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white transition"
                    >
                      Modifier
                    </button>
                    {confirmDelete === pass.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deletePass(pass.id)}
                          className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-white/40 hover:text-white transition"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(pass.id)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-red-400/70 hover:text-red-400 transition"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Seed default passes */}
      {config.passes.length === 0 && (
        <div className={sectionCls}>
          <h2 className="mb-2 text-sm font-semibold text-white">Démarrage rapide</h2>
          <p className="mb-4 text-sm text-white/45">Créez les 3 tickets par défaut de l'édition 2026 en un clic.</p>
          <button
            onClick={async () => {
              const defaultPasses = [
                {
                  name: 'Career Launch Pass',
                  label: 'Carrière & Employabilité',
                  targetAudience: 'Pour les étudiants, Azubis et jeunes diplômés.',
                  description: "Vous souhaitez trouver un stage, un Werkstudentenjob ou votre premier emploi en Allemagne ? Ce parcours est conçu pour vous aider à passer d'une recherche confuse à une stratégie claire.",
                  highlights: JSON.stringify([
                    "Les secteurs qui recrutent réellement en Allemagne.",
                    "Comment construire un CV et un profil LinkedIn qui attirent les recruteurs.",
                    "Les erreurs qui empêchent d'obtenir un entretien.",
                    "Les compétences les plus recherchées en 2026.",
                    "Les stratégies pour accélérer son évolution professionnelle.",
                    "Une session interactive avec des experts RH et des professionnels expérimentés.",
                  ]),
                  includes: JSON.stringify([
                    "Accès à toutes les conférences",
                    "Accès aux keynotes",
                    "Accès à l'espace networking",
                    "Accès aux stands et partenaires",
                    "Deep Dive Carrière & Employabilité",
                    "Possibilité d'échanger avec les intervenants",
                  ]),
                  decisionPhrase: "Choisissez ce billet si votre priorité est de mieux vous orienter, décrocher de meilleures opportunités et construire une trajectoire professionnelle solide en Allemagne.",
                  priceCents: 0,
                  oldPriceCents: null,
                  currency: 'EUR',
                  status: 'coming_soon',
                  isActive: true,
                  checkoutUrl: '',
                  colorPrimary: '#1a4a2e',
                  colorSecondary: '#2d7a4f',
                  sortOrder: 0,
                  availabilityNote: null,
                },
                {
                  name: 'Healthcare Excellence Pass',
                  label: 'Santé, Pflege & Leadership',
                  targetAudience: 'Pour les étudiants, professionnels et porteurs de projets dans le secteur de la santé.',
                  description: "Vous souhaitez évoluer dans les métiers de la santé, découvrir les possibilités offertes par le système allemand ou envisager des fonctions de management ? Ce parcours vous donne une vision concrète des opportunités du secteur healthcare.",
                  highlights: JSON.stringify([
                    "Les différentes possibilités d'évolution dans les métiers du Pflege.",
                    "Les spécialisations les plus recherchées.",
                    "Les perspectives salariales.",
                    "Comment évoluer vers des postes de management.",
                    "Comment créer son propre Pflegedienst.",
                    "Les erreurs à éviter en début de carrière.",
                    "Les opportunités de leadership dans le secteur santé.",
                  ]),
                  includes: JSON.stringify([
                    "Accès à toutes les conférences",
                    "Accès aux keynotes",
                    "Accès à l'espace networking",
                    "Accès aux stands et partenaires",
                    "Deep Dive Santé & Leadership",
                    "Possibilité d'échanger avec des professionnels du secteur",
                  ]),
                  decisionPhrase: "Choisissez ce billet si vous travaillez dans la santé, le Pflege ou le care business, ou si vous voulez comprendre comment évoluer dans ce secteur en Allemagne.",
                  priceCents: 0,
                  oldPriceCents: null,
                  currency: 'EUR',
                  status: 'coming_soon',
                  isActive: true,
                  checkoutUrl: '',
                  colorPrimary: '#1a2a4a',
                  colorSecondary: '#2d4f7a',
                  sortOrder: 1,
                  availabilityNote: null,
                },
                {
                  name: 'Business Growth Pass',
                  label: 'Business, Investissement & Croissance',
                  targetAudience: 'Pour les entrepreneurs, porteurs de projets, freelances et futurs investisseurs.',
                  description: "Vous souhaitez créer une entreprise, investir dans l'immobilier ou construire de nouvelles sources de revenus ? Ce parcours vous aide à comprendre les bases, les erreurs à éviter et les opportunités concrètes pour développer un business en Allemagne.",
                  highlights: JSON.stringify([
                    "Les fondamentaux de la création d'entreprise en Allemagne.",
                    "Les premières étapes pour développer une activité rentable.",
                    "Les opportunités dans l'immobilier.",
                    "Les bases de l'e-commerce et des modèles business scalables.",
                    "Les stratégies de croissance d'un business.",
                    "Les erreurs qui coûtent le plus cher aux entrepreneurs.",
                    "Les clés pour construire un patrimoine durable.",
                  ]),
                  includes: JSON.stringify([
                    "Accès à toutes les conférences",
                    "Accès aux keynotes",
                    "Accès à l'espace networking",
                    "Accès aux stands et partenaires",
                    "Deep Dive Business & Investissement",
                    "Possibilité d'échanger avec entrepreneurs, experts et partenaires",
                  ]),
                  decisionPhrase: "Choisissez ce billet si votre priorité est de lancer, structurer ou développer un projet rentable en Allemagne.",
                  priceCents: 0,
                  oldPriceCents: null,
                  currency: 'EUR',
                  status: 'coming_soon',
                  isActive: true,
                  checkoutUrl: '',
                  colorPrimary: '#4a2e1a',
                  colorSecondary: '#8c5a1e',
                  sortOrder: 2,
                  availabilityNote: null,
                },
              ];

              // Ensure config exists first
              await fetch('/api/admin/ticketing', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
              });

              for (const pass of defaultPasses) {
                await fetch('/api/admin/ticketing/passes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(pass),
                });
              }
              adminNotify.success('3 tickets créés avec succès !');
              await load();
            }}
            className="rounded-xl bg-[#1a4a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d7a4f]"
          >
            ✨ Créer les 3 tickets par défaut
          </button>
        </div>
      )}
    </div>
  );
}
