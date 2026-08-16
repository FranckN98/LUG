'use client';

import { useCallback, useEffect, useState } from 'react';
import { MediaPicker } from '@/app/admin/components/MediaPicker';
import { adminNotify } from '@/app/admin/components/AdminToaster';

type SocialLink = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

const FEATURED_SOCIALS = [
  { name: 'TikTok', emoji: '🎵' },
  { name: 'Instagram', emoji: '📸' },
  { name: 'LinkedIn', emoji: '💼' },
  { name: 'Facebook', emoji: '👍' },
  { name: 'YouTube', emoji: '▶️' },
] as const;

function normalizeSocialKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Only ever called on links already flagged isFeatured=true, to pick which of
// the 5 platform slots a given featured record belongs to. Never used to
// decide whether a link is featured — that's the isFeatured DB field.
function matchesPlatformSlot(link: SocialLink, name: string): boolean {
  const key = normalizeSocialKey(`${link.title} ${link.url}`);
  const platform = normalizeSocialKey(name);

  if (platform === 'facebook') return key.includes('facebook') || key.includes('fb');
  if (platform === 'instagram') return key.includes('instagram') || key.includes('insta');
  if (platform === 'linkedin') return key.includes('linkedin');
  if (platform === 'youtube') return key.includes('youtube') || key.includes('youtu');
  if (platform === 'tiktok') return key.includes('tiktok');
  return key.includes(platform);
}

