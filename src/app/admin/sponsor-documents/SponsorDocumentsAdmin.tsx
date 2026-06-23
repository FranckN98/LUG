'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { adminNotify } from '@/app/admin/components/AdminToaster';

type SponsorDoc = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  filename: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  isFeatured: boolean;
  isPublic: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** Canonical public host shown to partners/sponsors. */
const PUBLIC_HOST = 'https://www.levelupingermany.com';

function formatSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

function buildShareUrl(doc: SponsorDoc): string {
  if (doc.slug) return `${PUBLIC_HOST}/pdf/${doc.slug}`;
  if (doc.url.startsWith('http')) return doc.url;
  return `${PUBLIC_HOST}${doc.url}`;
}

/** Server-side small-file ceiling for the multipart fallback (matches Vercel's ~4.5 MB body limit). */
const MULTIPART_SAFE_LIMIT = 4 * 1024 * 1024;

function sanitiseFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100) || 'document.pdf'
  );
}

type UploadedBlob = { url: string; size: number; mimeType: string; filename: string };

async function uploadDirectToBlob(
  file: File,
  onProgress: (pct: number) => void,
): Promise<UploadedBlob | 'not_configured'> {
  const path = `sponsor-documents/${Date.now()}-${sanitiseFilename(file.name)}`;
  try {
    const blob = await upload(path, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/sponsor-documents/upload-token',
      contentType: file.type || 'application/pdf',
      onUploadProgress: ({ percentage }) => onProgress(percentage),
    });
    return {
      url: blob.url,
      size: file.size,
      mimeType: file.type || 'application/pdf',
      filename: file.name,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Token endpoint signals missing Blob token via 503 + JSON body.
    if (/blob_not_configured|503/.test(msg)) return 'not_configured';
    throw e;
  }
}

