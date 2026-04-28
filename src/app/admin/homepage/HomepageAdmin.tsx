'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import SiteConfigAdmin from './SiteConfigAdmin';

// ── Constants ──────────────────────────────────────────────────────────────────

const SITE_ROUTES = [
  { label: 'Accueil', value: '/' },
  { label: 'Événements', value: '/events' },
  { label: 'Conférence annuelle', value: '/annual-conference' },
  { label: 'Workshops', value: '/programme/workshops' },
  { label: 'Mentoring', value: '/programme/mentoring' },
  { label: 'Partenaires', value: '/partners' },
  { label: 'Contact', value: '/contact' },
  { label: 'Newsletter', value: '/newsletter' },
  { label: 'Devenir membre', value: '/membership' },
  { label: 'Formulaire adhesion membre', value: '/membership#membership-form' },
  { label: 'Blog & Impact', value: '/blog-impact' },
  { label: 'Sponsor & Dons', value: '/sponsor-donate' },
  { label: 'Qui sommes-nous', value: '/who-we-are' },
  { label: 'Galerie communauté', value: '/community' },
];

const COLOR_VARIANTS = [
  { value: 'red',           label: 'Rouge',          preview: 'bg-[#8c1a1a]' },
  { value: 'yellow',        label: 'Jaune',          preview: 'bg-[#e98c0b]' },
  { value: 'white',         label: 'Blanc (verre)',  preview: 'bg-white border border-gray-300' },
  { value: 'black',         label: 'Noir',           preview: 'bg-[#0f0606]' },
  { value: 'outline-white', label: 'Contour blanc',  preview: 'border-2 border-white bg-transparent' },
  { value: 'outline-red',   label: 'Contour rouge',  preview: 'border-2 border-[#8c1a1a] bg-transparent' },
];

