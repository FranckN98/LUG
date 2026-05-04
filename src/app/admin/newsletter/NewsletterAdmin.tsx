'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { buildCampaignHtml, buildMultilingualCampaignHtml, type MultilingualSection } from '@/lib/sendCampaignEmail';
import { NewsletterRichEditor } from '@/components/admin/NewsletterRichEditor';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  city: string | null;
  status: string;
  source: string;
  createdAt: string;
}

interface CampaignTranslation {
  locale: string;
  subject: string;
  previewText: string | null;
  titleText: string | null;
  bodyContent: string;
  ctaLabel: string | null;
  footerNote: string | null;
}

interface CampaignAttachment {
  id?: string;
  filename: string;
  url: string;
  contentType: string | null;
  size: number | null;
}

interface Campaign {
  id: string;
  subject: string;
  previewText: string | null;
  titleText: string | null;
  bodyContent: string;
  headerImageUrl: string | null;
  campaignImageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  footerNote: string | null;
  status: string;
  sentAt: string | null;
  sentCount: number;
  createdAt: string;
  translations?: CampaignTranslation[];
  attachments?: CampaignAttachment[];
}

// ── i18n ──────────────────────────────────────────────────────────────────
type CampaignLocale = 'fr' | 'en' | 'de';
const CAMPAIGN_LOCALES: CampaignLocale[] = ['fr', 'en', 'de'];
const LOCALE_FLAGS: Record<CampaignLocale, string> = { fr: '🇫🇷', en: '🇬🇧', de: '🇩🇪' };
const LOCALE_LABELS: Record<CampaignLocale, string> = { fr: 'Français', en: 'English', de: 'Deutsch' };

type CampaignTrFields = {
  subject: string;
  previewText: string;
  titleText: string;
  bodyContent: string;
  ctaLabel: string;
  footerNote: string;
};

const EMPTY_TR: CampaignTrFields = {
  subject: '',
  previewText: '',
  titleText: '',
  bodyContent: '',
  ctaLabel: '',
  footerNote: '',
};

type CampaignFormShape = {
  headerImageUrl: string;
  campaignImageUrl: string;
  ctaUrl: string;
  translations: Record<CampaignLocale, CampaignTrFields>;
  attachments: CampaignAttachment[];
};

const EMPTY_CAMPAIGN_FORM: CampaignFormShape = {
  headerImageUrl: '',
  campaignImageUrl: '',
  ctaUrl: '',
  translations: {
    fr: { ...EMPTY_TR },
    en: { ...EMPTY_TR },
    de: { ...EMPTY_TR },
  },
  attachments: [],
};

