'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { MediaPicker } from '@/app/admin/components/MediaPicker';
import { InlineImageInserter, type InlineImageInserterHandle } from './InlineImageInserter';

const CATEGORIES = ['Événements', 'Carrière', 'Études', 'Entrepreneuriat', 'Intégration', 'Impact'];

const LOCALES: Locale[] = ['fr', 'en', 'de'];

const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
};

const LOCALE_FLAGS: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  de: '🇩🇪',
};

export type BlogTranslationFormValues = {
  title: string;
  excerpt: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
};

export type BlogPostFormValues = {
  author: string;
  category: string;
  coverImage: string;
  published: boolean;
  publishedAt: string; // local datetime string for <input type="datetime-local"> (or '')
  translations: Record<Locale, BlogTranslationFormValues>;
};

type Mode = 'new' | 'edit';

type Props = {
  mode: Mode;
  postId?: string;
  initial?: BlogPostFormValues;
};

const EMPTY_TRANSLATION: BlogTranslationFormValues = {
  title: '',
  excerpt: '',
  body: '',
  metaTitle: '',
  metaDescription: '',
};

const DEFAULT_VALUES: BlogPostFormValues = {
  author: 'Équipe Level Up in Germany',
  category: '',
  coverImage: '',
  published: false,
  publishedAt: '',
  translations: {
    fr: { ...EMPTY_TRANSLATION },
    en: { ...EMPTY_TRANSLATION },
    de: { ...EMPTY_TRANSLATION },
  },
};

const DRAFT_KEY = 'admin-blog-draft-new-i18n';

