'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { isPresignedS3Url } from '@/lib/presignedUrl';
import { uploadMediaFile } from '@/lib/clientUpload';

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
  { value: 'blog', label: 'Blog' },
  { value: 'team', label: 'Équipe' },
  { value: 'event', label: 'Événements' },
  { value: 'partner', label: 'Partenaires' },
  { value: 'general', label: 'Général' },
];

/** Bibliothèques propres à l'accueil : proposées uniquement quand le sélecteur les demande via `categories`. */
const HOME_CATEGORIES = [
  { value: 'hero', label: 'Images Hero' },
  { value: 'community', label: 'Galerie communauté' },
];

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  defaultCategory?: string;
  /** Restreint la médiathèque à ces catégories (les uploads y sont rangés). */
  categories?: string[];
  /** Appelé après un upload réussi (ex. rafraîchir une liste qui dépend de la médiathèque). */
  onUploaded?: () => void;
  placeholder?: string;
  helperText?: string;
};

export function MediaPicker({
  value,
  onChange,
  label = 'Image',
  defaultCategory = 'all',
  categories,
  onUploaded,
  placeholder = '/media/... ou URL externe',
  helperText,
}: Props) {
  const tabs = categories ? [...CATEGORIES, ...HOME_CATEGORIES].filter((c) => categories.includes(c.value)) : CATEGORIES;
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    categories && !categories.includes(defaultCategory) ? (tabs[0]?.value ?? 'general') : defaultCategory,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rehosting, setRehosting] = useState(false);
  const [rehostError, setRehostError] = useState('');

  // Un lien S3 signé expire en quelques minutes : on en garde une copie sur le site et on met l'URL permanente à la place.
  async function rehost(url: string) {
    setRehosting(true);
    setRehostError('');
    try {
      const res = await fetch('/api/admin/media/rehost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, category: activeCategory === 'all' ? 'general' : activeCategory }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRehostError(data.error ?? "Impossible d'héberger cette image.");
        return;
      }
      onChange(data.url);
      onUploaded?.();
    } catch {
      setRehostError('Erreur réseau.');
    } finally {
      setRehosting(false);
    }
  }

  function handleManualChange(next: string) {
    onChange(next);
    setRehostError('');
    if (isPresignedS3Url(next)) void rehost(next);
  }

  const fetchMedia = useCallback(async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?category=${category}`);
      const data = await res.json().catch(() => null);
      setMedia(res.ok && Array.isArray(data) ? data : []);
      if (!res.ok) setUploadError(res.status === 401 ? 'Session expirée : reconnectez-vous.' : 'Impossible de charger la médiathèque.');
    } catch {
      setMedia([]);
      setUploadError('Erreur réseau : médiathèque indisponible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchMedia(activeCategory);
  }, [open, activeCategory, fetchMedia]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      const category = activeCategory === 'all' ? 'general' : activeCategory;
      const uploaded: string[] = [];
      const errors: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadMediaFile(file, category);
        if (result.ok) {
          uploaded.push(result.item.url);
          onUploaded?.();
        } else {
          errors.push(result.error);
        }
      }
      if (errors.length > 0) setUploadError(errors.join(' • '));
      // Une seule photo envoyée sans erreur : elle est sélectionnée directement.
      if (uploaded.length === 1 && errors.length === 0) {
        select(uploaded[0]!);
        return;
      }
      await fetchMedia(activeCategory);
    } finally {
      setUploading(false);
    }
  }

  function select(url: string) {
    onChange(url);
    setOpen(false);
  }

  return (
    <>
      {/* Trigger zone */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          {label}
        </label>

        <div className="flex gap-2 items-start">
          {/* Preview */}
          {value && (
            <div className="w-20 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex-1 flex flex-col gap-1.5">
            {/* URL input (manual) */}
            <input
              type="text"
              value={value}
              onChange={(e) => handleManualChange(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
            />
            {helperText && <p className="text-xs text-white/35">{helperText}</p>}
            {rehosting && (
              <p className="text-xs text-accent">Lien S3 signé détecté : copie de l&apos;image sur le site en cours…</p>
            )}
            {rehostError && <p className="text-xs text-red-400">{rehostError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent/25 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Médiathèque
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs hover:text-white transition"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#130707] shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent/70">Admin</p>
                <h2 className="text-base font-bold text-white">Médiathèque</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Quick upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-white text-xs font-semibold hover:bg-primary transition disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Upload…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Uploader
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-white/40 hover:text-white transition p-1"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="mx-5 mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {uploadError}
              </p>
            )}

            {/* Category tabs */}
            {tabs.length > 1 && (
              <div className="flex gap-1 px-5 pt-3 pb-1 overflow-x-auto scrollbar-hide">
                {tabs.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setActiveCategory(cat.value)}
                    className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeCategory === cat.value
                        ? 'bg-primary text-white'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-white/30 text-sm gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Chargement…
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-white/25">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Aucune photo dans cette catégorie</p>
                  <p className="text-xs mt-1">Uploadez des images pour commencer</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {media.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => select(item.url)}
                      title={item.filename}
                      className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        value === item.url
                          ? 'border-accent shadow-lg shadow-accent/20 scale-[1.02]'
                          : 'border-white/10 hover:border-accent/50 hover:scale-[1.02]'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.altText ?? item.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Selected checkmark */}
                      {value === item.url && (
                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between">
              <p className="text-xs text-white/30">
                {media.length} photo{media.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white transition"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