const EMPTY_ADD_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function displayName(s: Subscriber): string {
  if (s.firstName || s.lastName) return [s.firstName, s.lastName].filter(Boolean).join(' ');
  return s.name || '—';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Preview builder (pure, client-safe) ────────────────────────────────────────
function buildPreview(form: CampaignFormShape, locale: CampaignLocale): string {
  const tr = form.translations[locale];
  return buildCampaignHtml(
    {
      subject: tr.subject || '(sans objet)',
      previewText: tr.previewText || undefined,
      titleText: tr.titleText || undefined,
      bodyContent: tr.bodyContent || '(contenu vide)',
      headerImageUrl: form.headerImageUrl || undefined,
      campaignImageUrl: form.campaignImageUrl || undefined,
      ctaLabel: tr.ctaLabel || undefined,
      ctaUrl: form.ctaUrl || '#',
      footerNote: tr.footerNote || undefined,
    },
    '#',
    'https://www.levelupingermany.com',
  );
}

/**
 * Build the multilingual preview — exactly what subscribers will receive.
 * Sections are ordered by the active locale (preferred first), then the rest.
 */
function buildMultilingualPreview(form: CampaignFormShape, primaryLocale: CampaignLocale): string {
  const ordered: CampaignLocale[] = [
    primaryLocale,
    ...CAMPAIGN_LOCALES.filter((l) => l !== primaryLocale),
  ];
  const sections: MultilingualSection[] = ordered
    .map((locale): MultilingualSection | null => {
      const tr = form.translations[locale];
      if (!tr.subject.trim() || !tr.bodyContent.trim()) return null;
      return {
        locale,
        content: {
          subject: tr.subject,
          previewText: tr.previewText || undefined,
          titleText: tr.titleText || undefined,
          bodyContent: tr.bodyContent,
          headerImageUrl: form.headerImageUrl || undefined,
          campaignImageUrl: form.campaignImageUrl || undefined,
          ctaLabel: tr.ctaLabel || undefined,
          ctaUrl: form.ctaUrl || '#',
          footerNote: tr.footerNote || undefined,
        },
      };
    })
    .filter((x): x is MultilingualSection => x !== null);

  if (sections.length === 0) {
    // No language fully filled yet — fall back to a placeholder single-section preview
    return buildPreview(form, primaryLocale);
  }
  return buildMultilingualCampaignHtml(sections, '#', 'https://www.levelupingermany.com', sections[0].content.subject);
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-current/20 opacity-80">
        {icon}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm font-semibold text-white/70">{label}</p>
      <p className="mt-0.5 text-xs text-white/35">{sub}</p>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  if (status === 'active')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-700 text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Actif
      </span>
    );
  if (status === 'sent')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-700 text-blue-400">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        Envoyé
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-0.5 text-[11px] font-700 text-white/40">
      <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
      {status === 'unsubscribed' ? 'Désabonné' : status}
    </span>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({
  msg,
  kind,
  onClose,
}: {
  msg: string;
  kind: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-2xl transition-all ${
        kind === 'success' ? 'bg-emerald-600' : 'bg-red-700'
      }`}
    >
      {msg}
      <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function NewsletterAdmin() {
  const [tab, setTab] = useState<'subscribers' | 'campaigns'>('subscribers');

  // Data
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscriber UI
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);

  // Campaign UI
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [campaignForm, setCampaignForm] = useState<CampaignFormShape>(EMPTY_CAMPAIGN_FORM);
  const [activeLocale, setActiveLocale] = useState<CampaignLocale>('fr');
  const [translating, setTranslating] = useState<CampaignLocale | null>(null);
  const [translateError, setTranslateError] = useState('');
  const [translateProvider, setTranslateProvider] = useState<string | null>(null);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [campaignImageUploading, setCampaignImageUploading] = useState(false);
  const [campaignImageUploadError, setCampaignImageUploadError] = useState('');
  const campaignImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendResult, setSendResult] = useState<{ sentCount: number; errors?: string[] } | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const showToast = useCallback((msg: string, kind: 'success' | 'error' = 'success') => {
    setToast({ msg, kind });
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch('/api/admin/newsletter/subscribers'),
        fetch('/api/admin/newsletter/campaigns'),
      ]);
      if (sRes.ok) setSubscribers(await sRes.json());
      if (cRes.ok) setCampaigns(await cRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.status === 'active').length,
    unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length,
    sent: campaigns.filter((c) => c.status === 'sent').length,
  };

  // ── Filtered subscribers ───────────────────────────────────────────────────
  const filtered = subscribers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.email.toLowerCase().includes(q) ||
      displayName(s).toLowerCase().includes(q) ||
      (s.city ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Subscriber actions ─────────────────────────────────────────────────────
  async function handleAddSubscriber(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Erreur', 'error'); return; }
      showToast('Abonné ajouté avec succès');
      setAddForm(EMPTY_ADD_FORM);
      setShowAddForm(false);
      await fetchAll();
    } finally {
      setAddLoading(false);
    }
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const email = quickEmail.trim();
    if (!email) return;
    setQuickLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Erreur', 'error'); return; }
      showToast('Abonné ajouté · enrichissement automatique appliqué');
      setQuickEmail('');
      await fetchAll();
    } finally {
      setQuickLoading(false);
    }
  }

  async function handleToggleStatus(sub: Subscriber) {
    const newStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
    const res = await fetch(`/api/admin/newsletter/subscribers/${sub.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast(newStatus === 'active' ? 'Abonné réactivé' : 'Abonné désactivé');
      await fetchAll();
    } else {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  }

  async function handleDeleteSubscriber(sub: Subscriber) {
    if (!confirm(`Supprimer définitivement ${sub.email} ?`)) return;
    const res = await fetch(`/api/admin/newsletter/subscribers/${sub.id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Abonné supprimé');
      await fetchAll();
    } else {
      showToast('Erreur suppression', 'error');
    }
  }

  // ── Campaign actions ───────────────────────────────────────────────────────
  function openNewCampaign() {
    setEditingCampaign(null);
    setCampaignForm(EMPTY_CAMPAIGN_FORM);
    setActiveLocale('fr');
    setTranslateError('');
    setTranslateProvider(null);
    setIsNew(true);
    setShowPreview(false);
    setSendResult(null);
  }

  function openEditCampaign(c: Campaign) {
    setEditingCampaign(c);
    // Seed translations from the campaign's translations array; fallback to
    // legacy scalar fields on the FR locale when no translations exist yet.
    const trMap: Record<CampaignLocale, CampaignTrFields> = {
      fr: { ...EMPTY_TR },
      en: { ...EMPTY_TR },
      de: { ...EMPTY_TR },
    };
    if (c.translations && c.translations.length > 0) {
      for (const t of c.translations) {
        if ((CAMPAIGN_LOCALES as string[]).includes(t.locale)) {
          trMap[t.locale as CampaignLocale] = {
            subject: t.subject ?? '',
            previewText: t.previewText ?? '',
            titleText: t.titleText ?? '',
            bodyContent: t.bodyContent ?? '',
            ctaLabel: t.ctaLabel ?? '',
            footerNote: t.footerNote ?? '',
          };
        }
      }
    } else {
      trMap.fr = {
        subject: c.subject ?? '',
        previewText: c.previewText ?? '',
        titleText: c.titleText ?? '',
        bodyContent: c.bodyContent ?? '',
        ctaLabel: c.ctaLabel ?? '',
        footerNote: c.footerNote ?? '',
      };
    }
    setCampaignForm({
      headerImageUrl: c.headerImageUrl ?? '',
      campaignImageUrl: c.campaignImageUrl ?? '',
      ctaUrl: c.ctaUrl ?? '',
      translations: trMap,
      attachments: (c.attachments ?? []).map((a) => ({
        id: a.id,
        filename: a.filename,
        url: a.url,
        contentType: a.contentType ?? null,
        size: a.size ?? null,
      })),
    });
    setActiveLocale('fr');
    setTranslateError('');
    setTranslateProvider(null);
    setIsNew(false);
    setShowPreview(false);
    setSendResult(null);
  }

  function closeCampaignEditor() {
    setEditingCampaign(null);
    setIsNew(false);
    setSendResult(null);
    setLogoUploadError('');
    setCampaignImageUploadError('');
  }

  async function handleLogoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    setLogoUploading(true);
    setLogoUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'newsletter');
      fd.append('altText', 'Logo newsletter');

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || 'Échec du téléversement du logo';
        setLogoUploadError(msg);
        showToast(msg, 'error');
        return;
      }

      const uploadedUrl = data?.url;
      if (!uploadedUrl) {
        const msg = 'Upload réussi mais URL manquante';
        setLogoUploadError(msg);
        showToast(msg, 'error');
        return;
      }

      setCampaignForm((f) => ({ ...f, headerImageUrl: uploadedUrl }));
      showToast('Logo importé depuis votre ordinateur');
    } catch {
      const msg = 'Erreur réseau pendant le téléversement du logo';
      setLogoUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setLogoUploading(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  }

  async function handleCampaignImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    setCampaignImageUploading(true);
    setCampaignImageUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'newsletter');
      fd.append('altText', 'Image de campagne newsletter');

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || 'Échec du téléversement de l\'image de campagne';
        setCampaignImageUploadError(msg);
        showToast(msg, 'error');
        return;
      }

      const uploadedUrl = data?.url;
      if (!uploadedUrl) {
        const msg = 'Upload réussi mais URL manquante';
        setCampaignImageUploadError(msg);
        showToast(msg, 'error');
        return;
      }

      setCampaignForm((f) => ({ ...f, campaignImageUrl: uploadedUrl }));
      showToast('Image de campagne importée depuis votre ordinateur');
    } catch {
      const msg = 'Erreur réseau pendant le téléversement de l\'image';
      setCampaignImageUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setCampaignImageUploading(false);
      if (campaignImageFileInputRef.current) campaignImageFileInputRef.current.value = '';
    }
  }

  async function handleSaveCampaign() {
    // Determine locales with at least subject + body
    const filledLocales = CAMPAIGN_LOCALES.filter((l) => {
      const t = campaignForm.translations[l];
      return t.subject.trim() && t.bodyContent.trim();
    });
    if (filledLocales.length === 0) {
      showToast("Au moins une langue doit avoir un objet et un corps", 'error');
      return;
    }

    const translationsPayload: Partial<Record<CampaignLocale, CampaignTrFields>> = {};
    for (const l of filledLocales) {
      translationsPayload[l] = campaignForm.translations[l];
    }

    const payload = {
      headerImageUrl: campaignForm.headerImageUrl,
      campaignImageUrl: campaignForm.campaignImageUrl,
      ctaUrl: campaignForm.ctaUrl,
      translations: translationsPayload,
      attachments: campaignForm.attachments.map((a) => ({
        filename: a.filename,
        url: a.url,
        contentType: a.contentType,
        size: a.size,
      })),
    };

    setSavingCampaign(true);
    try {
      let res: Response;
      if (isNew) {
        res = await fetch('/api/admin/newsletter/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/newsletter/campaigns/${editingCampaign!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Erreur', 'error'); return; }
      showToast(isNew ? 'Brouillon créé' : 'Campagne mise à jour');
      if (isNew) { setIsNew(false); setEditingCampaign(data); }
      await fetchAll();
    } finally {
      setSavingCampaign(false);
    }
  }

  async function handleDeleteCampaign(c: Campaign) {
    if (!confirm(`Supprimer la campagne "${c.subject}" ?`)) return;
    const res = await fetch(`/api/admin/newsletter/campaigns/${c.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) { showToast('Campagne supprimée'); await fetchAll(); }
    else showToast(data.error || 'Erreur', 'error');
  }

  async function handleSendTest() {
    if (!testEmail) { showToast('Saisissez un email de test', 'error'); return; }
    const id = editingCampaign?.id;
    if (!id) { showToast('Sauvegardez d\'abord la campagne', 'error'); return; }
    setSendingTest(true);
    try {
      const res = await fetch(
        `/api/admin/newsletter/campaigns/${id}/send?testEmail=${encodeURIComponent(testEmail)}&testLocale=${activeLocale}`,
        { method: 'POST' },
      );
      const data = await res.json();
      if (res.ok) showToast(`Email de test (${LOCALE_LABELS[activeLocale]}) envoyé à ${testEmail}`);
      else showToast(data.error || 'Erreur envoi test', 'error');
    } finally {
      setSendingTest(false);
    }
  }

  async function handleSendAll() {
    const id = editingCampaign?.id;
    if (!id) { showToast('Sauvegardez d\'abord la campagne', 'error'); return; }
    if (
      !confirm(
        `Envoyer cette campagne à ${stats.active} abonné(s) actif(s) ?\n\nCette action est irréversible.`,
      )
    )
      return;
    setSendingAll(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSendResult({ sentCount: data.sentCount, errors: data.errors });
        showToast(`Campagne envoyée à ${data.sentCount} abonné(s)`);
        await fetchAll();
      } else {
        showToast(data.error || 'Erreur lors de l\'envoi', 'error');
      }
    } finally {
      setSendingAll(false);
    }
  }

  // ── Preview HTML ───────────────────────────────────────────────────────────
  const [previewMode, setPreviewMode] = useState<'single' | 'multi'>('multi');
  const previewHtml =
    previewMode === 'multi'
      ? buildMultilingualPreview(campaignForm, activeLocale)
      : buildPreview(campaignForm, activeLocale);

  // ── Per-locale helpers ─────────────────────────────────────────────────────
  const currentTr = campaignForm.translations[activeLocale];
  const updateTr = useCallback((locale: CampaignLocale, key: keyof CampaignTrFields, value: string) => {
    setCampaignForm((f) => ({
      ...f,
      translations: {
        ...f.translations,
        [locale]: { ...f.translations[locale], [key]: value },
      },
    }));
  }, []);

  const localeStatus = (l: CampaignLocale): 'empty' | 'partial' | 'complete' => {
    const t = campaignForm.translations[l];
    const filled = [t.subject, t.bodyContent].filter((s) => s.trim()).length;
    if (filled === 0) return 'empty';
    if (filled === 2) return 'complete';
    return 'partial';
  };

  const copyTrFromLocale = (source: CampaignLocale) => {
    if (source === activeLocale) return;
    setCampaignForm((f) => ({
      ...f,
      translations: { ...f.translations, [activeLocale]: { ...f.translations[source] } },
    }));
  };

  const translateTrFromLocale = async (source: CampaignLocale) => {
    if (source === activeLocale) return;
    const src = campaignForm.translations[source];
    if (!src.subject.trim() && !src.bodyContent.trim()) {
      setTranslateError(`La langue source (${LOCALE_LABELS[source]}) est vide.`);
      return;
    }
    setTranslateError('');
    setTranslateProvider(null);
    setTranslating(source);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          target: activeLocale,
          fields: {
            subject: src.subject,
            previewText: src.previewText,
            titleText: src.titleText,
            bodyContent: src.bodyContent,
            ctaLabel: src.ctaLabel,
            footerNote: src.footerNote,
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const j = await res.json() as { provider?: string; values?: Record<string, string> };
      const v = j.values ?? {};
      setCampaignForm((f) => ({
        ...f,
        translations: {
          ...f.translations,
          [activeLocale]: {
            subject: v.subject ?? f.translations[activeLocale].subject,
            previewText: v.previewText ?? f.translations[activeLocale].previewText,
            titleText: v.titleText ?? f.translations[activeLocale].titleText,
            bodyContent: v.bodyContent ?? f.translations[activeLocale].bodyContent,
            ctaLabel: v.ctaLabel ?? f.translations[activeLocale].ctaLabel,
            footerNote: v.footerNote ?? f.translations[activeLocale].footerNote,
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

  // ── Attachments uploader ───────────────────────────────────────────────────
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-uploading the same file
    if (files.length === 0) return;
    setAttachmentError(null);
    setUploadingAttachment(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/newsletter/attachments', { method: 'POST', body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `Échec de l'upload de ${file.name}`);
        }
        const j = (await res.json()) as CampaignAttachment;
        setCampaignForm((f) => ({ ...f, attachments: [...f.attachments, j] }));
      }
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : 'Échec de l\'upload');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachment = (index: number) => {
    setCampaignForm((f) => ({
      ...f,
      attachments: f.attachments.filter((_, i) => i !== index),
    }));
  };

  const totalAttachmentsBytes = campaignForm.attachments.reduce(
    (sum, a) => sum + (a.size ?? 0),
    0,
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-accent/70">
          Administration
        </p>
        <h1 className="text-2xl font-bold text-white">Newsletter</h1>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total abonnés"
          value={stats.total}
          sub="base complète"
          color="bg-white/4 border-white/8"
          icon={
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Actifs"
          value={stats.active}
          sub="reçoivent les emails"
          color="bg-emerald-500/10 border-emerald-500/20"
          icon={
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Désabonnés"
          value={stats.unsubscribed}
          sub="exclus des envois"
          color="bg-white/4 border-white/8"
          icon={
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
        <StatCard
          label="Campagnes envoyées"
          value={stats.sent}
          sub={`${campaigns.length} au total`}
          color="bg-blue-500/10 border-blue-500/20"
          icon={
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* ── Tab nav ───────────────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1 w-fit">
        {(['subscribers', 'campaigns'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); closeCampaignEditor(); }}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'subscribers' ? `Abonnés (${stats.total})` : `Campagnes (${campaigns.length})`}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB: ABONNÉS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === 'subscribers' && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-52">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par nom, email, ville…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent/40 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-accent/40 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs seulement</option>
              <option value="unsubscribed">Désabonnés</option>
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un abonné
            </button>
          </div>

          {/* Quick-add row */}
          <form
            onSubmit={handleQuickAdd}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3"
          >
            <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
              Ajout rapide
            </span>
            <div className="flex-1">
              <input
                type="email"
                placeholder="email@exemple.com"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent/40 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={quickLoading || !quickEmail.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              {quickLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              Ajouter
            </button>
          </form>

          {/* Add form (full) */}
          {showAddForm && (
            <form
              onSubmit={handleAddSubscriber}
              className="rounded-2xl border border-white/10 bg-white/4 p-5 space-y-4"
            >
              <p className="text-sm font-bold text-white/80 mb-1">Nouvel abonné</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Adresse"
                  value={addForm.address}
                  onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={addForm.city}
                  onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/80 disabled:opacity-50 transition-colors"
                >
                  {addLoading ? 'Ajout…' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setAddForm(EMPTY_ADD_FORM); }}
                  className="rounded-xl border border-white/10 px-5 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          {loading ? (
            <p className="text-sm text-white/40 py-8 text-center">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-white/40 py-8 text-center">Aucun abonné trouvé.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="hidden md:table-cell px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="hidden sm:table-cell px-4 py-3">Inscription</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`border-b border-white/5 hover:bg-white/3 transition-colors ${
                        i % 2 === 0 ? '' : 'bg-white/[0.015]'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-white/80 whitespace-nowrap">
                        {displayName(s)}
                      </td>
                      <td className="px-4 py-3 text-white/60 max-w-xs truncate">{s.email}</td>
                      <td className="hidden md:table-cell px-4 py-3 text-white/40">
                        {s.city || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={s.status} />
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-white/30 whitespace-nowrap">
                        {fmtDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(s)}
                            title={s.status === 'active' ? 'Désabonner' : 'Réactiver'}
                            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/50 hover:border-accent/40 hover:text-white/80 transition-colors"
                          >
                            {s.status === 'active' ? 'Désabonner' : 'Réactiver'}
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(s)}
                            title="Supprimer"
                            className="rounded-lg border border-white/10 p-1.5 text-white/30 hover:border-red-500/40 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-2.5 text-[11px] text-white/25">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
                {search || statusFilter !== 'all' ? ' (filtrés)' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: CAMPAGNES
      ════════════════════════════════════════════════════════════════════ */}
      {tab === 'campaigns' && (
        <>
          {/* ── Campaign editor ─────────────────────────────────────────── */}
          {(isNew || editingCampaign) ? (
            <div className="space-y-5">
              {/* Editor header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/30">
                    {isNew ? 'Nouvelle campagne' : 'Modifier la campagne'}
                  </p>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {currentTr.subject || campaignForm.translations.fr.subject || '(sans objet)'}
                  </h2>
                </div>
                <button
                  onClick={closeCampaignEditor}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  ← Retour aux campagnes
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* ── Left: Form ─────────────────────────────────────── */}
                <div className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-5">
                  {/* ── Language tabs ── */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mr-1">Langue&nbsp;:</span>
                      {CAMPAIGN_LOCALES.map((l) => {
                        const status = localeStatus(l);
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
                      {CAMPAIGN_LOCALES.filter((l) => l !== activeLocale && localeStatus(l) !== 'empty').length > 0 && (
                        <div className="ml-auto flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-white/35">Copier&nbsp;:</span>
                          {CAMPAIGN_LOCALES.filter((l) => l !== activeLocale && localeStatus(l) !== 'empty').map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => copyTrFromLocale(l)}
                              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition"
                              title={`Copier ${LOCALE_LABELS[l]} → ${LOCALE_LABELS[activeLocale]}`}
                            >
                              {LOCALE_FLAGS[l]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Auto-translate row */}
                    {CAMPAIGN_LOCALES.filter((l) => l !== activeLocale && localeStatus(l) !== 'empty').length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/20 bg-accent/[0.05] px-3 py-2">
                        <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                          Traduire vers {LOCALE_LABELS[activeLocale]} depuis&nbsp;:
                        </span>
                        {CAMPAIGN_LOCALES.filter((l) => l !== activeLocale && localeStatus(l) !== 'empty').map((l) => {
                          const isLoading = translating === l;
                          return (
                            <button
                              key={l}
                              type="button"
                              onClick={() => translateTrFromLocale(l)}
                              disabled={!!translating}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-[10px] font-semibold text-accent hover:bg-accent/25 transition disabled:opacity-50 disabled:cursor-wait"
                              title={`Traduire automatiquement ${LOCALE_LABELS[l]} → ${LOCALE_LABELS[activeLocale]} (écrase l'onglet courant)`}
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
                          <span className="ml-auto text-[10px] text-white/40">✓ via {translateProvider}</span>
                        )}
                        {translateError && (
                          <span className="ml-auto text-[10px] text-red-300">⚠ {translateError}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section: Enveloppe */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">Enveloppe — {LOCALE_LABELS[activeLocale]}</p>
                  <div>
                    <label className="field-label">Objet de l&apos;email *</label>
                    <input
                      type="text"
                      value={currentTr.subject}
                      onChange={(e) => updateTr(activeLocale, 'subject', e.target.value)}
                      placeholder="ex : Notre événement 2026 approche…"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="field-label">Texte de prévisualisation <span className="text-white/25">(affiché avant ouverture)</span></label>
                    <input
                      type="text"
                      value={currentTr.previewText}
                      onChange={(e) => updateTr(activeLocale, 'previewText', e.target.value)}
                      placeholder="Résumé court affiché dans la boîte mail…"
                      className="input-field"
                    />
                  </div>

                  {/* Section: Contenu */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60 pt-2">Contenu</p>
                  <div>
                    <label className="field-label">Image / logo en-tête <span className="text-white/25">(URL ou fichier local)</span></label>
                    <input
                      type="url"
                      value={campaignForm.headerImageUrl}
                      onChange={(e) => setCampaignForm((f) => ({ ...f, headerImageUrl: e.target.value }))}
                      placeholder="https://… ou /media/logo.png"
                      className="input-field"
                    />

                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleLogoUpload(e.target.files)}
                    />

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        disabled={logoUploading}
                        className="rounded-lg border border-accent/25 bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/25 disabled:opacity-60"
                      >
                        {logoUploading ? 'Import...' : 'Importer depuis mon PC'}
                      </button>
                      {campaignForm.headerImageUrl && (
                        <button
                          type="button"
                          onClick={() => setCampaignForm((f) => ({ ...f, headerImageUrl: '' }))}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:text-white"
                        >
                          Retirer le logo
                        </button>
                      )}
                    </div>

                    {logoUploadError && (
                      <p className="mt-2 text-xs text-red-400">{logoUploadError}</p>
                    )}

                    {campaignForm.headerImageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-[#130505] p-3 text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={campaignForm.headerImageUrl}
                          alt="Aperçu logo"
                          className="inline-block max-h-20 max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="field-label">Image principale de campagne <span className="text-white/25">(URL ou fichier local)</span></label>
                    <input
                      type="url"
                      value={campaignForm.campaignImageUrl}
                      onChange={(e) => setCampaignForm((f) => ({ ...f, campaignImageUrl: e.target.value }))}
                      placeholder="https://… ou /media/campaign-image.png"
                      className="input-field"
                    />

                    <input
                      ref={campaignImageFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleCampaignImageUpload(e.target.files)}
                    />

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => campaignImageFileInputRef.current?.click()}
                        disabled={campaignImageUploading}
                        className="rounded-lg border border-accent/25 bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/25 disabled:opacity-60"
                      >
                        {campaignImageUploading ? 'Import...' : 'Importer image campagne depuis mon PC'}
                      </button>
                      {campaignForm.campaignImageUrl && (
                        <button
                          type="button"
                          onClick={() => setCampaignForm((f) => ({ ...f, campaignImageUrl: '' }))}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:text-white"
                        >
                          Retirer l&apos;image
                        </button>
                      )}
                    </div>

                    {campaignImageUploadError && (
                      <p className="mt-2 text-xs text-red-400">{campaignImageUploadError}</p>
                    )}

                    {campaignForm.campaignImageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-[#130505] p-3 text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={campaignForm.campaignImageUrl}
                          alt="Aperçu image campagne"
                          className="inline-block max-h-28 max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="field-label">Titre principal — {LOCALE_LABELS[activeLocale]}</label>
                    <input
                      type="text"
                      value={currentTr.titleText}
                      onChange={(e) => updateTr(activeLocale, 'titleText', e.target.value)}
                      placeholder="ex : Rejoignez-nous pour Level Up 2026"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="field-label">Corps du message * — {LOCALE_LABELS[activeLocale]} <span className="text-white/25">(éditeur riche : gras, liens, images, boutons…)</span></label>
                    <NewsletterRichEditor
                      value={currentTr.bodyContent}
                      onChange={(html) => updateTr(activeLocale, 'bodyContent', html)}
                      placeholder="Rédigez votre message… utilisez la barre d'outils pour ajouter des titres, listes, liens, images et boutons."
                      minHeight={260}
                    />
                    <div className="mt-2 rounded-lg border border-accent/20 bg-accent/[0.04] px-3 py-2 text-[11px] leading-relaxed text-white/70">
                      <p className="font-semibold text-accent/90 mb-1">💡 Personnalisation par prénom (optionnelle)</p>
                      <p>Insère un de ces marqueurs dans le sujet, le titre ou le corps — ils seront remplacés automatiquement pour chaque abonné :</p>
                      <ul className="mt-1 ml-3 space-y-0.5">
                        <li><code className="text-accent">{'{{greeting}}'}</code> → <em>« Bonjour Marie, »</em> ou <em>« Bonjour, »</em> si le prénom est inconnu</li>
                        <li><code className="text-accent">{'{{firstName}}'}</code> → <em>« Marie »</em> ou <em>vide</em> si inconnu</li>
                        <li><code className="text-accent">{'{{firstName|cher ami}}'}</code> → <em>« Marie »</em> ou <em>« cher ami »</em> en repli</li>
                      </ul>
                      <p className="mt-1 text-white/50">Exemple : <code className="text-white/80">{'{{greeting}}'} Voici les nouveautés de la semaine…</code></p>
                    </div>
                  </div>

                  {/* Section: CTA */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60 pt-2">Bouton d&apos;action (optionnel)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">Texte du bouton — {LOCALE_LABELS[activeLocale]}</label>
                      <input
                        type="text"
                        value={currentTr.ctaLabel}
                        onChange={(e) => updateTr(activeLocale, 'ctaLabel', e.target.value)}
                        placeholder="ex : Je m'inscris"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="field-label">URL du bouton <span className="text-white/25">(commune)</span></label>
                      <input
                        type="url"
                        value={campaignForm.ctaUrl}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, ctaUrl: e.target.value }))}
                        placeholder="https://…"
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Section: Attachments (shared across locales) */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60 pt-2">
                    Pièces jointes <span className="text-white/30 normal-case font-normal">(PDF, Word, Excel, images… — communes à toutes les langues)</span>
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => attachmentInputRef.current?.click()}
                        disabled={uploadingAttachment}
                        className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/25 transition disabled:opacity-50 disabled:cursor-wait"
                      >
                        {uploadingAttachment ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-accent/40 border-t-accent animate-spin" />
                            Upload en cours…
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Ajouter des fichiers
                          </>
                        )}
                      </button>
                      <input
                        ref={attachmentInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.csv,.txt,.json,image/*"
                        className="hidden"
                        onChange={handleAttachmentUpload}
                      />
                      <span className="text-[11px] text-white/45">
                        Max. 15 Mo / fichier · 30 Mo au total
                      </span>
                      {campaignForm.attachments.length > 0 && (
                        <span className="ml-auto text-[11px] text-white/60">
                          {campaignForm.attachments.length} fichier{campaignForm.attachments.length > 1 ? 's' : ''} · {formatFileSize(totalAttachmentsBytes)}
                        </span>
                      )}
                    </div>

                    {attachmentError && (
                      <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                        ⚠ {attachmentError}
                      </div>
                    )}

                    {campaignForm.attachments.length === 0 ? (
                      <p className="text-[12px] text-white/40 italic">
                        Aucune pièce jointe — chaque destinataire recevra simplement le corps du mail.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {campaignForm.attachments.map((a, idx) => (
                          <li
                            key={`${a.url}-${idx}`}
                            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                          >
                            <span className="text-base" aria-hidden>
                              {a.contentType?.startsWith('image/') ? '🖼️' :
                                a.contentType === 'application/pdf' ? '📄' :
                                a.contentType?.includes('word') ? '📝' :
                                a.contentType?.includes('sheet') || a.contentType?.includes('excel') ? '📊' :
                                a.contentType?.includes('zip') ? '🗜️' : '📎'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-[13px] font-medium text-white hover:text-accent transition"
                                title={a.filename}
                              >
                                {a.filename}
                              </a>
                              <p className="text-[10px] text-white/40">
                                {a.contentType ?? 'fichier'}
                                {a.size ? ` · ${formatFileSize(a.size)}` : ''}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/50 hover:text-red-300 hover:border-red-400/30 hover:bg-red-500/10 transition"
                              title="Retirer cette pièce jointe"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Section: Footer */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60 pt-2">Footer (optionnel) — {LOCALE_LABELS[activeLocale]}</p>
                  <div>
                    <label className="field-label">Note de bas de page</label>
                    <input
                      type="text"
                      value={currentTr.footerNote}
                      onChange={(e) => updateTr(activeLocale, 'footerNote', e.target.value)}
                      placeholder="ex : Vous recevez cet email car vous vous êtes inscrit lors de…"
                      className="input-field"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={handleSaveCampaign}
                      disabled={savingCampaign}
                      className="rounded-xl bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-50 transition-colors"
                    >
                      {savingCampaign ? 'Sauvegarde…' : '💾 Sauvegarder le brouillon'}
                    </button>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:text-white transition-colors xl:hidden"
                    >
                      {showPreview ? 'Masquer l\'aperçu' : '👁 Aperçu'}
                    </button>
                  </div>

                  {/* ── Send section ──── */}
                  {!isNew && editingCampaign && (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-4 mt-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">Envoi</p>

                      {/* Send test */}
                      <div>
                        <label className="field-label">Email de test</label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="input-field flex-1"
                          />
                          <button
                            onClick={handleSendTest}
                            disabled={sendingTest}
                            className="rounded-xl border border-white/20 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/12 hover:text-white disabled:opacity-50 whitespace-nowrap transition-colors"
                          >
                            {sendingTest ? 'Envoi…' : 'Envoyer test'}
                          </button>
                        </div>
                      </div>

                      {/* Send all */}
                      {editingCampaign.status !== 'sent' ? (
                        <div>
                          <button
                            onClick={handleSendAll}
                            disabled={sendingAll || stats.active === 0}
                            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/80 disabled:opacity-50 transition-colors"
                          >
                            {sendingAll
                              ? 'Envoi en cours…'
                              : `🚀 Envoyer à ${stats.active} abonné${stats.active !== 1 ? 's' : ''} actif${stats.active !== 1 ? 's' : ''}`}
                          </button>
                          <p className="mt-2 text-[11px] text-white/30 text-center">
                            Cette action est irréversible. Les désabonnés sont automatiquement exclus.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-300">
                          ✅ Campagne déjà envoyée à {editingCampaign.sentCount} abonné(s)
                          {editingCampaign.sentAt && ` le ${fmtDate(editingCampaign.sentAt)}`}
                        </div>
                      )}

                      {/* Send result */}
                      {sendResult && (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 space-y-1">
                          <p className="font-semibold">✅ {sendResult.sentCount} email{sendResult.sentCount !== 1 ? 's' : ''} envoyé{sendResult.sentCount !== 1 ? 's' : ''}</p>
                          {sendResult.errors && sendResult.errors.length > 0 && (
                            <div>
                              <p className="text-yellow-300 font-semibold">{sendResult.errors.length} erreur(s) :</p>
                              {sendResult.errors.map((e, i) => (
                                <p key={i} className="text-[11px] text-white/40 font-mono">{e}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Right: Preview ─────────────────────────────────── */}
                <div className={`space-y-3 ${showPreview ? 'block' : 'hidden xl:block'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
                      Aperçu email
                    </p>
                    <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('multi')}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
                          previewMode === 'multi'
                            ? 'bg-accent/20 text-white'
                            : 'text-white/45 hover:text-white'
                        }`}
                        title="Aperçu de l'email tel qu'il sera envoyé (toutes les langues stackées)"
                      >
                        🌍 Multilingue (envoi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('single')}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
                          previewMode === 'single'
                            ? 'bg-accent/20 text-white'
                            : 'text-white/45 hover:text-white'
                        }`}
                        title="Aperçu langue par langue (édition)"
                      >
                        {LOCALE_FLAGS[activeLocale]} Langue active
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#f0eded]" style={{ height: '640px' }}>
                    <iframe
                      srcDoc={previewHtml}
                      title="Aperçu email"
                      className="w-full h-full border-none"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Campaign list ──────────────────────────────────────────── */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/40">
                  {campaigns.length} campagne{campaigns.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={openNewCampaign}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer une campagne
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-white/40 py-8 text-center">Chargement…</p>
              ) : campaigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                  <p className="text-white/30 text-sm mb-4">Aucune campagne pour l&apos;instant.</p>
                  <button
                    onClick={openNewCampaign}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/80 transition-colors"
                  >
                    Créer ma première campagne
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-wrap items-center gap-4 hover:border-white/15 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <Badge status={c.status} />
                          <p className="text-sm font-bold text-white truncate">{c.subject}</p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-white/30 flex-wrap">
                          <span>Créée le {fmtDate(c.createdAt)}</span>
                          {c.status === 'sent' && (
                            <span className="text-blue-400/70">
                              Envoyée à {c.sentCount} abonn{c.sentCount !== 1 ? 'és' : 'é'}
                              {c.sentAt && ` · ${fmtDate(c.sentAt)}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openEditCampaign(c)}
                          className="rounded-xl border border-white/10 px-3.5 py-2 text-xs font-semibold text-white/60 hover:text-white hover:border-white/25 transition-colors"
                        >
                          {c.status === 'sent' ? '👁 Voir' : '✏️ Modifier'}
                        </button>
                        {c.status !== 'sent' && (
                          <button
                            onClick={() => handleDeleteCampaign(c)}
                            className="rounded-xl border border-white/10 p-2 text-white/30 hover:border-red-500/40 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast msg={toast.msg} kind={toast.kind} onClose={() => setToast(null)} />
      )}

      {/* ── Tailwind utility classes via style tag ─────────────────────── */}
      <style>{`
        .input-field {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          padding: 10px 14px;
          font-size: 13px;
          color: white;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: rgba(255,255,255,0.25);
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.25);
        }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}
