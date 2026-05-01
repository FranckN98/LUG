'use client';

import { useCallback, useEffect, useState } from 'react';

type Stat = {
  id: string;
  page: 'home' | 'blog' | string;
  labelDe: string;
  labelEn: string;
  labelFr: string;
  valueNumber: number | null;
  suffix: string | null;
  valueText: string | null;
  displayOrder: number;
  isActive: boolean;
};

const PAGES: Array<{ key: 'home' | 'blog'; title: string; subtitle: string }> = [
  {
    key: 'home',
    title: "Page d'accueil",
    subtitle: 'Compteurs animés affichés sur la section Stats de la home (3 attendus).',
  },
  {
    key: 'blog',
    title: 'Blog & Impact',
    subtitle: 'Cartes "Notre impact jusqu\'ici" en haut de la page Blog.',
  },
];

const EMPTY: Omit<Stat, 'id'> = {
  page: 'home',
  labelDe: '',
  labelEn: '',
  labelFr: '',
  valueNumber: null,
  suffix: '',
  valueText: '',
  displayOrder: 0,
  isActive: true,
};

export default function StatsAdmin() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [creatingFor, setCreatingFor] = useState<'home' | 'blog' | null>(null);
  const [draft, setDraft] = useState<Omit<Stat, 'id'>>(EMPTY);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function startCreate(page: 'home' | 'blog') {
    setCreatingFor(page);
    setDraft({
      ...EMPTY,
      page,
      displayOrder: stats.filter((s) => s.page === page).length,
    });
    setError('');
  }

  async function createStat() {
    if (!draft.labelEn.trim()) {
      setError('Le libellé (EN) est obligatoire.');
      return;
    }
    setSavingId('__new');
    setError('');
    const res = await fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setSavingId(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Erreur lors de la création.');
      return;
    }
    setCreatingFor(null);
    setDraft(EMPTY);
    fetchAll();
  }

  async function updateStat(id: string, patch: Partial<Stat>) {
    setSavingId(id);
    const res = await fetch(`/api/admin/stats/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSavingId(null);
    if (!res.ok) {
      setError('Erreur lors de la sauvegarde.');
      return;
    }
    fetchAll();
  }

  async function deleteStat(id: string) {
    if (!confirm('Supprimer ce KPI ?')) return;
    setSavingId(id);
    await fetch(`/api/admin/stats/${id}`, { method: 'DELETE' });
    setSavingId(null);
    fetchAll();
  }

  const inputCls =
    'w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 px-3 py-2 text-sm focus:outline-none focus:border-accent/40 focus:bg-white/[0.09] transition';

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Contenu</p>
        <h1 className="text-xl font-bold text-white sm:text-2xl">KPIs & Statistiques</h1>
        <p className="mt-1 text-sm leading-relaxed text-white/35">
          Gérez les chiffres affichés sur la page d&apos;accueil et la page Blog & Impact.
          Astuce : sur la home, utilisez « valeur numérique + suffixe » (ex. <code>500</code> + <code>+</code>) pour bénéficier de l&apos;animation. Sur la page blog, vous pouvez aussi saisir un texte libre (« 1 », « 10+ »).
        </p>
      </div>

      {error && (
        <p className="mb-5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
          Chargement…
        </div>
      ) : (
        <div className="space-y-8">
          {PAGES.map((p) => {
            const list = stats.filter((s) => s.page === p.key);
            return (
              <section key={p.key} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white">{p.title}</h2>
                    <p className="mt-0.5 text-xs text-white/40">{p.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCreate(p.key)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] hover:bg-[#a82020] transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un KPI
                  </button>
                </div>

                {creatingFor === p.key && (
                  <div className="mb-4 rounded-xl border border-accent/30 bg-accent/[0.04] p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent/80">Nouveau KPI</p>
                    <StatFields
                      page={p.key}
                      value={draft}
                      onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
                      inputCls={inputCls}
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={createStat}
                        disabled={savingId === '__new'}
                        className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-[#a82020] transition disabled:opacity-50"
                      >
                        {savingId === '__new' ? 'Création…' : 'Créer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCreatingFor(null); setDraft(EMPTY); setError(''); }}
                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/55 hover:text-white transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {list.length === 0 && creatingFor !== p.key ? (
                  <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/35">
                    Aucun KPI configuré. Les valeurs par défaut du site seront utilisées.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {list.map((s) => (
                      <StatRow
                        key={s.id}
                        stat={s}
                        saving={savingId === s.id}
                        onPatch={(patch) => updateStat(s.id, patch)}
                        onDelete={() => deleteStat(s.id)}
                        inputCls={inputCls}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Editable row ──
function StatRow({
  stat, saving, onPatch, onDelete, inputCls,
}: {
  stat: Stat;
  saving: boolean;
  onPatch: (patch: Partial<Stat>) => void;
  onDelete: () => void;
  inputCls: string;
}) {
  const [draft, setDraft] = useState(stat);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setDraft(stat); setDirty(false); }, [stat]);

  function update<K extends keyof Stat>(field: K, value: Stat[K]) {
    setDraft((d) => ({ ...d, [field]: value }));
    setDirty(true);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${stat.isActive ? 'bg-green-400' : 'bg-white/20'}`} />
          <p className="text-xs text-white/35">Ordre : {stat.displayOrder}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPatch({ isActive: !stat.isActive })}
            disabled={saving}
            className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full border transition ${
              stat.isActive
                ? 'border-green-500/25 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                : 'border-white/10 bg-white/[0.04] text-white/50 hover:text-white'
            }`}
          >
            {stat.isActive ? 'Visible' : 'Masqué'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition"
          >
            Supprimer
          </button>
        </div>
      </div>

      <StatFields
        page={(stat.page === 'blog' ? 'blog' : 'home')}
        value={draft}
        onChange={(patch) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true); }}
        inputCls={inputCls}
      />

      <div className="mt-3 flex items-center justify-end gap-2">
        {dirty && (
          <span className="text-[0.65rem] uppercase tracking-wider text-amber-300/80">Non sauvegardé</span>
        )}
        <button
          type="button"
          onClick={() => onPatch({
            labelDe: draft.labelDe,
            labelEn: draft.labelEn,
            labelFr: draft.labelFr,
            valueNumber: draft.valueNumber,
            suffix: draft.suffix,
            valueText: draft.valueText,
            displayOrder: draft.displayOrder,
          })}
          disabled={!dirty || saving}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#a82020] transition disabled:opacity-40"
        >
          {saving ? '…' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}

// ── Shared edit fields ──
function StatFields({
  page, value, onChange, inputCls,
}: {
  page: 'home' | 'blog';
  value: Omit<Stat, 'id'>;
  onChange: (patch: Partial<Stat>) => void;
  inputCls: string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-[0.65rem] font-semibold text-white/45 uppercase tracking-wider mb-1.5">
            Valeur numérique {page === 'home' && <span className="text-accent/70">*</span>}
          </label>
          <input
            type="number"
            value={value.valueNumber ?? ''}
            onChange={(e) => onChange({ valueNumber: e.target.value === '' ? null : Number(e.target.value) })}
            placeholder="500"
            className={inputCls}
          />
          <p className="mt-1 text-[0.65rem] text-white/30">
            {page === 'home' ? 'Animée de 0 → valeur sur la home.' : 'Optionnelle si « Texte libre » est rempli.'}
          </p>
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold text-white/45 uppercase tracking-wider mb-1.5">
            Suffixe
          </label>
          <input
            type="text"
            value={value.suffix ?? ''}
            onChange={(e) => onChange({ suffix: e.target.value })}
            placeholder="+ ou %"
            maxLength={4}
            className={inputCls}
          />
          <p className="mt-1 text-[0.65rem] text-white/30">Ex : <code>+</code>, <code>%</code>, <code>k</code>…</p>
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold text-white/45 uppercase tracking-wider mb-1.5">
            Texte libre {page === 'blog' && <span className="text-accent/70">(prioritaire)</span>}
          </label>
          <input
            type="text"
            value={value.valueText ?? ''}
            onChange={(e) => onChange({ valueText: e.target.value })}
            placeholder={page === 'blog' ? '300+' : '(optionnel)'}
            className={inputCls}
          />
          <p className="mt-1 text-[0.65rem] text-white/30">
            {page === 'blog'
              ? 'Si rempli, écrase « valeur + suffixe ».'
              : 'Non utilisé sur la home.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(['Fr', 'En', 'De'] as const).map((lang) => {
          const key = `label${lang}` as 'labelFr' | 'labelEn' | 'labelDe';
          return (
            <div key={lang}>
              <label className="block text-[0.65rem] font-semibold text-white/45 uppercase tracking-wider mb-1.5">
                Libellé ({lang.toUpperCase()}){lang === 'En' && <span className="text-accent/70"> *</span>}
              </label>
              <input
                type="text"
                value={value[key]}
                onChange={(e) => onChange({ [key]: e.target.value } as Partial<Stat>)}
                placeholder={lang === 'Fr' ? 'Ex : Membres de la communauté' : lang === 'En' ? 'Ex : Community members' : 'Ex : Community-Mitglieder'}
                className={inputCls}
              />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[0.65rem] font-semibold text-white/45 uppercase tracking-wider mb-1.5">
            Ordre d&apos;affichage
          </label>
          <input
            type="number"
            value={value.displayOrder}
            onChange={(e) => onChange({ displayOrder: Number(e.target.value) })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}