export function SocialLinksAdmin() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingFeaturedId, setSavingFeaturedId] = useState<string | null>(null);
  const [featuredUrls, setFeaturedUrls] = useState<Record<string, string>>({});

  // CRUD form state for manual links
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    url: '',
    description: '',
    coverImageUrl: '',
    sortOrder: 0,
    isActive: true,
    isNew: false,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/social-links', { cache: 'no-store' });
      if (!res.ok) throw new Error('load failed');
      const data = (await res.json()) as SocialLink[];
      setLinks(data);
    } catch {
      adminNotify.error('Impossible de charger les liens.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function saveFeaturedLink(link: SocialLink) {
    const url = (featuredUrls[link.id] ?? link.url).trim();
    if (!url) {
      adminNotify.error("L'URL est requise.");
      return;
    }

    setSavingFeaturedId(link.id);
    try {
      const res = await fetch(`/api/admin/social-links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        adminNotify.error(data?.error ?? 'Mise à jour impossible.');
        return;
      }
      adminNotify.success(`${link.title} mis à jour.`);
      setFeaturedUrls((prev) => {
        const next = { ...prev };
        delete next[link.id];
        return next;
      });
      await refresh();
    } catch {
      adminNotify.error('Erreur réseau.');
    } finally {
      setSavingFeaturedId(null);
    }
  }

  async function toggleActive(link: SocialLink) {
    const res = await fetch(`/api/admin/social-links/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !link.isActive }),
    });

    if (!res.ok) {
      adminNotify.error('Mise à jour impossible.');
      return;
    }

    adminNotify.success(link.isActive ? 'Lien masqué.' : 'Lien affiché.');
    await refresh();
  }

  async function resetFeaturedLinks() {
    if (!confirm('Réinitialiser tous les liens sociaux par défaut ?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/social-links/reset-featured', { method: 'POST' });
      if (!res.ok) {
        adminNotify.error('Impossible de réinitialiser.');
        return;
      }
      adminNotify.success('Liens sociaux réinitialisés.');
      await refresh();
    } catch {
      adminNotify.error('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  }

  // ============ CRUD FUNCTIONS FOR MANUAL LINKS ============

  function startAdd() {
    setEditingId(null);
    const nonFeaturedLinks = links.filter((l) => !l.isFeatured);
    const nextOrder = nonFeaturedLinks.length === 0 ? 0 : Math.max(...nonFeaturedLinks.map((l) => l.sortOrder)) + 1;
    setForm({
      title: '',
      url: '',
      description: '',
      coverImageUrl: '',
      sortOrder: nextOrder,
      isActive: true,
      isNew: false,
    });
  }

  function startEdit(link: SocialLink) {
    setEditingId(link.id);
    setForm({
      title: link.title,
      url: link.url,
      description: link.description ?? '',
      coverImageUrl: link.coverImageUrl ?? '',
      sortOrder: link.sortOrder,
      isActive: link.isActive,
      isNew: link.isNew,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      title: '',
      url: '',
      description: '',
      coverImageUrl: '',
      sortOrder: 0,
      isActive: true,
      isNew: false,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      adminNotify.error('Le titre est requis.');
      return;
    }
    if (!form.url.trim()) {
      adminNotify.error("L'URL est requise.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        url: form.url.trim(),
        description: form.description.trim(),
        coverImageUrl: form.coverImageUrl.trim() || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        isNew: form.isNew,
      };

      const res = editingId
        ? await fetch(`/api/admin/social-links/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/social-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        adminNotify.error(data?.error ?? 'Enregistrement échoué.');
        return;
      }

      adminNotify.success(editingId ? 'Lien mis à jour.' : 'Lien ajouté.');
      cancelEdit();
      await refresh();
    } catch {
      adminNotify.error('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  }

  async function removeLink(id: string) {
    if (!confirm('Supprimer ce lien ?')) return;
    try {
      const res = await fetch(`/api/admin/social-links/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        adminNotify.error('Suppression impossible.');
        return;
      }
      adminNotify.success('Lien supprimé.');
      await refresh();
    } catch {
      adminNotify.error('Erreur réseau.');
    }
  }

  async function toggleLinkActive(link: SocialLink) {
    try {
      const res = await fetch(`/api/admin/social-links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !link.isActive }),
      });

      if (!res.ok) {
        adminNotify.error('Mise à jour impossible.');
        return;
      }

      adminNotify.success(link.isActive ? 'Lien désactivé.' : 'Lien activé.');
      await refresh();
    } catch {
      adminNotify.error('Erreur réseau.');
    }
  }

  async function moveLink(link: SocialLink, direction: 'up' | 'down') {
    const nonFeaturedLinks = links
      .filter((l) => !l.isFeatured)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));

    const index = nonFeaturedLinks.findIndex((x) => x.id === link.id);
    if (index < 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nonFeaturedLinks.length) return;

    const reordered = [...nonFeaturedLinks];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    try {
      const res = await fetch('/api/admin/social-links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((l) => l.id) }),
      });

      if (!res.ok) {
        adminNotify.error('Réorganisation impossible.');
        return;
      }

      const updated = (await res.json()) as SocialLink[];
      setLinks(updated);
    } catch {
      adminNotify.error('Erreur réseau.');
    }
  }

  return (
    <div className="max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-accent/70">Linktree</p>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Réseaux sociaux</h1>
          <p className="max-w-2xl text-sm text-white/60">
            Gérez les URLs de vos 5 réseaux sociaux principaux. Ces liens s'affichent en haut de votre page Linktree.
          </p>
        </header>

        {/* Featured Social Networks Section - UNIQUE SECTION */}
        <section className="overflow-hidden rounded-2xl border border-accent/20 bg-[linear-gradient(120deg,rgba(233,140,11,0.1),rgba(140,26,26,0.12),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_50px_-35px_rgba(233,140,11,0.75)] md:p-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.25em] text-accent">Réseaux sociaux</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Vos 5 plateformes principales</h2>
            </div>
            <button
              type="button"
              onClick={resetFeaturedLinks}
              disabled={saving || loading}
              className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-50"
            >
              Réinitialiser
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-white/50">Chargement…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {FEATURED_SOCIALS.map((social) => {
                const link = links.find((item) => item.isFeatured && matchesPlatformSlot(item, social.name));
                if (!link) return null;
                const isSaving = savingFeaturedId === link.id;
                return (
                  <div key={link.id} className="flex flex-col rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                    {/* Platform name and emoji */}
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-3xl" aria-hidden>{social.emoji}</span>
                      <h3 className="text-sm font-semibold text-white">{social.name}</h3>
                    </div>

                    {/* Status badge */}
                    <div className="mb-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${link.isActive ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/50'}`}>
                        {link.isActive ? '● Affiché' : '● Masqué'}
                      </span>
                    </div>

                    {/* URL input */}
                    <label className="mb-2 text-xs font-semibold text-white/60">URL</label>
                    <input
                      type="url"
                      value={featuredUrls[link.id] ?? link.url}
                      onChange={(e) => setFeaturedUrls((current) => ({ ...current, [link.id]: e.target.value }))}
                      className="mb-3 rounded-lg border border-white/10 bg-[#1a0f0f] px-3 py-2.5 text-xs text-white outline-none transition focus:border-accent/60"
                      placeholder="https://..."
                    />

                    {/* Buttons - only Save & Toggle visibility (NO delete) */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => saveFeaturedLink(link)}
                        disabled={isSaving}
                        className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-black transition hover:bg-accent/90 disabled:opacity-50"
                      >
                        {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(link)}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10"
                      >
                        {link.isActive ? 'Masquer' : 'Afficher'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Manual Links CRUD Section */}
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Left: Links list */}
          <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Liens & Projets</h2>
              <button
                type="button"
                onClick={startAdd}
                className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
              >
                Nouveau lien
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-white/50">Chargement…</p>
            ) : (() => {
              const manualLinks = links.filter((l) => !l.isFeatured);
              return manualLinks.length === 0 ? (
                <p className="text-sm text-white/50">Aucun lien pour le moment.</p>
              ) : (
                <ul className="space-y-3">
                  {manualLinks.map((link) => (
                    <li key={link.id} className="rounded-xl border border-white/10 bg-[#110909] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{link.title}</p>
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white/60">
                              Ordre {link.sortOrder}
                            </span>
                            {link.isNew && (
                              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-accent">
                                New
                              </span>
                            )}
                            {!link.isActive && (
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white/40">
                                Inactif
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-accent/80">{link.url}</p>
                          {link.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-white/60">{link.description}</p>
                          )}
                        </div>

                        {link.coverImageUrl && (
                          <div className="h-14 w-20 overflow-hidden rounded-lg border border-white/10">
                            <img src={link.coverImageUrl} alt={link.title} className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                        <button
                          type="button"
                          onClick={() => moveLink(link, 'up')}
                          className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
                        >
                          ↑ Monter
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(link, 'down')}
                          className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
                        >
                          ↓ Descendre
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleLinkActive(link)}
                          className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
                        >
                          {link.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(link)}
                          className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="rounded-md border border-red-500/30 px-2.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10 sm:ml-auto"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </section>

          {/* Right: Form */}
          <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white">{editingId ? 'Modifier le lien' : 'Ajouter un lien'}</h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">Titre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f0606] px-3 py-2 text-sm text-white placeholder-white/30"
                  placeholder="YouTube, Portefeuille, Blog…"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">URL *</label>
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f0606] px-3 py-2 text-sm text-white placeholder-white/30"
                  placeholder="https://…"
                />
              </div>

              <MediaPicker
                value={form.coverImageUrl}
                onChange={(url) => setForm((prev) => ({ ...prev, coverImageUrl: url }))}
                label="Image couverture"
                defaultCategory="general"
                placeholder="/media/… ou URL externe"
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f0606] px-3 py-2 text-sm text-white placeholder-white/30"
                  placeholder="Courte description optionnelle…"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">Ordre</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-white/10 bg-[#0f0606] px-3 py-2 text-sm text-white"
                  />
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Actif
                </label>
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 text-sm text-white/70 transition hover:border-accent/40 hover:bg-accent/10">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) => setForm((prev) => ({ ...prev, isNew: e.target.checked }))}
                />
                <span>Marquer comme <span className="font-semibold text-accent">NEW</span></span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black transition hover:bg-accent/90 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
