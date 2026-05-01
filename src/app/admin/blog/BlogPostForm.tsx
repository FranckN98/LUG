'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MediaPicker } from '@/app/admin/components/MediaPicker';

const CATEGORIES = ['Événements', 'Carrière', 'Études', 'Entrepreneuriat', 'Intégration', 'Impact'];

export type BlogPostFormValues = {
  title: string;
  body: string;
  author: string;
  category: string;
  coverImage: string;
  published: boolean;
};

type Mode = 'new' | 'edit';

type Props = {
  mode: Mode;
  postId?: string;
  initial?: BlogPostFormValues;
};

const DEFAULT_VALUES: BlogPostFormValues = {
  title: '',
  body: '',
  author: 'Équipe Level Up in Germany',
  category: '',
  coverImage: '',
  published: false,
};

const DRAFT_KEY = 'admin-blog-draft-new';

export default function BlogPostForm({ mode, postId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostFormValues>(initial ?? DEFAULT_VALUES);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [draftRestored, setDraftRestored] = useState(false);
  const initialRef = useRef<BlogPostFormValues>(initial ?? DEFAULT_VALUES);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ── Draft auto-save (new only) ──
  useEffect(() => {
    if (mode !== 'new') return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as BlogPostFormValues;
        if (draft && (draft.title || draft.body)) {
          setForm(draft);
          setDraftRestored(true);
        }
      }
    } catch {/* ignore */}
  }, [mode]);

  useEffect(() => {
    if (mode !== 'new') return;
    const t = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch {/* ignore */}
    }, 400);
    return () => clearTimeout(t);
  }, [form, mode]);

  // ── Dirty tracking ──
  const isDirty = useMemo(() => {
    const a = form;
    const b = initialRef.current;
    return a.title !== b.title || a.body !== b.body || a.author !== b.author
      || a.category !== b.category || a.coverImage !== b.coverImage || a.published !== b.published;
  }, [form]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty || saving) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty, saving]);

  // ── Stats ──
  const stats = useMemo(() => {
    const text = form.body.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = form.body.length;
    const minutes = Math.max(1, Math.round(words / 200));
    return { words, chars, minutes };
  }, [form.body]);

  function update<K extends keyof BlogPostFormValues>(field: K, value: BlogPostFormValues[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // ── Formatting helpers (operate on textarea selection) ──
  const applyFormat = useCallback((kind: 'h3' | 'bold' | 'italic' | 'list' | 'paragraph') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;
    const selected = value.slice(start, end);

    let replacement = selected;
    let cursorOffset = 0;

    if (kind === 'h3') {
      const text = selected || 'Titre de section';
      replacement = `\n**${text}**\n`;
      cursorOffset = replacement.length;
    } else if (kind === 'bold') {
      const text = selected || 'texte';
      replacement = `**${text}**`;
      cursorOffset = replacement.length;
    } else if (kind === 'italic') {
      const text = selected || 'texte';
      replacement = `*${text}*`;
      cursorOffset = replacement.length;
    } else if (kind === 'list') {
      const lines = (selected || 'Élément 1\nÉlément 2').split('\n');
      replacement = lines.map((l) => (l.startsWith('- ') ? l : `- ${l}`)).join('\n');
      cursorOffset = replacement.length;
    } else if (kind === 'paragraph') {
      replacement = `${selected}\n\n`;
      cursorOffset = replacement.length;
    }

    const next = value.slice(0, start) + replacement + value.slice(end);
    update('body', next);
    requestAnimationFrame(() => {
      const ta2 = textareaRef.current;
      if (!ta2) return;
      ta2.focus();
      const pos = start + cursorOffset;
      ta2.setSelectionRange(pos, pos);
    });
  }, []);

  // ── Submit ──
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;
    if (!form.title.trim() || !form.body.trim()) {
      setError('Le titre et le contenu sont obligatoires.');
      return;
    }
    setError('');
    setSuccess(false);
    setSaving(true);

    const url = mode === 'new' ? '/api/admin/blog' : `/api/admin/blog/${postId}`;
    const method = mode === 'new' ? 'POST' : 'PATCH';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      if (mode === 'new') {
        try { localStorage.removeItem(DRAFT_KEY); } catch {/* ignore */}
        router.push('/admin/blog');
        router.refresh();
      } else {
        initialRef.current = form;
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      }
    } else {
      let msg = 'Erreur lors de la sauvegarde.';
      try { const d = await res.json(); if (d?.error) msg = d.error; } catch {/* ignore */}
      setError(msg);
    }
  }, [form, mode, postId, router, saving]);

  // ── Ctrl/Cmd+S ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSubmit]);

  function discardDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {/* ignore */}
    setForm(DEFAULT_VALUES);
    setDraftRestored(false);
  }

  const inputCls =
    'w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-accent/40 focus:bg-white/[0.09] transition';

  const headerLabel = mode === 'new' ? 'Nouveau' : 'Modifier';
  const headerTitle = mode === 'new' ? 'Créer un article' : "Éditer l'article";

  return (
    <div className="max-w-4xl px-4 py-5 sm:px-6 sm:py-6 lg:p-8 pb-32">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
        <Link href="/admin/blog" className="text-white/35 hover:text-white transition focus:outline-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">{headerLabel}</p>
          <h1 className="text-xl font-bold text-white sm:text-2xl truncate">{headerTitle}</h1>
        </div>
        {/* Status pill */}
        <div className="hidden sm:flex items-center gap-2">
          {isDirty && !saving && !success && (
            <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
              Non sauvegardé
            </span>
          )}
          {saving && (
            <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-white/15 bg-white/5 text-white/60">
              Sauvegarde…
            </span>
          )}
          {!isDirty && !saving && mode === 'edit' && (
            <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-green-500/25 bg-green-500/10 text-green-400">
              ✓ À jour
            </span>
          )}
        </div>
      </div>

      {/* ── Draft restored banner ── */}
      {draftRestored && (
        <div className="mb-5 flex flex-col gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200/90 sm:flex-row sm:items-center sm:justify-between">
          <span>📝 Un brouillon non publié a été restauré automatiquement.</span>
          <button
            type="button"
            onClick={discardDraft}
            className="self-start rounded-lg border border-amber-500/30 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/10"
          >
            Effacer le brouillon
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Title ── */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Titre *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Un titre clair et accrocheur…"
            className={inputCls + ' text-base sm:text-lg font-semibold'}
            maxLength={140}
          />
          <div className="mt-1.5 flex justify-between text-[0.65rem] text-white/30">
            <span>Idéal : 40–70 caractères pour le SEO</span>
            <span className={form.title.length > 70 ? 'text-amber-400/80' : ''}>{form.title.length}/140</span>
          </div>
        </div>

        {/* ── Author + Category ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Auteur</label>
            <input
              type="text"
              value={form.author}
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

        {/* ── Cover ── */}
        <MediaPicker
          label="Image de couverture"
          value={form.coverImage}
          onChange={(url) => update('coverImage', url)}
          defaultCategory="blog"
          placeholder="https://bucket.s3.amazonaws.com/image.jpg ou https://cdn.example.com/image.jpg"
          helperText="Lien AWS/S3/CloudFront ou choisissez une image dans la médiathèque."
        />
        {form.coverImage && (
          <div className="-mt-2 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.coverImage}
              alt="Aperçu de couverture"
              className="h-40 w-full object-cover sm:h-56"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* ── Body editor with toolbar + preview ── */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Contenu *</label>
            <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-0.5">
              <button
                type="button"
                onClick={() => setView('edit')}
                className={`px-3 py-1 text-[0.7rem] font-semibold rounded-md transition ${view === 'edit' ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/70'}`}
              >
                Édition
              </button>
              <button
                type="button"
                onClick={() => setView('preview')}
                className={`px-3 py-1 text-[0.7rem] font-semibold rounded-md transition ${view === 'preview' ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/70'}`}
              >
                Aperçu
              </button>
            </div>
          </div>

          {view === 'edit' ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-white/10 bg-white/[0.04] px-2 py-1.5">
                <ToolbarBtn label="H" title="Titre de section (**texte**)" onClick={() => applyFormat('h3')} />
                <ToolbarBtn label="B" title="Gras (**texte**)" bold onClick={() => applyFormat('bold')} />
                <ToolbarBtn label="I" title="Italique (*texte*)" italic onClick={() => applyFormat('italic')} />
                <ToolbarBtn label="• Liste" title="Liste à puces (- élément)" onClick={() => applyFormat('list')} />
                <ToolbarBtn label="¶" title="Nouveau paragraphe" onClick={() => applyFormat('paragraph')} />
                <span className="ml-auto text-[0.65rem] text-white/30 px-1">
                  {stats.words} mots · ~{stats.minutes} min
                </span>
              </div>
              <textarea
                ref={textareaRef}
                required
                value={form.body}
                onChange={(e) => update('body', e.target.value)}
                rows={18}
                placeholder={`Écrivez votre article ici…\n\n**Titre de section**\nUn paragraphe de texte.\n\n- Premier point\n- Deuxième point`}
                className="w-full rounded-b-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm leading-relaxed font-mono focus:outline-none focus:border-accent/40 focus:bg-white/[0.09] transition resize-y"
              />
              <p className="mt-1.5 text-[0.65rem] text-white/30">
                Mise en forme : <code className="text-white/50">**Titre**</code> = sous-titre · <code className="text-white/50">- élément</code> = liste · ligne vide = nouveau paragraphe
              </p>
            </>
          ) : (
            <BlogPreview body={form.body} title={form.title} />
          )}
        </div>

        {/* ── Publish toggle ── */}
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {mode === 'new' ? 'Publier immédiatement' : 'Article publié'}
              </p>
              <p className="text-xs text-white/35 mt-0.5">
                {form.published
                  ? 'Visible publiquement sur le site.'
                  : 'Brouillon — non visible sur le site.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => update('published', !form.published)}
              aria-label="Basculer l'état de publication"
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${form.published ? 'bg-green-500' : 'bg-white/15'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* ── Feedback ── */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            ✓ Modifications sauvegardées avec succès.
          </p>
        )}

        {/* spacer for sticky bar */}
        <div className="h-2" />
      </form>

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0606]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0606]/80">
        <div className="max-w-4xl px-4 py-3 sm:px-6 lg:px-8 mx-0 lg:ml-[var(--admin-sidebar-width,0)] flex items-center gap-3">
          <div className="hidden sm:flex flex-1 min-w-0 items-center gap-3 text-xs text-white/40">
            <span className="truncate">
              {stats.words} mots · {stats.chars} car. · ~{stats.minutes} min de lecture
            </span>
            {isDirty && <span className="text-amber-300/80 shrink-0">• modifications non sauvegardées</span>}
          </div>
          <Link
            href="/admin/blog"
            className="flex h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-xs font-semibold text-white/55 transition hover:text-white sm:px-6 sm:text-sm"
          >
            Annuler
          </Link>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving || !isDirty}
            title="Ctrl/Cmd + S"
            className="h-11 flex-1 sm:flex-none sm:min-w-[200px] rounded-xl bg-primary px-4 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] transition hover:bg-[#a82020] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
          >
            {saving
              ? 'Sauvegarde…'
              : mode === 'new'
                ? form.published ? 'Publier l\'article' : 'Enregistrer le brouillon'
                : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ──

function ToolbarBtn({
  label, title, onClick, bold, italic,
}: { label: string; title: string; onClick: () => void; bold?: boolean; italic?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`min-w-[34px] h-7 rounded-md border border-white/8 bg-white/[0.03] px-2 text-xs text-white/65 transition hover:bg-white/10 hover:text-white focus:outline-none ${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''}`}
    >
      {label}
    </button>
  );
}

function BlogPreview({ body, title }: { body: string; title: string }) {
  const paragraphs = body.split('\n').filter(Boolean);
  return (
    <div className="rounded-xl border border-white/10 bg-white px-5 py-6 sm:px-8 sm:py-8 max-h-[600px] overflow-y-auto">
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a0a0a] leading-tight mb-5">{title}</h2>
      )}
      {paragraphs.length === 0 && (
        <p className="text-gray-400 text-sm italic">L&apos;aperçu apparaîtra ici…</p>
      )}
      <div className="prose prose-sm max-w-none">
        {paragraphs.map((p, i) => {
          if (p.startsWith('**') && p.endsWith('**')) {
            return <h3 key={i} className="text-base font-bold text-[#1a0a0a] mt-6 mb-2">{p.replace(/\*\*/g, '')}</h3>;
          }
          if (p.startsWith('- ')) {
            return <li key={i} className="text-gray-700 leading-relaxed ml-5 list-disc">{p.slice(2)}</li>;
          }
          return <p key={i} className="text-gray-700 leading-relaxed mb-3">{renderInline(p)}</p>;
        })}
      </div>
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Render **bold** and *italic* spans inline
  const parts: Array<{ type: 'b' | 'i' | 't'; v: string }> = [];
  let rest = text;
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/;
  while (rest.length) {
    const m = rest.match(re);
    if (!m || m.index === undefined) {
      parts.push({ type: 't', v: rest });
      break;
    }
    if (m.index > 0) parts.push({ type: 't', v: rest.slice(0, m.index) });
    const tok = m[0];
    if (tok.startsWith('**')) parts.push({ type: 'b', v: tok.slice(2, -2) });
    else parts.push({ type: 'i', v: tok.slice(1, -1) });
    rest = rest.slice(m.index + tok.length);
  }
  return parts.map((p, i) =>
    p.type === 'b' ? <strong key={i}>{p.v}</strong>
    : p.type === 'i' ? <em key={i}>{p.v}</em>
    : <span key={i}>{p.v}</span>
  );
}
