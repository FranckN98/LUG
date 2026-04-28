'use client';

import { useEffect, useState } from 'react';

type SiteConfig = {
  headerLogoUrl: string;
  headerJoinLabelFr: string;
  headerJoinLabelDe: string;
  headerJoinLabelEn: string;
  headerJoinLink: string;
  headerJoinOpenInNewTab: boolean;
  headerSponsorLabelFr: string;
  headerSponsorLabelDe: string;
  headerSponsorLabelEn: string;
  headerSponsorLink: string;
  headerSponsorOpenInNewTab: boolean;
  headerJoinColorVariant: string;
  headerSponsorColorVariant: string;
  membershipHeroHeadingFr: string;
  membershipHeroHeadingDe: string;
  membershipHeroHeadingEn: string;
  membershipHeroSubFr: string;
  membershipHeroSubDe: string;
  membershipHeroSubEn: string;
  membershipHeroBgUrl: string;
};

const inputCls =
  'w-full rounded-lg bg-white/[0.08] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition';
const selectCls =
  'w-full rounded-lg bg-[#190c0c] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition';
const selectReadableCls =
  'w-full rounded-lg bg-white border border-white/10 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1';
const sectionCls = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5';

const SITE_ROUTES = [
  { label: 'Accueil', value: '/' },
  { label: 'Evenements', value: '/events' },
  { label: 'Conference annuelle', value: '/annual-conference' },
  { label: 'Workshops', value: '/programme/workshops' },
  { label: 'Mentoring', value: '/programme/mentoring' },
  { label: 'Partenaires', value: '/partners' },
  { label: 'Contact', value: '/contact' },
  { label: 'Newsletter', value: '/newsletter' },
  { label: 'Devenir membre', value: '/membership' },
  { label: 'Formulaire adhesion membre', value: '/membership#membership-form' },
  { label: 'Blog & Impact', value: '/blog-impact' },
  { label: 'Sponsor & Dons', value: '/sponsor-donate' },
  { label: 'Qui sommes-nous', value: '/who-we-are' },
  { label: 'Galerie communaute', value: '/community' },
];

const COLOR_VARIANTS = [
  { value: 'red', label: 'Rouge', preview: 'bg-[#8c1a1a]' },
  { value: 'yellow', label: 'Jaune', preview: 'bg-[#e98c0b]' },
  { value: 'white', label: 'Blanc (verre)', preview: 'bg-white border border-gray-300' },
  { value: 'black', label: 'Noir', preview: 'bg-[#0f0606]' },
  { value: 'outline-white', label: 'Contour blanc', preview: 'border-2 border-white bg-transparent' },
  { value: 'outline-red', label: 'Contour rouge', preview: 'border-2 border-[#8c1a1a] bg-transparent' },
];

function isExternalLink(link: string): boolean {
  return /^https?:\/\//i.test(link.trim());
}

function buttonVariantPreviewClass(variant: string): string {
  switch (variant) {
    case 'red':
      return 'bg-[#8c1a1a] text-white border border-[#8c1a1a]';
    case 'yellow':
      return 'bg-[#e98c0b] text-white border border-[#e98c0b]';
    case 'white':
      return 'bg-white text-slate-900 border border-white';
    case 'black':
      return 'bg-[#0f0606] text-white border border-[#0f0606]';
    case 'outline-white':
      return 'bg-transparent text-white border border-white';
    case 'outline-red':
      return 'bg-transparent text-[#8c1a1a] border border-[#8c1a1a]';
    default:
      return 'bg-[#8c1a1a] text-white border border-[#8c1a1a]';
  }
}

