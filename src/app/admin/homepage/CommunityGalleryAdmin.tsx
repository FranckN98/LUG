'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminNotify } from '@/app/admin/components/AdminToaster';
import { uploadMediaFiles } from '@/lib/clientUpload';

type CommunityItem = {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  source: 'upload' | 'site';
  createdAt: string | null;
  expired: boolean;
  hiddenId: string | null;
};

export default function CommunityGalleryAdmin() {
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [altText, setAltText] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/community');
      const data = await res.json().catch(() => null);
      setItems(res.ok && Array.isArray(data) ? data : []);
      if (!res.ok) adminNotify.error(res.status === 401 ? 'Session expirée : reconnectez-vous.' : 'Impossible de charger la galerie.');
    } catch {
      setItems([]);
      adminNotify.error('Erreur réseau : galerie indisponible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    try {
      const { added, errors } = await uploadMediaFiles(list, 'community', altText.trim());
      if (added > 0) adminNotify.success(added === 1 ? 'Photo ajoutée à la galerie.' : `${added} photos ajoutées à la galerie.`);
      errors.forEach((msg) => adminNotify.error(msg));
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function call(id: string, success: string, failure: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        adminNotify.success(success);
        await load();
      } else {
        const d = await res.json().catch(() => null);
        adminNotify.error(d?.error ? `${failure} : ${d.error}` : failure);
      }
    } catch {
      adminNotify.error(`${failure} : erreur réseau.`);
    } finally {
      setDeleting(null);
    }
  }

  async function remove(item: CommunityItem) {
    const message =
      item.source === 'upload'
        ? `Supprimer définitivement "${item.filename}" ?`
        : `Retirer "${item.filename}" de la galerie ? Vous pourrez la restaurer.`;
    if (!confirm(message)) return;
    await call(item.id, item.source === 'upload' ? 'Photo supprimée.' : 'Photo retirée de la galerie.', 'Suppression impossible');
  }

  async function restore(item: CommunityItem) {
    if (item.hiddenId) await call(item.hiddenId, 'Photo restaurée.', 'Restauration impossible');
  }

  const visible = items.filter((i) => !i.hiddenId);
  const hidden = items.filter((i) => i.hiddenId);
  const uploads = visible.filter((i) => i.source === 'upload').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Galerie communauté — bas de la page d&apos;accueil</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/40">
          Ces photos défilent dans la bande « Notre communauté en images ». Elles sont indépendantes des images du Hero
          (onglet « Images Hero ») : ajouter ou retirer une photo ici ne change jamais le carousel du haut de page.
        </p>
        <p className="mt-1 text-xs text-white/40">
          {items.length} photo{items.length !== 1 ? 's' : ''} · {uploads} téléversée{uploads !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            upload(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragOver ? 'border-accent bg-accent/10' : 'border-white/15 bg-white/[0.02]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) upload(e.target.files);
              e.target.value = '';
            }}
          />
          <p className="text-sm font-semibold text-white/70">
            {uploading ? 'Upload en cours…' : dragOver ? 'Déposez les photos ici' : 'Glissez-déposez vos photos'}
          </p>
          <p className="text-xs text-white/30">JPG, PNG, WebP, GIF — les grosses photos sont réduites automatiquement avant l&apos;envoi</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-1 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-accent/80 disabled:opacity-50"
          >
            Ajouter des photos
          </button>
        </div>
        <div className="mt-4">
          <label htmlFor="community-alt" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-white/40">
            Texte alternatif des prochaines photos (optionnel)
          </label>
          <input
            id="community-alt"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Ex. Participants lors de la Méga Conférence 2025"
            className="w-full rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white placeholder-white/25 transition focus:border-accent/50 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-white/30">Chargement…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-sm text-white/30">Aucune photo dans la galerie communauté.</p>
          <p className="mt-1 text-xs text-white/20">La bande « Notre communauté en images » est masquée tant qu&apos;elle est vide.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-[3/2] bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.altText ?? item.filename} loading="lazy" className="h-full w-full object-cover" />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    item.source === 'upload' ? 'bg-emerald-500/90 text-white' : 'bg-black/60 text-white/70'
                  }`}
                >
                  {item.source === 'upload' ? 'Téléversée' : 'Fichier du site'}
                </span>
                {item.expired && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/75 p-2 text-center text-[11px] font-semibold leading-snug text-red-300">
                    Lien S3 expiré : photo non affichée sur le site. Retirez-la et ajoutez-la à nouveau.
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5">
                <p className="min-w-0 truncate text-[11px] text-white/50" title={item.filename}>
                  {item.filename}
                </p>
                {item.source === 'upload' ? (
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={deleting === item.id}
                    className="shrink-0 rounded-lg border border-red-500/20 px-2 py-1 text-[11px] font-semibold text-red-400/80 transition hover:text-red-400 disabled:opacity-50"
                  >
                    {deleting === item.id ? '…' : 'Supprimer'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={deleting === item.id}
                    title="Fichier du projet : il est retiré de la galerie mais peut être restauré."
                    className="shrink-0 rounded-lg border border-white/15 px-2 py-1 text-[11px] font-semibold text-white/60 transition hover:text-white disabled:opacity-50"
                  >
                    {deleting === item.id ? '…' : 'Retirer'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {hidden.length > 0 && (
        <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-white/60">
            Photos retirées de la galerie ({hidden.length})
          </summary>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {hidden.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.filename} loading="lazy" className="aspect-[3/2] w-full object-cover opacity-50" />
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <p className="min-w-0 truncate text-[11px] text-white/50" title={item.filename}>
                    {item.filename}
                  </p>
                  <button
                    type="button"
                    onClick={() => restore(item)}
                    disabled={deleting === item.hiddenId}
                    className="shrink-0 rounded-lg border border-emerald-500/30 px-2 py-1 text-[11px] font-semibold text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-50"
                  >
                    Restaurer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