const HERO_SLOT_META: Record<string, { position: string }> = {
  hero_1: { position: 'Bouton 1 — Principal' },
  hero_2: { position: 'Bouton 2 — Secondaire' },
  hero_3: { position: 'Bouton 3 — Tertiaire' },
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface HeroSlide {
  id: string;
  imageUrl: string;
  isMain: boolean;
  titleFr: string | null;
  titleDe: string | null;
  titleEn: string | null;
  subtitleFr: string | null;
  subtitleDe: string | null;
  subtitleEn: string | null;
  altTextFr: string | null;
  altTextDe: string | null;
  altTextEn: string | null;
  linkType: string | null;
  linkTarget: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface HomeButton {
  id: string;
  slot: string;
  labelFr: string;
  labelDe: string;
  labelEn: string;
  linkType: string;
  linkTarget: string;
  colorVariant: string;
  displayOrder: number;
  isActive: boolean;
  isPrimary: boolean;
  openInNewTab: boolean;
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg bg-white/[0.08] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition';
const selectCls =
  'w-full rounded-lg bg-[#190c0c] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1';
const sectionCls = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5';
const optionStyle = { backgroundColor: '#ffffff', color: '#0f172a' };

// ── Helpers ────────────────────────────────────────────────────────────────────

function buttonVariantPreviewClass(variant: string): string {
  switch (variant) {
    case 'red':           return 'bg-[#8c1a1a] text-white border border-[#8c1a1a]';
    case 'yellow':        return 'bg-[#e98c0b] text-white border border-[#e98c0b]';
    case 'white':         return 'bg-white text-slate-900 border border-white';
    case 'black':         return 'bg-[#0f0606] text-white border border-[#0f0606]';
    case 'outline-white': return 'bg-transparent text-white border border-white';
    case 'outline-red':   return 'bg-transparent text-[#8c1a1a] border border-[#8c1a1a]';
    default:              return 'bg-[#8c1a1a] text-white border border-[#8c1a1a]';
  }
}

function Toggle({
  checked,
  onChange,
  label,
  color = 'bg-emerald-500',
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors ${checked ? color : 'bg-white/10'}`}
    >
      <span
        aria-hidden
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function LangBlock({
  labelFr, labelDe, labelEn,
  frValue, deValue, enValue,
  onFr, onDe, onEn,
  rows = 1,
}: {
  labelFr: string; labelDe: string; labelEn: string;
  frValue: string; deValue: string; enValue: string;
  onFr: (v: string) => void; onDe: (v: string) => void; onEn: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { lbl: labelFr, val: frValue, onChange: onFr, flag: '🇫🇷' },
        { lbl: labelDe, val: deValue, onChange: onDe, flag: '🇩🇪' },
        { lbl: labelEn, val: enValue, onChange: onEn, flag: '🇬🇧' },
      ].map(({ lbl, val, onChange, flag }) => (
        <div key={flag}>
          <label className={labelCls}>{flag} {lbl}</label>
          {rows > 1 ? (
            <textarea
              value={val}
              onChange={(e) => onChange(e.target.value)}
              rows={rows}
              className={`${inputCls} resize-none`}
            />
          ) : (
            <input
              type="text"
              value={val}
              onChange={(e) => onChange(e.target.value)}
              className={inputCls}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function LinkField({
  linkType, linkTarget, onType, onTarget,
}: {
  linkType: string; linkTarget: string;
  onType: (v: string) => void; onTarget: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className={labelCls}>Type de lien</label>
        <select value={linkType} onChange={(e) => onType(e.target.value)} className={selectCls}>
          <option value="internal" style={optionStyle}>Interne (page du site)</option>
          <option value="external" style={optionStyle}>Externe (URL complete)</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Destination</label>
        {linkType === 'internal' ? (
          <select value={linkTarget} onChange={(e) => onTarget(e.target.value)} className={selectCls}>
            <option value="" style={optionStyle}>Choisir une page</option>
            {SITE_ROUTES.map((r) => (
              <option key={r.value} value={r.value} style={optionStyle}>{r.label} ({r.value})</option>
            ))}
          </select>
        ) : (
          <input
            type="url"
            value={linkTarget}
            onChange={(e) => onTarget(e.target.value)}
            placeholder="https://…  (AWS S3, billetterie, formulaire…)"
            className={inputCls}
          />
        )}
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={`${labelCls} mb-2`}>Couleur du bouton</label>
      <div className="flex flex-wrap gap-2">
        {COLOR_VARIANTS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              value === c.value
                ? 'border-accent/60 bg-accent/15 text-white'
                : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/80'
            }`}
          >
            <span className={`h-4 w-4 rounded-full shrink-0 ${c.preview}`} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Hero Images Admin
// ═══════════════════════════════════════════════════════════════════════════════

function HeroAdmin() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Omit<HeroSlide, 'id'>>({
    imageUrl: '', isMain: false,
    titleFr: '', titleDe: '', titleEn: '',
    subtitleFr: '', subtitleDe: '', subtitleEn: '',
    altTextFr: '', altTextDe: '', altTextEn: '',
    linkType: 'internal', linkTarget: '',
    isActive: true, sortOrder: 0,
  });
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero');
      const data = await res.json();
      setSlides(Array.isArray(data) ? data : []);
    } catch { setSlides([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function flash(type: 'ok' | 'err', text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  }

  function openEdit(s: HeroSlide) {
    const { id, ...rest } = s;
    setForm({
      ...rest,
      titleFr: rest.titleFr ?? '', titleDe: rest.titleDe ?? '', titleEn: rest.titleEn ?? '',
      subtitleFr: rest.subtitleFr ?? '', subtitleDe: rest.subtitleDe ?? '', subtitleEn: rest.subtitleEn ?? '',
      altTextFr: rest.altTextFr ?? '', altTextDe: rest.altTextDe ?? '', altTextEn: rest.altTextEn ?? '',
      linkType: rest.linkType ?? 'internal', linkTarget: rest.linkTarget ?? '',
    });
    setEditId(id);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function saveSlide() {
    if (!form.imageUrl.trim()) { flash('err', "L'URL de l'image est requise."); return; }
    setSaving(true);
    try {
      const url = editId === 'new' ? '/api/admin/hero' : `/api/admin/hero/${editId}`;
      const method = editId === 'new' ? 'POST' : 'PATCH';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      flash('ok', editId === 'new' ? 'Image ajoutée !' : 'Modifications enregistrées !');
      setEditId(null);
      load();
    } catch { flash('err', 'Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  }

  async function deleteSlide(id: string) {
    if (!confirm('Supprimer cette image du carousel ?')) return;
    await fetch(`/api/admin/hero/${id}`, { method: 'DELETE' });
    flash('ok', 'Image supprimée.'); load();
  }

  async function setMain(id: string) {
    await fetch(`/api/admin/hero/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isMain: true }) });
    flash('ok', 'Image principale définie.'); load();
  }

  async function toggleActive(s: HeroSlide) {
    await fetch(`/api/admin/hero/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.isActive }) });
    load();
  }

  const set = (key: keyof typeof form) => (v: string | boolean | number) =>
    setForm((f) => ({ ...f, [key]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Images du carousel Hero</h2>
          <p className="text-xs text-white/40 mt-0.5">{slides.length} image{slides.length !== 1 ? 's' : ''}</p>
        </div>
        {editId !== 'new' && (
          <button onClick={() => { setForm({ imageUrl: '', isMain: false, titleFr: '', titleDe: '', titleEn: '', subtitleFr: '', subtitleDe: '', subtitleEn: '', altTextFr: '', altTextDe: '', altTextEn: '', linkType: 'internal', linkTarget: '', isActive: true, sortOrder: 0 }); setEditId('new'); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent/80 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Ajouter une image
          </button>
        )}
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${msg.type === 'ok' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {editId !== null && (
        <div ref={formRef} className={`${sectionCls} border-accent/30 space-y-5`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-accent">{editId === 'new' ? '+ Nouvelle image' : "Modifier l'image"}</p>
            <button onClick={() => setEditId(null)} className="text-white/40 hover:text-white/80 text-xs">Annuler</button>
          </div>

          <div>
            <label className={labelCls}>URL de l'image *</label>
            <input type="text" value={form.imageUrl} onChange={(e) => set('imageUrl')(e.target.value)}
              placeholder="/hero-pic/photo.jpg  ou  https://s3.amazonaws.com/…" className={inputCls} />
            {form.imageUrl && (
              <div className="mt-2 relative h-24 w-40 rounded-lg overflow-hidden border border-white/10">
                <Image src={form.imageUrl} alt="preview" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>

          <div>
            <p className={`${labelCls} mb-2`}>Titre principal (optionnel — remplace le titre du site si renseigné)</p>
            <LangBlock labelFr="Titre FR" labelDe="Titre DE" labelEn="Titre EN"
              frValue={form.titleFr ?? ''} deValue={form.titleDe ?? ''} enValue={form.titleEn ?? ''}
              onFr={(v) => set('titleFr')(v)} onDe={(v) => set('titleDe')(v)} onEn={(v) => set('titleEn')(v)} />
          </div>

          <div>
            <p className={`${labelCls} mb-2`}>Sous-titre (optionnel)</p>
            <LangBlock labelFr="Sous-titre FR" labelDe="Sous-titre DE" labelEn="Sous-titre EN"
              frValue={form.subtitleFr ?? ''} deValue={form.subtitleDe ?? ''} enValue={form.subtitleEn ?? ''}
              onFr={(v) => set('subtitleFr')(v)} onDe={(v) => set('subtitleDe')(v)} onEn={(v) => set('subtitleEn')(v)} rows={2} />
          </div>

          <div>
            <p className={`${labelCls} mb-2`}>Texte alternatif (accessibilité)</p>
            <LangBlock labelFr="Alt FR" labelDe="Alt DE" labelEn="Alt EN"
              frValue={form.altTextFr ?? ''} deValue={form.altTextDe ?? ''} enValue={form.altTextEn ?? ''}
              onFr={(v) => set('altTextFr')(v)} onDe={(v) => set('altTextDe')(v)} onEn={(v) => set('altTextEn')(v)} />
          </div>

          <LinkField linkType={form.linkType ?? 'internal'} linkTarget={form.linkTarget ?? ''}
            onType={(v) => set('linkType')(v)} onTarget={(v) => set('linkTarget')(v)} />

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className={labelCls}>Ordre</label>
              <input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder')(parseInt(e.target.value) || 0)} className={`${inputCls} w-24`} />
            </div>
            {[
              { key: 'isMain' as const, label: 'Image principale', color: 'bg-yellow-500' },
              { key: 'isActive' as const, label: 'Active', color: 'bg-emerald-500' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex flex-col gap-1.5 mt-4">
                <span className={labelCls}>{label}</span>
                <Toggle
                  checked={!!form[key]}
                  onChange={(next) => set(key)(next)}
                  label={label}
                  color={color}
                />
              </div>
            ))}
          </div>

          <button onClick={saveSlide} disabled={saving} className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/80 disabled:opacity-50 transition">
            {saving ? 'Enregistrement…' : editId === 'new' ? "Ajouter l'image" : 'Enregistrer les modifications'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-white/30 text-sm">Chargement…</div>
      ) : slides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-white/30 text-sm mb-3">Aucune image configurée.</p>
          <p className="text-white/20 text-xs">Le carousel utilisera les images par défaut du site.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((s) => (
            <div key={s.id} className={`rounded-2xl border overflow-hidden ${s.isMain ? 'border-yellow-500/50' : s.isActive ? 'border-white/10' : 'border-white/5 opacity-60'} bg-white/[0.03]`}>
              <div className="relative h-36 bg-black/40">
                <Image src={s.imageUrl} alt={s.altTextFr ?? ''} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {s.isMain && <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-black">★ Principale</span>}
                  {!s.isActive && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white/60">Désactivée</span>}
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] text-white/40 font-mono bg-black/40 rounded px-1.5 py-0.5">#{s.sortOrder}</div>
              </div>
              <div className="p-3 space-y-1.5">
                {(s.titleFr || s.titleEn) && <p className="text-xs font-semibold text-white/80 truncate">{s.titleFr || s.titleEn}</p>}
                <p className="text-[11px] text-white/30 truncate font-mono">{s.imageUrl}</p>
                {s.linkTarget && <p className="text-[11px] text-accent/70 truncate">→ {s.linkTarget}</p>}
                <div className="flex items-center gap-2 pt-1.5">
                  {!s.isMain && (
                    <button onClick={() => setMain(s.id)} className="flex-1 rounded-lg border border-yellow-500/30 py-1.5 text-[11px] font-semibold text-yellow-400 hover:bg-yellow-500/10 transition">
                      Définir principale
                    </button>
                  )}
                  <button onClick={() => toggleActive(s)} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${s.isActive ? 'border-white/10 text-white/40 hover:text-white/70' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                    {s.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button onClick={() => openEdit(s)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white transition">Modifier</button>
                  <button onClick={() => deleteSlide(s.id)} className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-[11px] font-semibold text-red-400/70 hover:text-red-400 transition">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Hero Buttons Admin — 3 slots fixes, aucun ajout/suppression
// ═══════════════════════════════════════════════════════════════════════════════

function HeroButtonsAdmin() {
  const [buttons, setButtons] = useState<HomeButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, HomeButton>>({});
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/buttons');
      const data = await res.json();
      const btns: HomeButton[] = Array.isArray(data)
        ? data.filter((b: HomeButton) => typeof b.slot === 'string' && b.slot.startsWith('hero_'))
        : [];
      setButtons(btns);
      const map: Record<string, HomeButton> = {};
      for (const b of btns) map[b.slot] = { ...b };
      setForms(map);
    } catch { setButtons([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function flash(type: 'ok' | 'err', text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  }

  function setField(slot: string, key: keyof HomeButton, value: string | boolean) {
    setForms((prev) => ({ ...prev, [slot]: { ...prev[slot], [key]: value } }));
  }

  async function saveSlot(slot: string) {
    const f = forms[slot];
    if (!f) return;
    if (!f.labelFr.trim() || !f.labelDe.trim() || !f.labelEn.trim()) {
      flash('err', 'Les libellés FR, DE et EN sont requis.'); return;
    }
    if (!f.linkTarget.trim()) { flash('err', 'La destination du lien est requise.'); return; }
    if (f.linkType === 'external' && !/^https?:\/\/.+/.test(f.linkTarget)) {
      flash('err', 'Le lien externe doit commencer par https://'); return;
    }
    setSaving(slot);
    try {
      const res = await fetch(`/api/admin/buttons/${f.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labelFr: f.labelFr, labelDe: f.labelDe, labelEn: f.labelEn,
          linkType: f.linkType, linkTarget: f.linkTarget,
          colorVariant: f.colorVariant, openInNewTab: f.openInNewTab, isActive: f.isActive,
        }),
      });
      if (!res.ok) throw new Error();
      flash('ok', `Bouton "${HERO_SLOT_META[slot]?.position ?? slot}" enregistré.`);
      load();
    } catch { flash('err', 'Erreur lors de la sauvegarde.'); }
    finally { setSaving(null); }
  }

  const SLOTS = ['hero_1', 'hero_2', 'hero_3'];

  if (loading) return <div className="text-center py-12 text-white/30 text-sm">Chargement…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Boutons du Hero</h2>
        <p className="text-xs text-white/40 mt-0.5">3 slots fixes — modifiez textes, couleurs et destinations.</p>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${msg.type === 'ok' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {SLOTS.map((slot, idx) => {
        const meta = HERO_SLOT_META[slot];
        const f = forms[slot];
        if (!f) {
          return (
            <div key={slot} className={sectionCls}>
              <p className="text-amber-400/70 text-sm">⚠ Slot {slot} non trouvé en base — relancez l'initialisation des boutons.</p>
            </div>
          );
        }
        return (
          <div key={slot} className={`${sectionCls} space-y-5`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-bold">{idx + 1}</span>
                <p className="text-sm font-bold text-white">{meta.position}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-white/40">Actif</span>
                <Toggle
                  checked={f.isActive}
                  onChange={(next) => setField(slot, 'isActive', next)}
                  label="Activer ce bouton"
                />
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-lg border border-white/10 bg-black/30 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1.5">Apercu</p>
                <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${buttonVariantPreviewClass(f.colorVariant)} ${!f.isActive ? 'opacity-40' : ''}`}>
                  {f.labelFr || f.labelEn || 'Bouton'}
                </span>
              </div>
              <p className="text-[11px] text-white/35 truncate text-right max-w-[50%]" title={f.linkTarget}>
                {f.linkType === 'external' ? '↗' : '→'} {f.linkTarget || '—'}
              </p>
            </div>

            <div>
              <p className={`${labelCls} mb-2`}>Texte du bouton *</p>
              <LangBlock
                labelFr="Texte FR" labelDe="Texte DE" labelEn="Texte EN"
                frValue={f.labelFr} deValue={f.labelDe} enValue={f.labelEn}
                onFr={(v) => setField(slot, 'labelFr', v)}
                onDe={(v) => setField(slot, 'labelDe', v)}
                onEn={(v) => setField(slot, 'labelEn', v)}
              />
            </div>

            <LinkField
              linkType={f.linkType} linkTarget={f.linkTarget}
              onType={(v) => setField(slot, 'linkType', v)}
              onTarget={(v) => setField(slot, 'linkTarget', v)}
            />

            <ColorPicker value={f.colorVariant} onChange={(v) => setField(slot, 'colorVariant', v)} />

            <div className="flex items-center gap-2">
              <Toggle
                checked={f.openInNewTab}
                onChange={(next) => setField(slot, 'openInNewTab', next)}
                label="Ouvrir dans un nouvel onglet"
                color="bg-blue-500"
              />
              <span className="text-xs text-white/50">Ouvrir dans un nouvel onglet</span>
            </div>

            <button
              onClick={() => saveSlot(slot)}
              disabled={saving === slot}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/80 disabled:opacity-50 transition"
            >
              {saving === slot ? 'Enregistrement…' : 'Enregistrer ce bouton'}
            </button>
          </div>
        );
      })}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main component — tabbed
// ═══════════════════════════════════════════════════════════════════════════════

type TabKey = 'hero-images' | 'hero-buttons' | 'header';

function parseTabFromHash(hash: string): TabKey {
  const v = hash.replace(/^#/, '');
  if (v === 'hero-buttons' || v === 'header' || v === 'hero-images') return v;
  return 'hero-images';
}

export default function HomepageAdmin() {
  const [tab, setTab] = useState<TabKey>('hero-images');
  const [imageCount, setImageCount] = useState<number | null>(null);

  // Tab persistence via URL hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTab(parseTabFromHash(window.location.hash));
    const onHash = () => setTab(parseTabFromHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function changeTab(next: TabKey) {
    setTab(next);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${next}`);
    }
  }

  // Image count badge
  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/hero')
      .then((r) => r.json())
      .then((data) => { if (mounted) setImageCount(Array.isArray(data) ? data.length : 0); })
      .catch(() => { if (mounted) setImageCount(0); });
    return () => { mounted = false; };
  }, [tab]);

  const TABS: { key: TabKey; label: string; icon: string; badge: string | number | null }[] = [
    { key: 'hero-images',  label: 'Images Hero',         icon: '🖼️', badge: imageCount },
    { key: 'hero-buttons', label: 'Boutons Hero',        icon: '🔘', badge: 3 },
    { key: 'header',       label: 'Header & Membership', icon: '⚙️', badge: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-white/8 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-accent/60 mb-1">Configuration</p>
          <h1 className="text-2xl font-bold text-white">Page d&apos;accueil</h1>
          <p className="text-sm text-white/40 mt-1">
            Gérez les images du carousel, les 3 boutons du Hero et les 2 boutons du Header.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/20 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0-7L10 14m-4 0v7h7" />
          </svg>
          Voir la page d&apos;accueil
        </a>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl bg-white/[0.04] border border-white/8 p-1 w-full sm:w-fit">
        {TABS.map(({ key, label, icon, badge }) => (
          <button
            key={key}
            onClick={() => changeTab(key)}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              tab === key ? 'bg-accent text-white shadow' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span aria-hidden>{icon}</span>
            <span>{label}</span>
            {badge !== null && (
              <span className={`ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                tab === key ? 'bg-white/25 text-white' : 'bg-white/10 text-white/50'
              }`}>{badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'hero-images'  && <HeroAdmin />}
      {tab === 'hero-buttons' && <HeroButtonsAdmin />}
      {tab === 'header'       && <SiteConfigAdmin />}
    </div>
  );
}
