'use client';

import { useCallback, useEffect, useState } from 'react';
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

function isFeaturedSocial(link: SocialLink, name: string): boolean {
  const key = `${link.title} ${link.url}`.toLowerCase();
  if (name === 'Facebook') return key.includes('facebook') || key.includes('fb.com');
  return key.includes(name.toLowerCase());
}

export function SocialLinksAdmin() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingFeaturedId, setSavingFeaturedId] = useState<string | null>(null);
  const [featuredUrls, setFeaturedUrls] = useState<Record<string, string>>({});

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
                const link = links.find((item) => isFeaturedSocial(item, social.name));
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
      </div>
    </div>
  );
}
