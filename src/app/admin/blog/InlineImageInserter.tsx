'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export type InlineImageInserterHandle = {
  open: () => void;
};

type Props = {
  onInsert: (url: string, alt: string) => void;
};

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  category: string;
};

type Stage = 'choose' | 'uploading' | 'caption';

export const InlineImageInserter = forwardRef<InlineImageInserterHandle, Props>(
  function InlineImageInserter({ onInsert }, ref) {
    const [open, setOpen] = useState(false);
    const [stage, setStage] = useState<Stage>('choose');
    const [error, setError] = useState('');
    const [pendingUrl, setPendingUrl] = useState('');
    const [pendingAlt, setPendingAlt] = useState('');
    const [library, setLibrary] = useState<MediaItem[]>([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
        setStage('choose');
        setError('');
        setPendingUrl('');
        setPendingAlt('');
        setShowLibrary(false);
      },
    }));

    // ESC to close
    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const fetchLibrary = useCallback(async () => {
      setLibraryLoading(true);
      try {
        const res = await fetch('/api/admin/media?category=blog');
        const data = await res.json();
        setLibrary(Array.isArray(data) ? data : []);
      } catch {
        setLibrary([]);
      } finally {
        setLibraryLoading(false);
      }
    }, []);

    useEffect(() => {
      if (open && showLibrary && library.length === 0) fetchLibrary();
    }, [open, showLibrary, library.length, fetchLibrary]);

    async function uploadFiles(files: FileList | File[] | null) {
      if (!files) return;
      const list = Array.from(files);
      if (!list.length) return;
      const file = list[0]; // one image at a time for inline insert
      if (!file.type.startsWith('image/')) {
        setError('Seules les images sont acceptées.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Fichier trop lourd (max 10 Mo).');
        return;
      }
      setError('');
      setStage('uploading');
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', 'blog');
        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d.error ?? "Erreur lors de l'upload.");
          setStage('choose');
          return;
        }
        const data = (await res.json()) as MediaItem;
        setPendingUrl(data.url);
        setPendingAlt(data.altText ?? file.name.replace(/\.[^.]+$/, ''));
        setStage('caption');
      } catch {
        setError("Erreur réseau lors de l'upload.");
        setStage('choose');
      }
    }

    function pickFromLibrary(item: MediaItem) {
      setPendingUrl(item.url);
      setPendingAlt(item.altText ?? item.filename.replace(/\.[^.]+$/, ''));
      setStage('caption');
    }

    function confirmInsert() {
      if (!pendingUrl) return;
      onInsert(pendingUrl, pendingAlt.trim());
      setOpen(false);
    }

    function handleDrop(e: React.DragEvent) {
      e.preventDefault();
      setDragOver(false);
      uploadFiles(e.dataTransfer.files);
    }

    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#130707] shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent/70">Article</p>
              <h2 className="text-base font-bold text-white">Insérer une image</h2>
            </div>
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

          {error && (
            <p className="mx-5 mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex-1 overflow-y-auto p-5">

            {stage === 'uploading' && (
              <div className="flex flex-col items-center justify-center py-16 text-white/60">
                <svg className="w-8 h-8 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm">Upload en cours…</p>
              </div>
            )}

            {stage === 'choose' && !showLibrary && (
              <>
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed transition px-6 py-10 text-center ${
                    dragOver
                      ? 'border-accent bg-accent/5'
                      : 'border-white/15 bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadFiles(e.target.files)}
                  />
                  <svg className="w-10 h-10 mx-auto mb-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm text-white font-semibold mb-1">
                    Glissez une image ici ou cliquez pour choisir
                  </p>
                  <p className="text-xs text-white/40">JPG, PNG, WebP, GIF · max 10 Mo</p>
                </div>

                <div className="my-5 flex items-center gap-3 text-[0.65rem] uppercase tracking-wider text-white/25">
                  <div className="h-px flex-1 bg-white/10" />
                  <span>ou</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  type="button"
                  onClick={() => setShowLibrary(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choisir depuis la médiathèque
                </button>

                <div className="mt-5">
                  <label className="block text-xs font-semibold text-white/45 uppercase tracking-wider mb-2">Ou coller une URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://…"
                      value={pendingUrl}
                      onChange={(e) => setPendingUrl(e.target.value)}
                      className="flex-1 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 transition"
                    />
                    <button
                      type="button"
                      disabled={!pendingUrl.trim()}
                      onClick={() => setStage('caption')}
                      className="rounded-xl bg-accent/20 border border-accent/30 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/30 transition disabled:opacity-40"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </>
            )}

            {stage === 'choose' && showLibrary && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowLibrary(false)}
                    className="text-xs text-white/45 hover:text-white transition flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                  <p className="text-xs text-white/30">{library.length} image{library.length !== 1 ? 's' : ''}</p>
                </div>

                {libraryLoading ? (
                  <div className="flex items-center justify-center py-12 text-white/40 text-sm gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Chargement…
                  </div>
                ) : library.length === 0 ? (
                  <p className="text-center text-sm text-white/40 py-12">Aucune image dans la médiathèque.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {library.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => pickFromLibrary(item)}
                        title={item.filename}
                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-accent/60 hover:scale-[1.02] transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.altText ?? item.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {stage === 'caption' && (
              <div className="space-y-4">
                {pendingUrl && (
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingUrl}
                      alt="Aperçu"
                      className="w-full max-h-72 object-contain bg-black/40"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                    Texte alternatif (accessibilité / SEO)
                  </label>
                  <input
                    type="text"
                    value={pendingAlt}
                    onChange={(e) => setPendingAlt(e.target.value)}
                    placeholder="Ex : Étudiants lors d'un atelier"
                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-accent/40 transition"
                  />
                  <p className="mt-1.5 text-[0.65rem] text-white/30">
                    Décrit l&apos;image pour les lecteurs d&apos;écran et les moteurs de recherche.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/8 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/55 text-xs font-semibold hover:text-white transition"
            >
              Annuler
            </button>
            {stage === 'caption' && (
              <button
                type="button"
                onClick={confirmInsert}
                disabled={!pendingUrl}
                className="px-5 py-2 rounded-lg bg-primary text-xs font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] hover:bg-[#a82020] transition disabled:opacity-50"
              >
                Insérer dans l&apos;article
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
