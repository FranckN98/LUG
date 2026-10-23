'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, fmtDay, type Tag } from './api';

type Resp = {
  id: string;
  submittedOn: string;
  rating: number;
  highlights: string | null;
  likesAndImprovements: string | null;
  wantedSpeakers: string | null;
  wantedTopics: string | null;
  isSigned: boolean;
  firstName: string | null;
  lastName: string | null;
  tags: { id: string; name: string }[];
};

type ListResponse = {
  responses: Resp[];
  total: number;
  stats: { average: number | null; distribution: number[] };
  tags: Tag[];
  error?: string;
};

type Filters = { rating: string; from: string; to: string; signed: string; tag: string };

const PAGE = 25;
const EMPTY: Filters = { rating: '', from: '', to: '', signed: '', tag: '' };

const selectCls =
  'rounded-full border border-white/15 bg-[#0f0606]/80 px-3 py-2 text-sm text-white focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20';

function Stars({ value }: { value: number }) {
  return (
    <span role="img" aria-label={`${value} sur 5`} className="whitespace-nowrap text-base tracking-wider text-accent">
      {'★'.repeat(value)}
      <span className="text-white/20">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

function Block({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/85">{text}</p>
    </div>
  );
}

export function ResponsesTab() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [items, setItems] = useState<Resp[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const params = useCallback(() => {
    const sp = new URLSearchParams();
    if (filters.rating) sp.set('rating', filters.rating);
    if (filters.from) sp.set('from', filters.from);
    if (filters.to) sp.set('to', filters.to);
    if (filters.signed) sp.set('signed', filters.signed);
    if (filters.tag) sp.set('tag', filters.tag);
    if (debounced) sp.set('q', debounced);
    return sp;
  }, [filters, debounced]);

  const load = useCallback(
    async (offset: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError('');
      const sp = params();
      sp.set('limit', String(PAGE));
      sp.set('offset', String(offset));
      try {
        const res = await api<ListResponse>(`/api/admin/feedback?${sp}`);
        if (id !== requestId.current) return;
        if (!res.ok) throw new Error(res.data.error || 'Chargement impossible.');
        setData(res.data);
        setItems((prev) => (offset === 0 ? res.data.responses : [...prev, ...res.data.responses]));
      } catch (e) {
        if (id === requestId.current) setError(e instanceof Error ? e.message : 'Chargement impossible.');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [params],
  );

  useEffect(() => {
    void load(0);
  }, [load]);

  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setFilters((f) => ({ ...f, [k]: e.target.value }));
  const filtered = Object.values(filters).some(Boolean) || !!debounced;
  const csvParams = params();
  csvParams.set('format', 'csv');
  const tags = data?.tags ?? [];
  const stats = data?.stats;
  const maxBar = Math.max(1, ...(stats?.distribution ?? [0]));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-2xl font-bold text-white">{data ? data.total : '…'}</p>
          <p className="mt-0.5 text-xs text-white/50">{filtered ? 'Réponses (filtre actif)' : 'Réponses'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-2xl font-bold text-accent">{stats?.average != null ? stats.average.toFixed(2) : '–'}</p>
          <p className="mt-0.5 text-xs text-white/50">Note moyenne sur 5</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" aria-label="Répartition des notes">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = stats?.distribution[n - 1] ?? 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs text-white/60">
                <span className="w-6 text-right">{n} ★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${(count / maxBar) * 100}%` }} />
                </span>
                <span className="w-8 tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-white/50">
            Note
            <select value={filters.rating} onChange={set('rating')} className={`${selectCls} mt-1 block`}>
              <option value="">Toutes</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/50">
            Du
            <input type="date" value={filters.from} onChange={set('from')} className={`${selectCls} mt-1 block`} />
          </label>
          <label className="text-xs text-white/50">
            Au
            <input type="date" value={filters.to} onChange={set('to')} className={`${selectCls} mt-1 block`} />
          </label>
          <label className="text-xs text-white/50">
            Réponse
            <select value={filters.signed} onChange={set('signed')} className={`${selectCls} mt-1 block`}>
              <option value="">Anonymes et signées</option>
              <option value="anonymous">Anonymes</option>
              <option value="signed">Signées</option>
            </select>
          </label>
          <label className="text-xs text-white/50">
            Étiquette
            <select value={filters.tag} onChange={set('tag')} className={`${selectCls} mt-1 block`}>
              <option value="">Toutes</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.count})</option>
              ))}
            </select>
          </label>
          {filtered && (
            <button
              onClick={() => {
                setFilters(EMPTY);
                setQuery('');
              }}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 hover:border-white/30"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans les réponses"
            aria-label="Rechercher dans les réponses"
            className="w-full rounded-full border border-white/15 bg-[#0f0606]/80 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 sm:max-w-md"
          />
          <a
            href={`/api/admin/feedback?${csvParams}`}
            download
            className="rounded-full border border-accent/50 bg-accent/10 px-5 py-2.5 text-center text-sm font-semibold text-accent hover:bg-accent/20 sm:ml-auto"
          >
            Exporter en CSV{filtered ? ' (filtre actif)' : ''}
          </a>
        </div>
      </div>

      <TagManager tags={tags} onChanged={() => void load(0)} />

      {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <ul className="space-y-3">
        {items.map((r) => (
          <ResponseCard
            key={r.id}
            r={r}
            catalogue={tags}
            onUpdated={(updated) => {
              setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
              void api<{ tags: Tag[] }>('/api/admin/feedback/tags').then((res) => {
                if (res.ok) setData((d) => (d ? { ...d, tags: res.data.tags } : d));
              });
            }}
          />
        ))}
      </ul>

      {!loading && items.length === 0 && !error && (
        <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-white/50">
          {filtered ? 'Aucune réponse pour ce filtre.' : 'Aucune réponse pour le moment.'}
        </p>
      )}
      {loading && <p className="text-center text-sm text-white/50">Chargement…</p>}
      {data && items.length < data.total && !loading && (
        <button
          onClick={() => load(items.length)}
          className="mx-auto block rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-white/80 hover:border-white/30"
        >
          Afficher plus ({data.total - items.length} restantes)
        </button>
      )}
    </div>
  );
}

function ResponseCard({ r, catalogue, onUpdated }: { r: Resp; catalogue: Tag[]; onUpdated: (r: Resp) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selected = new Set(r.tags.map((t) => t.id));

  async function toggle(tagId: string) {
    const next = new Set(selected);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    setBusy(true);
    setError('');
    const res = await api<{ response?: Resp; error?: string }>(`/api/admin/feedback/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagIds: Array.from(next) }),
    });
    setBusy(false);
    if (res.ok && res.data.response) onUpdated(res.data.response);
    else setError(res.data.error ?? 'La modification a échoué.');
  }

  const name = [r.firstName, r.lastName].filter(Boolean).join(' ');

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Stars value={r.rating} />
        <span className="text-xs text-white/50">{fmtDay(r.submittedOn)}</span>
        {r.isSigned ? (
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-emerald-300">
            Signée{name ? ` · ${name}` : ''}
          </span>
        ) : (
          <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[0.7rem] font-semibold text-white/60">Anonyme</span>
        )}
      </div>

      <div className="mt-3 space-y-3">
        <Block label="Moment ou aspect marquant" text={r.highlights} />
        <Block label="Apprécié et à améliorer" text={r.likesAndImprovements} />
        <Block label="Intervenants ou invités souhaités" text={r.wantedSpeakers} />
        <Block label="Sujets à aborder" text={r.wantedTopics} />
        {!r.highlights && !r.likesAndImprovements && !r.wantedSpeakers && !r.wantedTopics && (
          <p className="text-sm italic text-white/35">Note seule, sans commentaire.</p>
        )}
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/40">Étiquettes</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {catalogue.map((t) => {
            const on = selected.has(t.id);
            return (
              <button
                key={t.id}
                type="button"
                disabled={busy}
                aria-pressed={on}
                onClick={() => toggle(t.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                  on ? 'border-accent/60 bg-accent/20 text-accent' : 'border-white/15 text-white/55 hover:border-white/35'
                }`}
              >
                {t.name}
              </button>
            );
          })}
          {catalogue.length === 0 && <span className="text-xs text-white/35">Aucune étiquette : créez-en ci-dessus.</span>}
        </div>
        {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
      </div>
    </li>
  );
}

function TagManager({ tags, onChanged }: { tags: Tag[]; onChanged: () => void }) {
  const [name, setName] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    setMsg('');
    const res = await api<{ error?: string }>(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(res.data.error ?? 'L’opération a échoué.');
      return false;
    }
    onChanged();
    return true;
  }

  return (
    <details className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <summary className="cursor-pointer text-sm font-semibold text-white/80">Gérer les étiquettes ({tags.length})</summary>
      <div className="mt-4 space-y-3">
        <ul className="space-y-2">
          {tags.map((t) => {
            const draft = drafts[t.id] ?? t.name;
            return (
              <li key={t.id} className="flex flex-wrap items-center gap-2">
                <input
                  value={draft}
                  maxLength={40}
                  aria-label={`Renommer l’étiquette ${t.name}`}
                  onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                  className="min-w-0 flex-1 rounded-full border border-white/15 bg-[#0f0606]/80 px-4 py-2 text-sm text-white focus:border-accent/60 focus:outline-none"
                />
                <span className="w-16 text-xs text-white/40">{t.count} rép.</span>
                <button
                  disabled={busy || draft.trim() === t.name}
                  onClick={async () => {
                    if (await call(`/api/admin/feedback/tags/${t.id}`, 'PATCH', { name: draft })) {
                      setDrafts((d) => {
                        const { [t.id]: _removed, ...rest } = d;
                        return rest;
                      });
                    }
                  }}
                  className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40 disabled:opacity-40"
                >
                  Renommer
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Supprimer l’étiquette « ${t.name} » ? Elle sera retirée des ${t.count} réponse(s) concernée(s).`)) {
                      void call(`/api/admin/feedback/tags/${t.id}`, 'DELETE');
                    }
                  }}
                  className="rounded-full border border-red-400/40 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-400/10 disabled:opacity-40"
                >
                  Supprimer
                </button>
              </li>
            );
          })}
        </ul>
        <form
          className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await call('/api/admin/feedback/tags', 'POST', { name })) setName('');
          }}
        >
          <input
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nouvelle étiquette"
            aria-label="Nouvelle étiquette"
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-[#0f0606]/80 px-4 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="rounded-full bg-accent px-5 py-2 text-xs font-bold text-white hover:bg-accent/80 disabled:opacity-40"
          >
            Ajouter
          </button>
        </form>
        {msg && <p role="alert" className="text-sm text-amber-200">{msg}</p>}
      </div>
    </details>
  );
}
