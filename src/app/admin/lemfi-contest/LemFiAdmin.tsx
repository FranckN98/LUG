'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'pending' | 'validated' | 'rejected';

type ListEntry = {
  id: string;
  sequentialNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  status: Status;
  decisionReason: string | null;
  decidedAt: string | null;
  createdAt: string;
  emailSentAt: string | null;
  emailAttempts: number;
  emailLastError: string | null;
  duplicateOfNumber: number | null;
  sameProofCount: number;
};

type Detail = Omit<ListEntry, 'sameProofCount'> & {
  consentAt: string | null;
  proof: { mimeType: string; sizeBytes: number } | null;
  decisions: { id: string; fromStatus: Status; toStatus: Status; reason: string | null; createdAt: string }[];
};

type ListResponse = {
  entries: ListEntry[];
  total: number;
  stats: { pending: number; validated: number; rejected: number; total: number; numbersIssued: number };
  capacity: number;
  retentionDays: number;
  expired: number;
  emailsPending: number;
};

const PAGE = 25;
const STATUS_LABEL: Record<Status, string> = { pending: 'En attente', validated: 'Validé', rejected: 'Refusé' };
const STATUS_STYLE: Record<Status, string> = {
  pending: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  validated: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  rejected: 'border-red-400/40 bg-red-400/10 text-red-300',
};

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Berlin' });
const fmtDate = (iso: string) => dateFmt.format(new Date(iso));

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (res.status === 401) {
    window.location.href = '/admin/login?from=/admin/lemfi-contest';
  }
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export function LemFiAdmin() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [status, setStatus] = useState<'' | Status>('');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(
    async (offset: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError('');
      const sp = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
      if (status) sp.set('status', status);
      if (debounced) sp.set('q', debounced);
      try {
        const res = await api<ListResponse & { error?: string }>(`/api/admin/lemfi-contest?${sp}`);
        if (id !== requestId.current) return;
        if (!res.ok) throw new Error(res.data.error || 'Chargement impossible.');
        setData(res.data);
        setEntries((prev) => (offset === 0 ? res.data.entries : [...prev, ...res.data.entries]));
      } catch (e) {
        if (id === requestId.current) setError(e instanceof Error ? e.message : 'Chargement impossible.');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [status, debounced],
  );

  useEffect(() => {
    void load(0);
  }, [load]);

  async function retryEmails() {
    setBusy(true);
    setNotice('');
    const res = await api<{ attempted: number; sent: number; failed: number }>('/api/admin/lemfi-contest/retry-emails', { method: 'POST' });
    setNotice(
      res.ok
        ? `${res.data.sent} e-mail(s) confirmé(s) par le service, ${res.data.failed} en échec.`
        : 'La relance a échoué.',
    );
    setBusy(false);
    void load(0);
  }

  async function purge() {
    if (!data) return;
    const ok = window.confirm(
      `Supprimer définitivement ${data.expired} participation(s) (données et captures) de plus de ${data.retentionDays} jours ? Les numéros ne seront pas réattribués.`,
    );
    if (!ok) return;
    setBusy(true);
    const res = await api<{ deleted: number }>('/api/admin/lemfi-contest/purge', { method: 'POST' });
    setNotice(res.ok ? `${res.data.deleted} participation(s) supprimée(s).` : 'La purge a échoué.');
    setBusy(false);
    void load(0);
  }

  const stats = data?.stats;
  const filters: { key: '' | Status; label: string; count?: number }[] = [
    { key: '', label: 'Toutes', count: stats?.total },
    { key: 'pending', label: 'En attente', count: stats?.pending },
    { key: 'validated', label: 'Validé', count: stats?.validated },
    { key: 'rejected', label: 'Refusé', count: stats?.rejected },
  ];

  return (
    <div className="space-y-5">
      {stats && data && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="En attente" value={stats.pending} tone="text-amber-300" />
          <Stat label="Validés (éligibles)" value={stats.validated} tone="text-emerald-300" />
          <Stat label="Refusés" value={stats.rejected} tone="text-red-300" />
          <Stat label="Numéros attribués" value={`${stats.numbersIssued} / ${data.capacity}`} tone="text-white" />
        </div>
      )}

      {data && data.emailsPending > 0 && (
        <Bar tone="amber" text={`${data.emailsPending} e-mail(s) de confirmation non confirmé(s) par le service d’envoi.`}>
          <BarButton disabled={busy} onClick={retryEmails}>Relancer les envois</BarButton>
        </Bar>
      )}
      {data && data.expired > 0 && (
        <Bar tone="red" text={`${data.expired} participation(s) dépassent la durée de conservation (${data.retentionDays} jours).`}>
          <BarButton disabled={busy} onClick={purge}>Purger</BarButton>
        </Bar>
      )}
      {notice && <p role="status" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80">{notice}</p>}

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par statut">
          {filters.map((f) => (
            <button
              key={f.key || 'all'}
              role="tab"
              aria-selected={status === f.key}
              onClick={() => setStatus(f.key)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                status === f.key
                  ? 'border-accent/60 bg-accent/15 text-accent'
                  : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30'
              }`}
            >
              {f.label}
              {f.count !== undefined && <span className="ml-1.5 text-white/40">{f.count}</span>}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom, un numéro (LU215) ou un e-mail"
          aria-label="Rechercher"
          className="w-full rounded-full border border-white/15 bg-[#0f0606]/80 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 lg:ml-auto lg:max-w-sm"
        />
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id}>
            <button
              onClick={() => setSelected(e.id)}
              className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.06] sm:flex-row sm:items-center sm:gap-5"
            >
              <span className="w-20 shrink-0 font-mono text-xl font-bold text-accent">LU{e.sequentialNumber}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-white">{e.firstName} {e.lastName}</span>
                <span className="block truncate text-sm text-white/50">{e.email}</span>
              </span>
              <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                {e.sameProofCount > 1 && (
                  <span className="rounded-full border border-orange-400/40 bg-orange-400/10 px-2.5 py-0.5 text-[0.7rem] font-semibold text-orange-300">
                    Capture identique{e.duplicateOfNumber ? ` à LU${e.duplicateOfNumber}` : ''}
                  </span>
                )}
                {!e.emailSentAt && (
                  <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[0.7rem] text-white/60">E-mail non confirmé</span>
                )}
                <span className="text-xs text-white/40">{fmtDate(e.createdAt)}</span>
                <StatusBadge status={e.status} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {!loading && entries.length === 0 && !error && (
        <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-white/50">Aucune participation pour ce filtre.</p>
      )}
      {loading && <p className="text-center text-sm text-white/50">Chargement…</p>}
      {data && entries.length < data.total && !loading && (
        <button
          onClick={() => load(entries.length)}
          className="mx-auto block rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-white/80 hover:border-white/30"
        >
          Afficher plus ({data.total - entries.length} restantes)
        </button>
      )}

      {selected && (
        <DetailModal
          id={selected}
          onClose={() => setSelected(null)}
          onChanged={() => void load(0)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="mt-0.5 text-xs text-white/50">{label}</p>
    </div>
  );
}

function Bar({ tone, text, children }: { tone: 'amber' | 'red'; text: string; children: React.ReactNode }) {
  const cls = tone === 'amber' ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-red-400/30 bg-red-400/10 text-red-200';
  return (
    <div className={`flex flex-col gap-2 rounded-xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${cls}`}>
      <span>{text}</span>
      {children}
    </div>
  );
}

function BarButton({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className="shrink-0 rounded-full border border-current px-4 py-1.5 text-xs font-bold disabled:opacity-50">
      {children}
    </button>
  );
}

function DetailModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [proofFailed, setProofFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    void api<{ entry: Detail }>(`/api/admin/lemfi-contest/${id}`).then((r) => {
      if (alive && r.ok) setD(r.data.entry);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function decide(action: 'validated' | 'rejected') {
    if (action === 'rejected' && !reason.trim()) {
      setMsg('Un motif est obligatoire pour refuser.');
      return;
    }
    setBusy(true);
    setMsg('');
    const res = await api<{ entry?: Detail; error?: string }>(`/api/admin/lemfi-contest/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    setBusy(false);
    if (res.ok && res.data.entry) {
      setD(res.data.entry);
      setReason('');
      onChanged();
    } else {
      setMsg(res.data.error ?? 'La décision a échoué.');
    }
  }

  async function resendEmail() {
    setBusy(true);
    setMsg('');
    const res = await api<{ emailStatus?: string }>(`/api/admin/lemfi-contest/${id}/resend-email`, { method: 'POST' });
    setMsg(res.ok && res.data.emailStatus === 'sent' ? 'E-mail confirmé par le service d’envoi.' : 'Le service d’envoi n’a pas confirmé l’e-mail.');
    const fresh = await api<{ entry: Detail }>(`/api/admin/lemfi-contest/${id}`);
    if (fresh.ok) setD(fresh.data.entry);
    setBusy(false);
    onChanged();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Détail de la participation">
      <button aria-label="Fermer" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#130707] p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <button onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:text-white">
          Fermer
        </button>
        {!d ? (
          <p className="py-10 text-center text-sm text-white/50">Chargement…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="font-mono text-3xl font-bold text-accent">LU{d.sequentialNumber}</p>
              <p className="mt-1 text-lg font-semibold text-white">{d.firstName} {d.lastName}</p>
              <p className="break-all text-sm text-white/60">{d.email}</p>
              <div className="mt-3"><StatusBadge status={d.status} /></div>
              <dl className="mt-4 space-y-1 text-xs text-white/50">
                <div>Reçue le {fmtDate(d.createdAt)}</div>
                {d.consentAt && <div>Consentement enregistré le {fmtDate(d.consentAt)}</div>}
                <div>
                  E-mail de confirmation :{' '}
                  {d.emailSentAt ? `confirmé le ${fmtDate(d.emailSentAt)}` : `non confirmé (${d.emailAttempts} tentative(s))`}
                </div>
                {!d.emailSentAt && d.emailLastError && <div className="text-red-300/80">Dernière erreur : {d.emailLastError}</div>}
              </dl>
              {d.duplicateOfNumber && (
                <p className="mt-3 rounded-lg border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-xs text-orange-200">
                  Capture identique à celle de LU{d.duplicateOfNumber} : à vérifier.
                </p>
              )}
              {!d.emailSentAt && (
                <button disabled={busy} onClick={resendEmail} className="mt-3 rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40 disabled:opacity-50">
                  Renvoyer l’e-mail de confirmation
                </button>
              )}

              <div className="mt-5 border-t border-white/10 pt-4">
                <label htmlFor="lf-reason" className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Motif (obligatoire pour refuser)
                </label>
                <textarea
                  id="lf-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#0f0606]/80 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:outline-none"
                  placeholder="Ex. : montant visible insuffisant, capture illisible…"
                />
                <div className="mt-3 flex gap-2">
                  {d.status !== 'validated' && (
                    <button disabled={busy} onClick={() => decide('validated')} className="flex-1 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-50">
                      Valider
                    </button>
                  )}
                  {d.status !== 'rejected' && (
                    <button disabled={busy} onClick={() => decide('rejected')} className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-400 disabled:opacity-50">
                      Refuser
                    </button>
                  )}
                </div>
                {msg && <p role="status" className="mt-2 text-sm text-amber-200">{msg}</p>}
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Historique des décisions</p>
                {d.decisions.length === 0 ? (
                  <p className="mt-2 text-sm text-white/40">Aucune décision pour le moment.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {d.decisions.map((h) => (
                      <li key={h.id} className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white/80">
                        <span className="text-xs text-white/40">{fmtDate(h.createdAt)}</span>
                        <br />
                        {STATUS_LABEL[h.fromStatus]} → <strong>{STATUS_LABEL[h.toStatus]}</strong>
                        {h.reason && <span className="block text-white/60">Motif : {h.reason}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Preuve de transfert</p>
              {d.proof && !proofFailed ? (
                <a href={`/api/admin/lemfi-contest/${d.id}/proof`} target="_blank" rel="noopener noreferrer" title="Ouvrir en grand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/admin/lemfi-contest/${d.id}/proof`}
                    alt={`Capture de LU${d.sequentialNumber}`}
                    onError={() => setProofFailed(true)}
                    className="max-h-[60vh] w-full rounded-xl border border-white/10 bg-black/40 object-contain"
                  />
                </a>
              ) : (
                <p className="rounded-xl border border-white/10 p-6 text-center text-sm text-white/50">Capture indisponible.</p>
              )}
              {d.proof && <p className="mt-2 text-xs text-white/40">{d.proof.mimeType} · {Math.round(d.proof.sizeBytes / 1024)} Ko</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
