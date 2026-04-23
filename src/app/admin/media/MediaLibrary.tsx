'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PartnersSection } from './PartnersSection';

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  category: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string;
};

const CATEGORIES = [
  { value: 'all', label: 'Tous' },
  { value: 'community', label: 'Communauté (Accueil)' },
  { value: 'blog', label: 'Blog' },
  { value: 'team', label: 'Équipe' },
  { value: 'hero', label: 'Carrousel' },
  { value: 'event', label: 'Événements' },
  { value: 'partner', label: 'Partenaires' },
  { value: 'sponsor', label: 'Sponsors' },
  { value: 'general', label: 'Général' },
];

function inferFilenameFromUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    const candidate = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
    return decodeURIComponent(candidate);
  } catch {
    return '';
  }
}

function isSupportedExternalImageUrl(value: string) {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [uploadCategory, setUploadCategory] = useState('community');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL import state
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlFilename, setUrlFilename] = useState('');
  const [urlAltText, setUrlAltText] = useState('');
  const [urlCategory, setUrlCategory] = useState('general');
  const [urlSaving, setUrlSaving] = useState(false);
  const [urlError, setUrlError] = useState('');

  const fetchMedia = useCallback(async (category: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/media?category=${category}`);
    const data = await res.json();
    setMedia(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeCategory === 'partners-section') return;
    fetchMedia(activeCategory);
    // Sync upload/url category when switching to a specific category tab
    if (activeCategory !== 'all') {
      setUploadCategory(activeCategory);
      setUrlCategory(activeCategory);
    }
  }, [activeCategory, fetchMedia]);

  async function handleUpload(files: FileList | File[]) {
    setUploading(true);
    setUploadError('');
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', uploadCategory);
        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const d = await res.json();
          setUploadError(d.error ?? 'Erreur upload');
          return;
        }
      }
      await fetchMedia(activeCategory);
    } catch {
      setUploadError('Erreur réseau lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }

  async function handleAddByUrl(e: React.FormEvent) {
    e.preventDefault();
    setUrlError('');
    if (!urlInput.trim()) { setUrlError('URL requise.'); return; }
    if (!isSupportedExternalImageUrl(urlInput)) {
      setUrlError('Collez une URL HTTPS valide vers une image AWS S3, CloudFront ou CDN.');
      return;
    }
    setUrlSaving(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput.trim(),
          filename: urlFilename.trim(),
          altText: urlAltText.trim(),
          category: urlCategory,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setUrlError(d.error ?? 'Erreur lors de l\'enregistrement.');
        return;
      }
      setUrlInput('');
      setUrlFilename('');
      setUrlAltText('');
      setShowUrlForm(false);
      await fetchMedia(activeCategory);
    } catch {
      setUrlError('Erreur réseau.');
    } finally {
      setUrlSaving(false);
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  async function deleteMedia(item: MediaItem) {
    if (!confirm(`Supprimer "${item.filename}" ?`)) return;
    setDeleting(item.id);
    await fetch(`/api/admin/media?id=${item.id}`, { method: 'DELETE' });
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
    if (selected?.id === item.id) setSelected(null);
    setDeleting(null);
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Admin</p>
        <h1 className="text-xl font-bold text-white sm:text-2xl">Médiathèque</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/40">Gérez toutes les images du site depuis cet espace.</p>
      </div>

      {/* Upload zone */}
      {activeCategory !== 'partners-section' && (
      <div className="mb-6 sm:mb-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer px-4 py-8 text-center transition-all sm:px-6 sm:py-10 ${
            dragOver
              ? 'border-accent bg-accent/8 scale-[1.01]'
              : 'border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files ?? [])}
          />
          {uploading ? (
            <>
              <svg className="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-semibold text-accent">Upload en cours…</p>
            </>
          ) : (
            <>
              <svg className={`w-10 h-10 transition-colors ${dragOver ? 'text-accent' : 'text-white/25'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/70">
                  {dragOver ? 'Déposez les fichiers ici' : 'Glissez-déposez vos images'}
                </p>
                <p className="text-xs text-white/30 mt-0.5">ou cliquez pour parcourir — JPG, PNG, WebP, GIF — max 10 Mo</p>
              </div>
            </>
          )}

          {/* Category selector inside upload zone */}
          <div
            className="mt-1 flex flex-wrap items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-white/30">Catégorie :</span>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="rounded-lg bg-white/10 border border-white/10 text-white text-xs px-2 py-1 focus:outline-none focus:border-accent/40"
            >
              {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {uploadError && (
          <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            {uploadError}
          </p>
        )}

        {/* Toggle URL form */}
        <button
          type="button"
          onClick={() => {
            setShowUrlForm((v) => !v);
            setUrlError('');
            if (activeCategory !== 'all') setUrlCategory(activeCategory);
          }}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-accent transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {showUrlForm ? 'Masquer' : 'Ajouter via URL externe (AWS S3, CDN…)'}
        </button>

        {showUrlForm && (
          <form onSubmit={handleAddByUrl} className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4 sm:p-5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Ajouter une image par URL</p>
            <div>
              <label className="block text-xs text-white/40 mb-1">URL de l&apos;image <span className="text-accent">*</span></label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  const nextUrl = e.target.value;
                  setUrlInput(nextUrl);
                  setUrlFilename((current) => current.trim() ? current : inferFilenameFromUrl(nextUrl));
                }}
                placeholder="https://votre-bucket.s3.amazonaws.com/photo.jpg"
                required
                className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
              />
              <p className="mt-1 text-[10px] text-white/25">Liens HTTPS AWS S3, CloudFront et CDN acceptés. Les URLs signées S3 fonctionnent aussi.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <label className="block text-xs text-white/40 mb-1">Nom du fichier (optionnel)</label>
                <input
                  type="text"
                  value={urlFilename}
                  onChange={(e) => setUrlFilename(e.target.value)}
                  placeholder="photo-conference.jpg"
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
                />
              </div>
              <div className="sm:w-44">
                <label className="block text-xs text-white/40 mb-1">Catégorie</label>
                <select
                  value={urlCategory}
                  onChange={(e) => setUrlCategory(e.target.value)}
                  className="rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-accent/40 transition"
                >
                  {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Texte alternatif (optionnel)</label>
              <input
                type="text"
                value={urlAltText}
                onChange={(e) => setUrlAltText(e.target.value)}
                placeholder="Ex. Conférence Level Up 2026 à Berlin"
                className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
              />
            </div>
            {urlError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{urlError}</p>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowUrlForm(false);
                  setUrlError('');
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/40 transition hover:text-white sm:w-auto"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={urlSaving}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/80 disabled:opacity-50 sm:w-auto"
              >
                {urlSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
      )}

      {/* Category filter */}
      <div className="scrollbar-none -mx-1 mb-5 flex gap-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeCategory === cat.value
                ? 'bg-primary text-white shadow'
                : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />
        <button
          onClick={() => setActiveCategory('partners-section')}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
            activeCategory === 'partners-section'
              ? 'bg-accent text-brand-dark border-accent shadow'
              : 'bg-accent/8 text-accent/70 border-accent/20 hover:text-accent hover:bg-accent/15'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Partenaires &amp; Sponsors
        </button>
      </div>

      {/* Grid + detail panel */}
      {activeCategory === 'partners-section' ? (
        <PartnersSection />
      ) : (
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-white/25 rounded-2xl border border-white/8">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Aucune photo ici</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {media.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => setSelected(selected?.id === item.id ? null : item)}
                    className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selected?.id === item.id
                        ? 'border-accent shadow-lg shadow-accent/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.altText ?? item.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay with filename */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                      <span className="text-[9px] text-white/80 font-medium px-2 text-center line-clamp-2 leading-tight">
                        {item.filename}
                      </span>
                    </div>
                  </button>
                  {/* Quick delete button */}
                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() => deleteMedia(item)}
                    disabled={deleting === item.id}
                    className="absolute right-1 top-1 z-10 rounded-lg bg-black/70 p-1 text-red-400 opacity-100 transition-all hover:bg-red-500/30 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    {deleting === item.id ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && media.length > 0 && (
            <p className="mt-4 text-xs text-white/25">{media.length} fichier{media.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full shrink-0 lg:w-72 xl:w-60">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/3 lg:sticky lg:top-6">
              <div className="aspect-square overflow-hidden">
                <img src={selected.url} alt={selected.altText ?? selected.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-0.5">Fichier</p>
                  <p className="text-xs text-white break-all leading-relaxed">{selected.filename}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-0.5">Catégorie</p>
                    <p className="text-xs text-accent capitalize">{selected.category}</p>
                  </div>
                  {selected.size && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-0.5">Taille</p>
                      <p className="text-xs text-white/60">{formatSize(selected.size)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-0.5">URL</p>
                  <p className="text-xs text-white/50 break-all font-mono">{selected.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyUrl(selected.url)}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    copied === selected.url
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-accent/15 border border-accent/25 text-accent hover:bg-accent/25'
                  }`}
                >
                  {copied === selected.url ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      URL copiée !
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copier l&apos;URL
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => deleteMedia(selected)}
                  disabled={deleting === selected.id}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                >
                  {deleting === selected.id ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