function LangBlock({
  fr,
  de,
  en,
  onFr,
  onDe,
  onEn,
  baseLabel,
}: {
  fr: string;
  de: string;
  en: string;
  onFr: (v: string) => void;
  onDe: (v: string) => void;
  onEn: (v: string) => void;
  baseLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className={labelCls}>{baseLabel} FR</label>
        <input type="text" value={fr} onChange={(e) => onFr(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{baseLabel} DE</label>
        <input type="text" value={de} onChange={(e) => onDe(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{baseLabel} EN</label>
        <input type="text" value={en} onChange={(e) => onEn(e.target.value)} className={inputCls} />
      </div>
    </div>
  );
}

function LinkField({
  linkType,
  linkTarget,
  onType,
  onTarget,
}: {
  linkType: 'internal' | 'external';
  linkTarget: string;
  onType: (v: 'internal' | 'external') => void;
  onTarget: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className={labelCls}>Type de lien</label>
        <select
          value={linkType}
          onChange={(e) => onType(e.target.value as 'internal' | 'external')}
          className={selectCls}
        >
          <option value="internal">Interne (page du site)</option>
          <option value="external">Externe (URL complete)</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Destination</label>
        {linkType === 'internal' ? (
          <select
            value={linkTarget}
            onChange={(e) => onTarget(e.target.value)}
            className={selectReadableCls}
          >
            <option value="">Choisir une page</option>
            {SITE_ROUTES.map((route) => (
              <option key={route.value} value={route.value}>
                {route.label} ({route.value})
              </option>
            ))}
          </select>
        ) : (
          <input
            type="url"
            value={linkTarget}
            onChange={(e) => onTarget(e.target.value)}
            placeholder="https://..."
            className={inputCls}
          />
        )}
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className={`${labelCls} mb-2`}>Couleur du bouton</p>
      <div className="flex flex-wrap gap-2">
        {COLOR_VARIANTS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
              value === c.value
                ? 'border-accent/60 bg-accent/15 text-white'
                : 'border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            <span className={`h-3.5 w-3.5 rounded-full shrink-0 ${c.preview}`} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function emptyConfig(): SiteConfig {
  return {
    headerLogoUrl: '',
    headerJoinLabelFr: 'Rejoindre',
    headerJoinLabelDe: 'Mitglied werden',
    headerJoinLabelEn: 'Join',
    headerJoinLink: '/contact',
    headerJoinOpenInNewTab: false,
    headerSponsorLabelFr: 'Sponsor / Don',
    headerSponsorLabelDe: 'Sponsor / Spenden',
    headerSponsorLabelEn: 'Sponsor / Donate',
    headerSponsorLink: '/sponsor-donate',
    headerSponsorOpenInNewTab: false,
    headerJoinColorVariant: 'red',
    headerSponsorColorVariant: 'yellow',
    membershipHeroHeadingFr: 'Devenir membre',
    membershipHeroHeadingDe: 'Mitglied werden',
    membershipHeroHeadingEn: 'Become a member',
    membershipHeroSubFr: 'Rejoignez notre association et contribuez a faire grandir Level Up in Germany.',
    membershipHeroSubDe: 'Treten Sie unserem Verein bei und helfen Sie Level Up in Germany zu wachsen.',
    membershipHeroSubEn: 'Join our association and help Level Up in Germany grow.',
    membershipHeroBgUrl: '',
  };
}

export default function SiteConfigAdmin() {
  const [form, setForm] = useState<SiteConfig>(emptyConfig());
  const [joinLinkType, setJoinLinkType] = useState<'internal' | 'external'>('internal');
  const [sponsorLinkType, setSponsorLinkType] = useState<'internal' | 'external'>('internal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  function flash(type: 'ok' | 'err', text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/site-config');
        const data = await res.json();
        if (!mounted) return;
        setForm((prev) => ({
          ...prev,
          headerLogoUrl: data?.headerLogoUrl ?? prev.headerLogoUrl,
          headerJoinLabelFr: data?.headerJoinLabelFr ?? prev.headerJoinLabelFr,
          headerJoinLabelDe: data?.headerJoinLabelDe ?? prev.headerJoinLabelDe,
          headerJoinLabelEn: data?.headerJoinLabelEn ?? prev.headerJoinLabelEn,
          headerJoinLink: data?.headerJoinLink ?? prev.headerJoinLink,
          headerJoinOpenInNewTab: !!data?.headerJoinOpenInNewTab,
          headerSponsorLabelFr: data?.headerSponsorLabelFr ?? prev.headerSponsorLabelFr,
          headerSponsorLabelDe: data?.headerSponsorLabelDe ?? prev.headerSponsorLabelDe,
          headerSponsorLabelEn: data?.headerSponsorLabelEn ?? prev.headerSponsorLabelEn,
          headerSponsorLink: data?.headerSponsorLink ?? prev.headerSponsorLink,
          headerSponsorOpenInNewTab: !!data?.headerSponsorOpenInNewTab,
          headerJoinColorVariant: data?.headerJoinColorVariant ?? prev.headerJoinColorVariant,
          headerSponsorColorVariant: data?.headerSponsorColorVariant ?? prev.headerSponsorColorVariant,
          membershipHeroHeadingFr: data?.membershipHeroHeadingFr ?? prev.membershipHeroHeadingFr,
          membershipHeroHeadingDe: data?.membershipHeroHeadingDe ?? prev.membershipHeroHeadingDe,
          membershipHeroHeadingEn: data?.membershipHeroHeadingEn ?? prev.membershipHeroHeadingEn,
          membershipHeroSubFr: data?.membershipHeroSubFr ?? prev.membershipHeroSubFr,
          membershipHeroSubDe: data?.membershipHeroSubDe ?? prev.membershipHeroSubDe,
          membershipHeroSubEn: data?.membershipHeroSubEn ?? prev.membershipHeroSubEn,
          membershipHeroBgUrl: data?.membershipHeroBgUrl ?? prev.membershipHeroBgUrl,
        }));
        const loadedJoinLink = data?.headerJoinLink ?? emptyConfig().headerJoinLink;
        const loadedSponsorLink = data?.headerSponsorLink ?? emptyConfig().headerSponsorLink;
        setJoinLinkType(isExternalLink(loadedJoinLink) ? 'external' : 'internal');
        setSponsorLinkType(isExternalLink(loadedSponsorLink) ? 'external' : 'internal');
      } catch {
        flash('err', 'Erreur lors du chargement de la configuration.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const set = (key: keyof SiteConfig) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [key]: v }));

  async function save() {
    if (!form.headerJoinLink.trim() || !form.headerSponsorLink.trim()) {
      flash('err', 'Les liens des deux boutons header sont requis.');
      return;
    }
    if (joinLinkType === 'external' && !isExternalLink(form.headerJoinLink)) {
      flash('err', 'Le lien externe du bouton Rejoindre doit commencer par http:// ou https://');
      return;
    }
    if (sponsorLinkType === 'external' && !isExternalLink(form.headerSponsorLink)) {
      flash('err', 'Le lien externe du bouton Sponsor doit commencer par http:// ou https://');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      flash('ok', 'Configuration enregistree.');
    } catch {
      flash('err', 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-white/30 text-sm">Chargement…</div>;
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
          msg.type === 'ok' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      <div className={sectionCls}>
        <h2 className="text-lg font-bold text-white mb-4">Barre Header</h2>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>URL logo (optionnel)</label>
            <input
              type="text"
              value={form.headerLogoUrl}
              onChange={(e) => set('headerLogoUrl')(e.target.value)}
              placeholder="/logo_neu.png ou https://..."
              className={inputCls}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
            <h3 className="text-sm font-bold text-white">Bouton Header 1: Rejoindre</h3>
            <LangBlock
              fr={form.headerJoinLabelFr}
              de={form.headerJoinLabelDe}
              en={form.headerJoinLabelEn}
              onFr={(v) => set('headerJoinLabelFr')(v)}
              onDe={(v) => set('headerJoinLabelDe')(v)}
              onEn={(v) => set('headerJoinLabelEn')(v)}
              baseLabel="Label"
            />
            <LinkField
              linkType={joinLinkType}
              linkTarget={form.headerJoinLink}
              onType={(v) => {
                setJoinLinkType(v);
                if (v === 'internal' && isExternalLink(form.headerJoinLink)) set('headerJoinLink')('/contact');
                if (v === 'external' && !isExternalLink(form.headerJoinLink)) set('headerJoinLink')('https://');
              }}
              onTarget={(v) => set('headerJoinLink')(v)}
            />
            <p className="text-[11px] text-white/35 -mt-1">
              Astuce: pour envoyer directement au formulaire membre, choisissez l'option /membership#membership-form.
            </p>
            <ColorPicker value={form.headerJoinColorVariant} onChange={(v) => set('headerJoinColorVariant')(v)} />
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] text-white/40 mb-2 uppercase tracking-wider font-bold">Apercu</p>
              <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${buttonVariantPreviewClass(form.headerJoinColorVariant)}`}>
                {form.headerJoinLabelFr || form.headerJoinLabelEn || 'Rejoindre'}
              </button>
              <p className="text-[11px] text-white/35 mt-2 truncate">Destination: {form.headerJoinLink}</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={form.headerJoinOpenInNewTab}
                onChange={(e) => set('headerJoinOpenInNewTab')(e.target.checked)}
              />
              Ouvrir dans un nouvel onglet
            </label>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
            <h3 className="text-sm font-bold text-white">Bouton Header 2: Sponsor / Don</h3>
            <LangBlock
              fr={form.headerSponsorLabelFr}
              de={form.headerSponsorLabelDe}
              en={form.headerSponsorLabelEn}
              onFr={(v) => set('headerSponsorLabelFr')(v)}
              onDe={(v) => set('headerSponsorLabelDe')(v)}
              onEn={(v) => set('headerSponsorLabelEn')(v)}
              baseLabel="Label"
            />
            <LinkField
              linkType={sponsorLinkType}
              linkTarget={form.headerSponsorLink}
              onType={(v) => {
                setSponsorLinkType(v);
                if (v === 'internal' && isExternalLink(form.headerSponsorLink)) set('headerSponsorLink')('/sponsor-donate');
                if (v === 'external' && !isExternalLink(form.headerSponsorLink)) set('headerSponsorLink')('https://');
              }}
              onTarget={(v) => set('headerSponsorLink')(v)}
            />
            <ColorPicker value={form.headerSponsorColorVariant} onChange={(v) => set('headerSponsorColorVariant')(v)} />
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] text-white/40 mb-2 uppercase tracking-wider font-bold">Apercu</p>
              <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${buttonVariantPreviewClass(form.headerSponsorColorVariant)}`}>
                {form.headerSponsorLabelFr || form.headerSponsorLabelEn || 'Sponsor / Don'}
              </button>
              <p className="text-[11px] text-white/35 mt-2 truncate">Destination: {form.headerSponsorLink}</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={form.headerSponsorOpenInNewTab}
                onChange={(e) => set('headerSponsorOpenInNewTab')(e.target.checked)}
              />
              Ouvrir dans un nouvel onglet
            </label>
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <h2 className="text-lg font-bold text-white mb-4">Hero page Membership</h2>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Image de fond (optionnel)</label>
            <input
              type="text"
              value={form.membershipHeroBgUrl}
              onChange={(e) => set('membershipHeroBgUrl')(e.target.value)}
              placeholder="/hero-pic/membership.jpg ou https://..."
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Titre FR</label>
              <input type="text" value={form.membershipHeroHeadingFr} onChange={(e) => set('membershipHeroHeadingFr')(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Titre DE</label>
              <input type="text" value={form.membershipHeroHeadingDe} onChange={(e) => set('membershipHeroHeadingDe')(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Titre EN</label>
              <input type="text" value={form.membershipHeroHeadingEn} onChange={(e) => set('membershipHeroHeadingEn')(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Sous-titre FR</label>
              <textarea value={form.membershipHeroSubFr} onChange={(e) => set('membershipHeroSubFr')(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Sous-titre DE</label>
              <textarea value={form.membershipHeroSubDe} onChange={(e) => set('membershipHeroSubDe')(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Sous-titre EN</label>
              <textarea value={form.membershipHeroSubEn} onChange={(e) => set('membershipHeroSubEn')(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/80 disabled:opacity-50 transition"
      >
        {saving ? 'Enregistrement…' : 'Enregistrer la configuration'}
      </button>
    </div>
  );
}