const toLocalDatetimeInput = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function BlogPostForm({ mode, postId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostFormValues>(initial ?? DEFAULT_VALUES);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [draftRestored, setDraftRestored] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>('fr');
  const initialRef = useRef<BlogPostFormValues>(initial ?? DEFAULT_VALUES);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInserterRef = useRef<InlineImageInserterHandle | null>(null);

  // ── Draft auto-save (new only) ──
  useEffect(() => {
    if (mode !== 'new') return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as BlogPostFormValues;
        const hasContent = LOCALES.some((l) => draft?.translations?.[l]?.title || draft?.translations?.[l]?.body);
        if (hasContent) {
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
    return JSON.stringify(form) !== JSON.stringify(initialRef.current);
  }, [form]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty || saving) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty, saving]);

  // ── Stats (current locale) ──
  const currentTr = form.translations[activeLocale];
  const stats = useMemo(() => {
    const text = currentTr.body.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = currentTr.body.length;
    const minutes = Math.max(1, Math.round(words / 200));
    return { words, chars, minutes };
  }, [currentTr.body]);

  // Filled-status per locale (for tab badges).
  const localeStatus = useMemo(() => {
    const out: Record<Locale, 'complete' | 'partial' | 'empty'> = { fr: 'empty', en: 'empty', de: 'empty' };
    for (const l of LOCALES) {
      const t = form.translations[l];
      const hasTitle = !!t.title.trim();
      const hasBody = !!t.body.trim();
      out[l] = hasTitle && hasBody ? 'complete' : (hasTitle || hasBody) ? 'partial' : 'empty';
    }
    return out;
  }, [form.translations]);

  const updateShared = <K extends Exclude<keyof BlogPostFormValues, 'translations'>>(field: K, value: BlogPostFormValues[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const updateTr = <K extends keyof BlogTranslationFormValues>(locale: Locale, field: K, value: BlogTranslationFormValues[K]) => {
    setForm((f) => ({
      ...f,
      translations: {
        ...f.translations,
        [locale]: { ...f.translations[locale], [field]: value },
      },
    }));
  };

  // ── Formatting helpers (operate on textarea selection in active locale) ──
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
    updateTr(activeLocale, 'body', next);
    requestAnimationFrame(() => {
      const ta2 = textareaRef.current;
      if (!ta2) return;
      ta2.focus();
      const pos = start + cursorOffset;
      ta2.setSelectionRange(pos, pos);
    });
  }, [activeLocale]);

  const insertImageMarkdown = useCallback((url: string, alt: string) => {
    const ta = textareaRef.current;
    const safeAlt = (alt || 'image').replace(/[\[\]]/g, '');
    const snippet = `\n![${safeAlt}](${url})\n`;
    if (!ta) {
      updateTr(activeLocale, 'body', currentTr.body + snippet);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;
    const next = value.slice(0, start) + snippet + value.slice(end);
    updateTr(activeLocale, 'body', next);
    requestAnimationFrame(() => {
      const ta2 = textareaRef.current;
      if (!ta2) return;
      ta2.focus();
      const pos = start + snippet.length;
      ta2.setSelectionRange(pos, pos);
    });
  }, [activeLocale, currentTr.body]);

  // ── Copy from another locale ──
  const copyFromLocale = (source: Locale) => {
    if (source === activeLocale) return;
    setForm((f) => ({
      ...f,
      translations: {
        ...f.translations,
        [activeLocale]: { ...f.translations[source] },
      },
    }));
  };

  // ── Auto-translate from another locale ──
  const [translating, setTranslating] = useState<Locale | null>(null);
  const [translateError, setTranslateError] = useState('');
  const [translateProvider, setTranslateProvider] = useState<string | null>(null);

  const translateFromLocale = async (source: Locale) => {
    if (source === activeLocale) return;
    const src = form.translations[source];
    if (!src.title.trim() && !src.body.trim()) {
      setTranslateError(`La langue source (${LOCALE_LABELS[source]}) est vide.`);
      return;
    }
    setTranslateError('');
    setTranslateProvider(null);
    setTranslating(source);
    try {
      const res = await fetch('/api/admin/blog/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          target: activeLocale,
          fields: {
            title: src.title,
            excerpt: src.excerpt,
            body: src.body,
            metaTitle: src.metaTitle,
            metaDescription: src.metaDescription,
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const j = await res.json() as {
        provider?: string;
        title?: string;
        excerpt?: string;
        body?: string;
        metaTitle?: string;
        metaDescription?: string;
      };
      setForm((f) => ({
        ...f,
        translations: {
          ...f.translations,
          [activeLocale]: {
            title: j.title ?? f.translations[activeLocale].title,
            excerpt: j.excerpt ?? f.translations[activeLocale].excerpt,
            body: j.body ?? f.translations[activeLocale].body,
            metaTitle: j.metaTitle ?? f.translations[activeLocale].metaTitle,
            metaDescription: j.metaDescription ?? f.translations[activeLocale].metaDescription,
          },
        },
      }));
      setTranslateProvider(j.provider ?? null);
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : 'Échec de la traduction');
    } finally {
      setTranslating(null);
    }
  };

  // ── Submit ──
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;

    // At least one fully-filled locale required.
    const filled = LOCALES.filter((l) => form.translations[l].title.trim() && form.translations[l].body.trim());
    if (!filled.length) {
      setError('Au moins une langue (titre + contenu) est obligatoire.');
      return;
    }

    setError('');
    setSuccess(false);
    setSaving(true);

    const url = mode === 'new' ? '/api/admin/blog' : `/api/admin/blog/${postId}`;
    const method = mode === 'new' ? 'POST' : 'PATCH';

    // Build translations payload — drop empty optional fields, omit empty locales entirely.
    const translationsPayload: Partial<Record<Locale, Partial<BlogTranslationFormValues>>> = {};
    for (const l of LOCALES) {
      const t = form.translations[l];
      if (!t.title.trim() || !t.body.trim()) continue;
      translationsPayload[l] = {
        title: t.title.trim(),
        body: t.body.trim(),
        excerpt: t.excerpt.trim() || undefined,
        metaTitle: t.metaTitle.trim() || undefined,
        metaDescription: t.metaDescription.trim() || undefined,
      };
    }

    const payload = {
      author: form.author,
      category: form.category,
      coverImage: form.coverImage,
      published: form.published,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      translations: translationsPayload,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSubmit]);

  const discardDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {/* ignore */}
    setForm(DEFAULT_VALUES);
    setDraftRestored(false);
  };

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

        {/* ── Shared: Author + Category ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Auteur (commun)</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => updateShared('author', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Catégorie (commun)</label>
            <select
              value={form.category}
              onChange={(e) => updateShared('category', e.target.value)}
              className={inputCls + ' cursor-pointer'}
            >
              <option value="">— Choisir —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* ── Shared: Cover ── */}
        <MediaPicker
          label="Image de couverture (commune)"
          value={form.coverImage}
          onChange={(url) => updateShared('coverImage', url)}
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

        {/* ── Language tabs ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50 mr-2">Langue :</span>
            {LOCALES.map((l) => {
              const status = localeStatus[l];
              const isActive = activeLocale === l;
              const dot = status === 'complete' ? 'bg-green-400' : status === 'partial' ? 'bg-amber-400' : 'bg-white/20';
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLocale(l)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'border-accent/50 bg-accent/15 text-white'
                      : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span aria-hidden>{LOCALE_FLAGS[l]}</span>
                  {LOCALE_LABELS[l]}
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden />
                </button>
              );
            })}
            {LOCALES.filter((l) => l !== activeLocale && localeStatus[l] !== 'empty').length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[0.65rem] uppercase tracking-wider text-white/35">Copier depuis :</span>
                {LOCALES.filter((l) => l !== activeLocale && localeStatus[l] !== 'empty').map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => copyFromLocale(l)}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.65rem] font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition"
                    title={`Copier le contenu ${LOCALE_LABELS[l]} vers ${LOCALE_LABELS[activeLocale]}`}
                  >
                    {LOCALE_FLAGS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Auto-translate row ── */}
          {LOCALES.filter((l) => l !== activeLocale && localeStatus[l] !== 'empty').length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/20 bg-accent/[0.05] px-3 py-2.5">
              <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/70">
                Traduire automatiquement vers {LOCALE_LABELS[activeLocale]} depuis :
              </span>
              {LOCALES.filter((l) => l !== activeLocale && localeStatus[l] !== 'empty').map((l) => {
                const isLoading = translating === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => translateFromLocale(l)}
                    disabled={!!translating}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-[0.7rem] font-semibold text-accent hover:bg-accent/25 transition disabled:opacity-50 disabled:cursor-wait"
                    title={`Traduire automatiquement le contenu ${LOCALE_LABELS[l]} vers ${LOCALE_LABELS[activeLocale]} (écrase le contenu actuel)`}
                  >
                    {isLoading ? (
                      <span className="w-3 h-3 rounded-full border-2 border-accent/40 border-t-accent animate-spin" />
                    ) : (
                      <span aria-hidden>{LOCALE_FLAGS[l]}</span>
                    )}
                    {LOCALE_LABELS[l]}
                  </button>
                );
              })}
              {translateProvider && (
                <span className="ml-auto text-[0.65rem] text-white/40">
                  ✓ via {translateProvider}
                </span>
              )}
              {translateError && (
                <span className="ml-auto text-[0.65rem] text-red-300">
                  ⚠ {translateError}
                </span>
              )}
            </div>
          )}

          {/* ── Title (per-locale) ── */}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Titre — {LOCALE_LABELS[activeLocale]} *
            </label>
            <input
              type="text"
              value={currentTr.title}
              onChange={(e) => updateTr(activeLocale, 'title', e.target.value)}
              placeholder="Un titre clair et accrocheur…"
              className={inputCls + ' text-base sm:text-lg font-semibold'}
              maxLength={140}
            />
            <div className="mt-1.5 flex justify-between text-[0.65rem] text-white/30">
              <span>Idéal : 40–70 caractères pour le SEO</span>
              <span className={currentTr.title.length > 70 ? 'text-amber-400/80' : ''}>{currentTr.title.length}/140</span>
            </div>
          </div>

          {/* ── Excerpt (per-locale) ── */}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Extrait — {LOCALE_LABELS[activeLocale]}
            </label>
            <textarea
              value={currentTr.excerpt}
              onChange={(e) => updateTr(activeLocale, 'excerpt', e.target.value)}
              rows={2}
              placeholder="Court résumé affiché sur la liste et dans les partages (laisser vide = auto)."
              className={inputCls + ' resize-y'}
              maxLength={300}
            />
            <p className="mt-1 text-[0.65rem] text-white/30">{currentTr.excerpt.length}/300 — facultatif. Si vide, un extrait du contenu est utilisé.</p>
          </div>

          {/* ── Body editor (per-locale) ── */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Contenu — {LOCALE_LABELS[activeLocale]} *
              </label>
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
                <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-white/10 bg-white/[0.04] px-2 py-1.5">
                  <ToolbarBtn label="H" title="Titre de section (**texte**)" onClick={() => applyFormat('h3')} />
                  <ToolbarBtn label="B" title="Gras (**texte**)" bold onClick={() => applyFormat('bold')} />
                  <ToolbarBtn label="I" title="Italique (*texte*)" italic onClick={() => applyFormat('italic')} />
                  <ToolbarBtn label="• Liste" title="Liste à puces (- élément)" onClick={() => applyFormat('list')} />
                  <ToolbarBtn label="¶" title="Nouveau paragraphe" onClick={() => applyFormat('paragraph')} />
                  <ToolbarBtn
                    label="🖼 Image"
                    title="Insérer une image (upload ou médiathèque)"
                    onClick={() => imageInserterRef.current?.open()}
                  />
                  <span className="ml-auto text-[0.65rem] text-white/30 px-1">
                    {stats.words} mots · ~{stats.minutes} min
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={currentTr.body}
                  onChange={(e) => updateTr(activeLocale, 'body', e.target.value)}
                  rows={18}
                  placeholder={`Écrivez votre article ici…\n\n**Titre de section**\nUn paragraphe de texte.\n\n- Premier point\n- Deuxième point`}
                  className="w-full rounded-b-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm leading-relaxed font-mono focus:outline-none focus:border-accent/40 focus:bg-white/[0.09] transition resize-y"
                />
                <p className="mt-1.5 text-[0.65rem] text-white/30">
                  Mise en forme : <code className="text-white/50">**Titre**</code> = sous-titre · <code className="text-white/50">- élément</code> = liste · <code className="text-white/50">![alt](url)</code> = image · ligne vide = nouveau paragraphe
                </p>
              </>
            ) : (
              <BlogPreview body={currentTr.body} title={currentTr.title} />
            )}
          </div>

          {/* ── SEO meta (per-locale) ── */}
          <details className="rounded-xl border border-white/10 bg-white/[0.02]">
            <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/55 hover:text-white">
              SEO — {LOCALE_LABELS[activeLocale]} (facultatif)
            </summary>
            <div className="space-y-3 px-4 pb-4">
              <div>
                <label className="block text-[0.7rem] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Meta title</label>
                <input
                  type="text"
                  value={currentTr.metaTitle}
                  onChange={(e) => updateTr(activeLocale, 'metaTitle', e.target.value)}
                  placeholder="Si vide, le titre sera utilisé."
                  className={inputCls}
                  maxLength={70}
                />
                <p className="mt-1 text-[0.65rem] text-white/30">{currentTr.metaTitle.length}/70</p>
              </div>
              <div>
                <label className="block text-[0.7rem] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Meta description</label>
                <textarea
                  value={currentTr.metaDescription}
                  onChange={(e) => updateTr(activeLocale, 'metaDescription', e.target.value)}
                  rows={2}
                  placeholder="Si vide, l'extrait (ou un extrait auto) sera utilisé."
                  className={inputCls + ' resize-y'}
                  maxLength={170}
                />
                <p className="mt-1 text-[0.65rem] text-white/30">{currentTr.metaDescription.length}/170</p>
              </div>
            </div>
          </details>
        </div>

        {/* ── Publish toggle (shared) ── */}
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 sm:px-5 space-y-4">
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
              onClick={() => updateShared('published', !form.published)}
              aria-label="Basculer l'état de publication"
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${form.published ? 'bg-green-500' : 'bg-white/15'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="border-t border-white/8 pt-4">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Date de publication (commune)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => updateShared('publishedAt', e.target.value)}
                className="flex-1 rounded-xl bg-white/[0.06] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-accent/40 focus:bg-white/[0.09] transition [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={() => updateShared('publishedAt', toLocalDatetimeInput(new Date()))}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/[0.08] hover:text-white transition"
              >
                Maintenant
              </button>
              {form.publishedAt && (
                <button
                  type="button"
                  onClick={() => updateShared('publishedAt', '')}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-white/50 hover:text-white transition"
                >
                  Effacer
                </button>
              )}
            </div>
            {(() => {
              if (!form.publishedAt) {
                return (
                  <p className="mt-2 text-[0.7rem] text-white/40">
                    Si vide, la date sera automatiquement renseignée à la première publication.
                  </p>
                );
              }
              const d = new Date(form.publishedAt);
              const future = d.getTime() > Date.now();
              return (
                <p className={`mt-2 text-[0.7rem] ${future ? 'text-amber-300/90' : 'text-white/45'}`}>
                  {future
                    ? `⏱ Programmé : sera publié le ${d.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}.`
                    : `Date affichée : ${d.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}.`}
                </p>
              );
            })()}
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

        <div className="h-2" />
      </form>

      <InlineImageInserter ref={imageInserterRef} onInsert={insertImageMarkdown} />

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0606]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0606]/80">
        <div className="max-w-4xl px-4 py-3 sm:px-6 lg:px-8 mx-0 lg:ml-[var(--admin-sidebar-width,0)] flex items-center gap-3">
          <div className="hidden sm:flex flex-1 min-w-0 items-center gap-3 text-xs text-white/40">
            <span className="truncate">
              {LOCALE_FLAGS[activeLocale]} {stats.words} mots · {stats.chars} car. · ~{stats.minutes} min
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
          const img = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (img) {
            // eslint-disable-next-line @next/next/no-img-element
            return <img key={i} src={img[2]} alt={img[1]} className="my-4 w-full rounded-lg border border-gray-200" />;
          }
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
