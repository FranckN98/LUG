'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaPicker } from '@/app/admin/components/MediaPicker';

export const PARTNER_CATEGORIES = [
  { value: 'partner',          label: 'Partenaire',               color: 'text-sky-400 bg-sky-500/15 border-sky-500/25' },
  { value: 'sponsor',          label: 'Sponsor',                  color: 'text-amber-400 bg-amber-500/15 border-amber-500/25' },
  { value: 'media-partner',    label: 'Media Partner',            color: 'text-purple-400 bg-purple-500/15 border-purple-500/25' },
  { value: 'strategic-partner',label: 'Partenaire Stratégique',   color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25' },
  { value: 'collaborator',     label: 'Collaborateur',            color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25' },
  { value: 'premium-sponsor',  label: 'Sponsor Premium',          color: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/25' },
  { value: 'gold-sponsor',     label: 'Sponsor Gold',             color: 'text-yellow-500 bg-yellow-600/15 border-yellow-600/25' },
  { value: 'silver-sponsor',   label: 'Sponsor Silver',           color: 'text-gray-300 bg-gray-500/15 border-gray-500/25' },
  { value: 'bronze-sponsor',   label: 'Sponsor Bronze',           color: 'text-orange-400 bg-orange-500/15 border-orange-500/25' },
];

function getCatInfo(value: string) {
  return PARTNER_CATEGORIES.find(c => c.value === value)
    ?? { value, label: value, color: 'text-white/50 bg-white/5 border-white/10' };
}

type Partner = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  category: string;
  sortOrder: number;
  visible: boolean;
  createdAt: string;
};

const EMPTY = { name: '', logoUrl: '', websiteUrl: '', category: 'partner', sortOrder: 0, visible: true };

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [flashId, setFlashId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/partners');
    const data = await res.json();
    setPartners(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function startAdd() {
    setEditingId(null);
    setForm({ ...EMPTY, sortOrder: partners.length });
    setError('');
  }

  function startEdit(p: Partner) {
    setEditingId(p.id);
    setForm({ name: p.name, logoUrl: p.logoUrl, websiteUrl: p.websiteUrl ?? '', category: p.category, sortOrder: p.sortOrder, visible: p.visible });
    setError('');
  }

  function cancelEdit() { setEditingId(null); setForm({ ...EMPTY }); setError(''); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { name: form.name.trim(), logoUrl: form.logoUrl.trim(), websiteUrl: form.websiteUrl.trim() || null, category: form.category, sortOrder: form.sortOrder, visible: form.visible };
      const res = editingId
        ? await fetch(`/api/admin/partners/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/admin/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur serveur.'); return; }
      const saved = await res.json();
      const id = saved.id ?? editingId;
      setFlashId(id); setTimeout(() => setFlashId(null), 2500);
      cancelEdit(); await load();
    } catch { setError('Erreur réseau.'); } finally { setSaving(false); }
  }

  async function handleDelete(p: Partner) {
    if (!confirm(`Supprimer "${p.name}" définitivement ?`)) return;
    setDeleting(p.id);
    await fetch(`/api/admin/partners/${p.id}`, { method: 'DELETE' });
    setPartners(prev => prev.filter(x => x.id !== p.id));
    if (editingId === p.id) cancelEdit();
    setDeleting(null);
  }

  async function toggleVisible(p: Partner) {
    await fetch(`/api/admin/partners/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visible: !p.visible }) });
    setPartners(prev => prev.map(x => x.id === p.id ? { ...x, visible: !x.visible } : x));
  }

  const usedCats = PARTNER_CATEGORIES.filter(c => partners.some(p => p.category === c.value));
  const displayed = filterCat === 'all' ? partners : partners.filter(p => p.category === filterCat);

  return (
    <div className="mt-6 border-t border-white/8 pt-6 sm:mt-8 sm:pt-8">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h2 className="text-base font-bold text-white sm:text-lg">Partenaires &amp; Sponsors</h2>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-white/35">
            {partners.length} enregistrement{partners.length !== 1 ? 's' : ''} — logos affichés sur la page publique avec lien cliquable si renseigné
          </p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-accent/25 bg-accent/15 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/25 sm:w-auto sm:shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau
        </button>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:gap-6">
        {/* ── Left: grid ── */}
        <div className="min-w-0 flex-1 xl:order-1">

          {/* Category filter chips */}
          {usedCats.length > 0 && (
            <div className="scrollbar-none -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <button
                onClick={() => setFilterCat('all')}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${filterCat === 'all' ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/70'}`}
              >
                Tous ({partners.length})
              </button>
              {usedCats.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setFilterCat(cat.value)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${filterCat === cat.value ? cat.color : 'border-transparent text-white/30 hover:text-white/70'}`}
                >
                  {cat.label} ({partners.filter(p => p.category === cat.value).length})
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 rounded-2xl border border-dashed border-white/10 text-white/20">
              <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="text-sm font-medium">Aucun partenaire ou sponsor</p>
              <p className="text-xs mt-0.5 text-white/15">Cliquez sur &quot;Nouveau&quot; pour en ajouter un</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {displayed.map(p => {
                const cat = getCatInfo(p.category);
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border overflow-hidden transition-all ${
                      editingId === p.id
                        ? 'border-accent/60 bg-accent/5 shadow-lg shadow-accent/10'
                        : flashId === p.id
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-white/8 bg-white/3 hover:bg-white/5'
                    } ${!p.visible ? 'opacity-50' : ''}`}
                  >
                    {/* Logo on white bg */}
                    <div className="relative bg-white aspect-[16/9] flex items-center justify-center p-3 overflow-hidden">
                      {p.logoUrl ? (
                        <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-300">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                          </svg>
                          <span className="text-[9px] mt-1">Pas de logo</span>
                        </div>
                      )}
                      {!p.visible && (
                        <span className="absolute top-1 right-1 bg-black/50 text-white/60 text-[8px] font-bold px-1.5 py-0.5 rounded">MASQUÉ</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5 p-3 sm:p-3.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold text-white leading-tight truncate">
                          {p.name || <span className="italic text-white/25">Sans nom</span>}
                        </p>
                        <span className="text-[9px] text-white/20 font-mono shrink-0">#{p.sortOrder}</span>
                      </div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold ${cat.color}`}>
                        {cat.label}
                      </span>
                      {p.websiteUrl ? (
                        <a
                          href={p.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={p.websiteUrl}
                          className="block text-[10px] text-accent/60 hover:text-accent truncate transition"
                        >
                          ↗ {p.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      ) : (
                        <p className="text-[10px] text-white/20 italic">Pas de lien</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => toggleVisible(p)}
                        title={p.visible ? 'Masquer' : 'Afficher'}
                        className={`min-h-11 px-1 py-2 text-[10px] font-semibold transition ${p.visible ? 'text-green-400/70 hover:text-green-300' : 'text-white/20 hover:text-white/50'}`}
                      >
                        {p.visible ? '● Visible' : '○ Masqué'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="min-h-11 px-1 py-2 text-[10px] font-medium text-white/30 transition hover:text-accent"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={deleting === p.id}
                        className="min-h-11 px-1 py-2 text-[10px] text-white/20 transition hover:text-red-400 disabled:opacity-40"
                      >
                        {deleting === p.id ? '…' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: form panel ── */}
        <div className="w-full shrink-0 xl:order-2 xl:w-80">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4 sm:p-5 xl:sticky xl:top-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent/70">
                {editingId ? 'Modifier' : 'Nouveau'}
              </p>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="text-xs text-white/25 hover:text-white transition">✕</button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Logo */}
              <MediaPicker
                value={form.logoUrl}
                onChange={(url) => setForm(f => ({ ...f, logoUrl: url }))}
                label="Logo"
                defaultCategory="partner"
                placeholder="/partners/logo.png ou URL externe…"
                helperText="Fond blanc recommandé — PNG ou WebP."
              />

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Nom <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Mercedes-Benz, AfroGeek…"
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Catégorie
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-accent/40 transition"
                >
                  {PARTNER_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Site web
                </label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
                  placeholder="https://www.partenaire.com"
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
                />
                <p className="mt-1 text-[10px] text-white/25">Le logo sera cliquable → redirige vers ce lien</p>
              </div>

              {/* Order + visible */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Ordre</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-accent/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Visible</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, visible: !f.visible }))}
                    className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      form.visible ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-white/35'
                    }`}
                  >
                    {form.visible ? 'Oui' : 'Non'}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-white/40 transition hover:text-white">
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary/80 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