export function SponsorDocumentsAdmin() {
  const [docs, setDocs] = useState<SponsorDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sponsor-documents', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as SponsorDoc[];
      setDocs(data);
    } catch {
      adminNotify.error('Impossible de charger les PDFs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      adminNotify.error('Sélectionnez un fichier PDF.');
      return;
    }
    if (file.type !== 'application/pdf') {
      adminNotify.error('Le fichier doit être un PDF.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      // Try direct upload to Vercel Blob first (no 4.5 MB serverless limit).
      const direct = await uploadDirectToBlob(file, setUploadProgress);

      if (direct !== 'not_configured') {
        const res = await fetch('/api/admin/sponsor-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...direct, title, description, isPublic }),
        });
        const data = await res.json();
        if (!res.ok) {
          adminNotify.error(data?.error ?? "Erreur lors de l'enregistrement.");
          return;
        }
        adminNotify.success('PDF ajouté.');
        setTitle('');
        setDescription('');
        setIsPublic(true);
        if (fileRef.current) fileRef.current.value = '';
        await refresh();
        return;
      }

      // Fallback: legacy multipart upload (local dev without Blob, small files only).
      if (file.size > MULTIPART_SAFE_LIMIT) {
        adminNotify.error(
          'Upload direct indisponible (BLOB_READ_WRITE_TOKEN non configuré). Le fichier dépasse 4 Mo et ne peut pas passer par l’upload classique.',
        );
        return;
      }
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title);
      fd.append('description', description);
      fd.append('isPublic', String(isPublic));
      const res = await fetch('/api/admin/sponsor-documents', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        adminNotify.error(data?.error ?? "Erreur lors de l'upload.");
        return;
      }
      adminNotify.success('PDF ajouté.');
      setTitle('');
      setDescription('');
      setIsPublic(true);
      if (fileRef.current) fileRef.current.value = '';
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur réseau lors de l'upload.";
      adminNotify.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  async function patchDoc(id: string, body: Partial<SponsorDoc>) {
    const res = await fetch(`/api/admin/sponsor-documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      adminNotify.error(data?.error ?? 'Mise à jour échouée.');
      return false;
    }
    return true;
  }

  async function setFeatured(id: string) {
    if (await patchDoc(id, { isFeatured: true })) {
      adminNotify.success('PDF affiché sur la page sponsor.');
      refresh();
    }
  }

  async function togglePublic(doc: SponsorDoc) {
    if (await patchDoc(doc.id, { isPublic: !doc.isPublic })) refresh();
  }

  async function saveMeta(id: string, title: string, description: string) {
    if (await patchDoc(id, { title, description })) {
      adminNotify.success('Modifications enregistrées.');
      refresh();
    }
  }

  async function removeDoc(id: string) {
    if (!confirm('Supprimer ce PDF ? Cette action est irréversible.')) return;
    const res = await fetch(`/api/admin/sponsor-documents/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      adminNotify.error('Suppression échouée.');
      return;
    }
    adminNotify.success('PDF supprimé.');
    refresh();
  }

  async function replaceFile(id: string, file: File) {
    if (file.type !== 'application/pdf') {
      adminNotify.error('Le fichier doit être un PDF.');
      return;
    }
    try {
      const direct = await uploadDirectToBlob(file, () => undefined);

      if (direct !== 'not_configured') {
        const res = await fetch(`/api/admin/sponsor-documents/${id}/file`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(direct),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          adminNotify.error(data?.error ?? 'Remplacement échoué.');
          return;
        }
        adminNotify.success('Fichier remplacé.');
        refresh();
        return;
      }

      if (file.size > MULTIPART_SAFE_LIMIT) {
        adminNotify.error(
          'Upload direct indisponible (BLOB_READ_WRITE_TOKEN non configuré). Le fichier dépasse 4 Mo.',
        );
        return;
      }
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/admin/sponsor-documents/${id}/file`, { method: 'PUT', body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        adminNotify.error(data?.error ?? 'Remplacement échoué.');
        return;
      }
      adminNotify.success('Fichier remplacé.');
      refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Remplacement échoué.';
      adminNotify.error(msg);
    }
  }

  async function copyLink(doc: SponsorDoc) {
    const shareUrl = buildShareUrl(doc);
    try {
      await navigator.clipboard.writeText(shareUrl);
      adminNotify.success('Lien copié : ' + shareUrl);
    } catch {
      adminNotify.error('Impossible de copier le lien.');
    }
  }

  return (
    <div className="max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-accent/70">Documents</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">PDFs Sponsors & Partenaires</h1>
        <p className="text-sm text-white/60 max-w-2xl">
          Téléversez vos documents PDF, choisissez celui qui s&apos;affiche sur la page Sponsor, et
          partagez les autres comme liens professionnels.
        </p>
      </header>

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-white">Ajouter un PDF</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Proposition de partenariat 2026"
              className="w-full rounded-lg border border-white/10 bg-[#0f0606] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Fichier PDF</label>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="w-full rounded-lg border border-white/10 bg-[#0f0606] px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-accent/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-accent hover:file:bg-accent/30"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Courte description affichée à côté du lien partageable."
              className="w-full rounded-lg border border-white/10 bg-[#0f0606] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Lien public partageable
          </label>
          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90 disabled:opacity-50"
          >
            {uploading
              ? uploadProgress !== null && uploadProgress < 100
                ? `Envoi… ${Math.round(uploadProgress)}%`
                : 'Finalisation…'
              : 'Téléverser'}
          </button>
        </div>
        {uploading && uploadProgress !== null && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-accent transition-[width] duration-150"
              style={{ width: `${Math.max(2, Math.min(100, uploadProgress))}%` }}
            />
          </div>
        )}
        <p className="text-xs text-white/40">
          Taille max : 100 Mo. Les fichiers volumineux sont envoyés directement vers Vercel Blob (pas via l’API), donc les
          gros PDF (livre complet, etc.) passent sans souci en production.
        </p>
      </form>

      {/* List */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">PDFs disponibles</h2>
        {loading ? (
          <p className="text-sm text-white/50">Chargement…</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-white/50">Aucun PDF pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {docs.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                onFeature={() => setFeatured(doc.id)}
                onTogglePublic={() => togglePublic(doc)}
                onSave={(t, d) => saveMeta(doc.id, t, d)}
                onDelete={() => removeDoc(doc.id)}
                onCopy={() => copyLink(doc)}
                onReplaceFile={(file) => replaceFile(doc.id, file)}
              />
            ))}
          </ul>
        )}
      </section>
      </div>
    </div>
  );
}

function DocRow({
  doc,
  onFeature,
  onTogglePublic,
  onSave,
  onDelete,
  onCopy,
  onReplaceFile,
}: {
  doc: SponsorDoc;
  onFeature: () => void;
  onTogglePublic: () => void;
  onSave: (title: string, description: string) => void;
  onDelete: () => void;
  onCopy: () => void;
  onReplaceFile: (file: File) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [description, setDescription] = useState(doc.description ?? '');
  const [replacing, setReplacing] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
      <div className="space-y-4">
        <div className="min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-[#0f0606] px-3 py-1.5 text-sm text-white"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-white/10 bg-[#0f0606] px-3 py-1.5 text-sm text-white"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-white break-words">{doc.title}</h3>
                {doc.isFeatured && (
                  <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent">
                    Page sponsor
                  </span>
                )}
                {!doc.isPublic && (
                  <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white/60">
                    Privé
                  </span>
                )}
              </div>
              {doc.description && <p className="mt-1 text-sm text-white/60">{doc.description}</p>}
              <p className="mt-1 text-xs text-white/40">
                {doc.filename} · {formatSize(doc.size)}
              </p>
              <p className="mt-1 break-all text-xs text-accent/80">
                {buildShareUrl(doc)}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          {editing ? (
            <>
              <button
                onClick={() => {
                  onSave(title, description);
                  setEditing(false);
                }}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-accent/90"
              >
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setTitle(doc.title);
                  setDescription(doc.description ?? '');
                  setEditing(false);
                }}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
              >
                Annuler
              </button>
            </>
          ) : (
            <>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5"
              >
                Ouvrir
              </a>
              <button
                onClick={onCopy}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5"
              >
                Copier le lien
              </button>
              {!doc.isFeatured && (
                <button
                  onClick={onFeature}
                  className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
                >
                  Afficher sur la page sponsor
                </button>
              )}
              <button
                onClick={onTogglePublic}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
              >
                {doc.isPublic ? 'Rendre privé' : 'Rendre public'}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
              >
                Modifier
              </button>
              <input
                ref={replaceInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setReplacing(true);
                  try {
                    await onReplaceFile(f);
                  } finally {
                    setReplacing(false);
                    if (replaceInputRef.current) replaceInputRef.current.value = '';
                  }
                }}
              />
              <button
                onClick={() => replaceInputRef.current?.click()}
                disabled={replacing}
                className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 disabled:opacity-50"
              >
                {replacing ? 'Remplacement…' : 'Remplacer le fichier'}
              </button>
              <button
                onClick={onDelete}
                className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10 sm:ml-auto"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
