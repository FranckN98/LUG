'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MediaPicker } from '@/app/admin/components/MediaPicker';

const CATEGORIES = ['Événements', 'Carrière', 'Études', 'Entrepreneuriat', 'Intégration', 'Impact'];

export default function NewBlogPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', body: '', author: 'Équipe Level Up in Germany',
    category: '', coverImage: '', published: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push('/admin/blog');
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? 'Erreur lors de la création.');
    }
  }

  const inputCls = 'w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-accent/40 focus:bg-white/[0.09] transition';

  return (
    <div className="max-w-3xl px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
        <Link href="/admin/blog" className="text-white/35 hover:text-white transition focus:outline-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">Nouveau</p>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Créer un article</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Titre *</label>
          <input
            type="text" required value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Titre de l&apos;article"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Auteur</label>
            <input
              type="text" value={form.author}
              onChange={(e) => update('author', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className={inputCls + ' cursor-pointer'}
            >
              <option value="">— Choisir —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <MediaPicker
          label="Image de couverture (URL AWS ou médiathèque)"
          value={form.coverImage}
          onChange={(url) => update('coverImage', url)}
          defaultCategory="blog"
          placeholder="https://bucket.s3.amazonaws.com/image.jpg ou https://cdn.example.com/image.jpg"
          helperText="Collez ici le lien AWS/S3/CloudFront fourni lors de l'édition, ou choisissez une image dans la médiathèque."
        />

        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Contenu *</label>
          <textarea
            required value={form.body}
            onChange={(e) => update('body', e.target.value)}
            rows={12}
            placeholder="Rédigez votre article ici…"
            className={inputCls + ' resize-y leading-relaxed'}
          />
        </div>

        {/* Statut toggle */}
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Publier immédiatement</p>
            <p className="text-xs text-white/35 mt-0.5">Si désactivé, l&apos;article sera sauvegardé en brouillon.</p>
          </div>
          <button
            type="button"
            onClick={() => update('published', !form.published)}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${form.published ? 'bg-green-500' : 'bg-white/15'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="h-12 flex-1 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] transition hover:bg-[#a82020] focus:outline-none disabled:opacity-60"
          >
            {saving ? 'Enregistrement…' : form.published ? 'Publier l\'article' : 'Enregistrer le brouillon'}
          </button>
          <Link
            href="/admin/blog"
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 px-6 text-sm font-semibold text-white/50 transition hover:text-white focus:outline-none"
          >
            Annuler
          </Link>
        </div>

      </form>
    </div>
  );
}
