'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/blog" className="text-white/35 hover:text-white transition focus:outline-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">Nouveau</p>
          <h1 className="text-2xl font-bold text-white">Créer un article</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Titre *</label>
          <input
            type="text" required value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Titre de l'article"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Image de couverture (URL)</label>
          <input
            type="text" value={form.coverImage}
            onChange={(e) => update('coverImage', e.target.value)}
            placeholder="https://... ou /community/_DSC9034.JPG"
            className={inputCls}
          />
        </div>

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
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">Publier immédiatement</p>
            <p className="text-xs text-white/35 mt-0.5">Si désactivé, l'article sera sauvegardé en brouillon.</p>
          </div>
          <button
            type="button"
            onClick={() => update('published', !form.published)}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${form.published ? 'bg-green-500' : 'bg-white/15'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold text-sm shadow-[0_4px_16px_rgba(140,26,26,0.35)] hover:bg-[#a82020] transition focus:outline-none disabled:opacity-60"
          >
            {saving ? 'Enregistrement…' : form.published ? 'Publier l\'article' : 'Enregistrer le brouillon'}
          </button>
          <Link
            href="/admin/blog"
            className="h-12 px-6 flex items-center rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-semibold transition focus:outline-none"
          >
            Annuler
          </Link>
        </div>

      </form>
    </div>
  );
}
