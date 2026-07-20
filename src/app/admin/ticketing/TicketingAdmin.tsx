'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminNotify } from '@/app/admin/components/AdminToaster';

// ── Types ──────────────────────────────────────────────────────────────────────

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
  passes: TicketingPass[];
}

// ── Shared UI helpers ──────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg bg-white/[0.08] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1';
const sectionCls = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6';
const textareaCls =
  'w-full rounded-lg bg-white/[0.08] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition resize-none';

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

  // Edit lists as plain text (one item per line)
  const [highlightsText, setHighlightsText] = useState(
    parseJsonList(form.highlights).join('\n')
  );
  const [includesText, setIncludesText] = useState(
    parseJsonList(form.includes).join('\n')
  );
  const [priceEuros, setPriceEuros] = useState(centsToEuros(form.priceCents));
  const [oldPriceEuros, setOldPriceEuros] = useState(
    form.oldPriceCents != null ? centsToEuros(form.oldPriceCents) : ''
  );

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      priceCents: eurosToCents(priceEuros),
      oldPriceCents: oldPriceEuros ? eurosToCents(oldPriceEuros) : null,
      highlights: listToJson(highlightsText.split('\n')),
      includes: listToJson(includesText.split('\n')),
      availabilityNote: form.availabilityNote || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nom du ticket *</label>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Career Launch Pass" />
        </div>
        <div>
          <label className={labelCls}>Label / Parcours *</label>
          <input className={inputCls} value={form.label} onChange={(e) => set('label', e.target.value)} required placeholder="Carrière & Employabilité" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Cible / Pour qui</label>
        <input className={inputCls} value={form.targetAudience} onChange={(e) => set('targetAudience', e.target.value)} placeholder="Pour les étudiants, Azubis et jeunes diplômés." />
      </div>

      <div>
        <label className={labelCls}>Description courte</label>
        <textarea className={textareaCls} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Courte description du parcours…" />
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
        <textarea className={textareaCls} rows={2} value={form.decisionPhrase} onChange={(e) => set('decisionPhrase', e.target.value)} placeholder="Choisissez ce billet si…" />
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
          <input className={inputCls} value={form.availabilityNote ?? ''} onChange={(e) => set('availabilityNote', e.target.value)} placeholder="Places limitées !" />
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
  passes: [],
};

export default function TicketingAdmin() {
  const [config, setConfig] = useState<TicketingConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  // Which pass is being edited (id) or 'new' or null
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Titre principal</label>
              <input className={inputCls} value={config.pageTitle} onChange={(e) => setConfig((c) => ({ ...c, pageTitle: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Sous-titre</label>
              <input className={inputCls} value={config.pageSubtitle} onChange={(e) => setConfig((c) => ({ ...c, pageSubtitle: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Texte d'introduction</label>
            <textarea
              className={textareaCls}
              rows={4}
              value={config.pageIntro}
              onChange={(e) => setConfig((c) => ({ ...c, pageIntro: e.target.value }))}
              placeholder="Que vous soyez étudiant, jeune professionnel…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Date de l'événement</label>
              <input className={inputCls} value={config.eventDate} onChange={(e) => setConfig((c) => ({ ...c, eventDate: e.target.value }))} placeholder="17 octobre 2026" />
            </div>
            <div>
              <label className={labelCls}>Lieu</label>
              <input className={inputCls} value={config.eventLocation} onChange={(e) => setConfig((c) => ({ ...c, eventLocation: e.target.value }))} placeholder="Francfort" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Texte du bouton principal</label>
              <input className={inputCls} value={config.ctaButtonText} onChange={(e) => setConfig((c) => ({ ...c, ctaButtonText: e.target.value }))} placeholder="Choisir mon billet" />
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
