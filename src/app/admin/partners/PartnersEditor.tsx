'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaPicker } from '@/app/admin/components/MediaPicker';

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

const EMPTY_FORM = {
  name: '',
  logoUrl: '',
  websiteUrl: '',
  category: 'partner' as 'partner' | 'sponsor',
  sortOrder: 0,
  visible: true,
};

export function PartnersEditor() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/partners');
    const data = await res.json();
    setPartners(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  function startAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sortOrder: partners.length });
    setError('');
  }

  function startEdit(p: Partner) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      logoUrl: p.logoUrl,
      websiteUrl: p.websiteUrl ?? '',
      category: p.category === 'sponsor' ? 'sponsor' : 'partner',
      sortOrder: p.sortOrder,
      visible: p.visible,
    });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        logoUrl: form.logoUrl.trim(),
        websiteUrl: form.websiteUrl.trim() || null,
        category: form.category,
        sortOrder: form.sortOrder,
        visible: form.visible,
      };

      const res = editingId
        ? await fetch(`/api/admin/partners/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/partners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Erreur serveur.');
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      await fetchPartners();
    } catch {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Partner) {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    setDeleting(p.id);
    await fetch(`/api/admin/partners/${p.id}`, { method: 'DELETE' });
    setPartners((prev) => prev.filter((x) => x.id !== p.id));
    if (editingId === p.id) cancelEdit();
    setDeleting(null);
  }

  async function toggleVisible(p: Partner) {
    await fetch(`/api/admin/partners/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !p.visible }),
    });
    setPartners((prev) => prev.map((x) => x.id === p.id ? { ...x, visible: !x.visible } : x));
  }

  const isEditing = editingId !== null;
  const showForm = isEditing || form.name !== '' || editingId === null && partners.length === 0;

  return (
    <div className="max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-white">Partenaires & Sponsors</h1>
        <p className="mt-1 text-sm text-white/40">
          Gérez les logos, noms et liens des partenaires affichés sur le site.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Left: list ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white/60">
              {partners.length} partenaire{partners.length !== 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={startAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-white text-xs font-semibold hover:bg-primary transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 rounded-2xl border border-dashed border-white/10 text-white/25">
              <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Aucun partenaire</p>
            </div>
          ) : (
            <div className="space-y-2">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    editingId === p.id
                      ? 'border-accent/50 bg-accent/5'
                      : 'border-white/8 bg-white/3 hover:bg-white/5'
                  } ${!p.visible ? 'opacity-50' : ''}`}
                >
                  {/* Logo preview */}
                  <div className="w-14 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} className="max-h-9 max-w-[52px] object-contain" />
                    ) : (
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        p.category === 'sponsor' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary-light'
                      }`}>
                        {p.category === 'sponsor' ? 'Sponsor' : 'Partenaire'}
                      </span>
                      {p.websiteUrl && (
                        <a
                          href={p.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-white/35 hover:text-accent transition truncate max-w-[120px]"
                        >
                          ↗ {p.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title={p.visible ? 'Masquer' : 'Afficher'}
                      onClick={() => toggleVisible(p)}
                      className={`p-1.5 rounded-lg transition ${p.visible ? 'text-green-400 hover:bg-green-500/10' : 'text-white/25 hover:bg-white/10'}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.visible
                          ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        } />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Modifier"
                      onClick={() => startEdit(p)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-accent hover:bg-accent/10 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Supprimer"
                      onClick={() => handleDelete(p)}
                      disabled={deleting === p.id}
                      className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: form ── */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent/70 mb-4">
              {isEditing ? 'Modifier' : 'Nouveau partenaire'}
            </p>

            <form onSubmit={handleSave} className="space-y-4">

              {/* Logo via médiathèque */}
              <MediaPicker
                value={form.logoUrl}
                onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
                label="Logo"
                defaultCategory="partner"
                placeholder="/partners/logo.png ou URL AWS S3…"
                helperText="Fond blanc recommandé. PNG ou WebP transparent."
              />

              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Nom <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="AfroGeek, GrowInDE…"
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
                />
              </div>

              {/* URL partenaire */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Site web du partenaire
                </label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                  placeholder="https://www.partenaire.com"
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
                />
                <p className="mt-1 text-xs text-white/30">Le logo sera cliquable et redirigera vers ce lien.</p>
              </div>

              {/* Catégorie + ordre + visibilité */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as 'partner' | 'sponsor' }))}
                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-accent/40 transition"
                  >
                    <option value="partner">Partenaire</option>
                    <option value="sponsor">Sponsor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Ordre</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-accent/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Visible</label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, visible: !f.visible }))}
                    className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      form.visible
                        ? 'bg-green-500/15 border-green-500/30 text-green-400'
                        : 'bg-white/5 border-white/10 text-white/35'
                    }`}
                  >
                    {form.visible ? 'Oui' : 'Non'}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}
              {saved && (
                <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">✓ Enregistré !</p>
              )}

              <div className="flex gap-2 pt-1">
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 rounded-xl border border-white/10 text-white/40 text-sm py-2 hover:text-white transition"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-primary text-white text-sm font-semibold py-2 hover:bg-primary/80 transition disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : isEditing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
