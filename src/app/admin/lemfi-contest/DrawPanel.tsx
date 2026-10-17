'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LemfiWinnerStatus } from '@/lib/lemfiContestUtils';
import { api, fmtDate } from './adminShared';

type Winner = {
  id: string;
  prize: string;
  status: LemfiWinnerStatus;
  drawnAt: string;
  forfeitedAt: string | null;
  entry: {
    id: string;
    sequentialNumber: number;
    firstName: string;
    lastName: string;
    email: string;
    status: 'pending' | 'validated' | 'rejected';
  };
};

type DrawState = { eligible: number; winners: Winner[]; prizePresets: string[]; maxCount: number };
type DrawResponse = { winners: Winner[]; requested: number; error?: string };

export function DrawPanel() {
  const [state, setState] = useState<DrawState | null>(null);
  const [prize, setPrize] = useState('');
  const [count, setCount] = useState('1');
  const [latest, setLatest] = useState<Winner[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const res = await api<DrawState & { error?: string }>('/api/admin/lemfi-contest/draw');
    if (res.ok) setState(res.data);
    else setError(res.data.error ?? 'Chargement impossible.');
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function draw(prizeName: string, n: number): Promise<boolean> {
    const res = await api<DrawResponse>('/api/admin/lemfi-contest/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prize: prizeName, count: n }),
    });
    if (!res.ok) {
      setError(res.data.error ?? 'Le tirage a échoué.');
      return false;
    }
    setLatest(res.data.winners);
    if (res.data.winners.length < res.data.requested) {
      setNotice(`Seulement ${res.data.winners.length} participant(s) éligible(s) restaient : ${res.data.winners.length} gagnant(s) tiré(s) sur ${res.data.requested}.`);
    }
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    await draw(prize, Number(count));
    await load();
    setBusy(false);
  }

  async function replace(w: Winner) {
    const name = `${w.entry.firstName} ${w.entry.lastName}`;
    if (!window.confirm(`Annuler le gain de LU${w.entry.sequentialNumber} (${name}) et tirer un remplaçant pour « ${w.prize} » ?`)) return;
    setBusy(true);
    setError('');
    setNotice('');
    const res = await api<{ error?: string }>(`/api/admin/lemfi-contest/winners/${w.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'forfeit' }),
    });
    if (!res.ok) {
      setError(res.data.error ?? 'L’annulation a échoué.');
    } else if (!(await draw(w.prize, 1))) {
      setNotice('Le gain a été annulé, mais aucun remplaçant n’a pu être tiré.');
    }
    await load();
    setBusy(false);
  }

  const winners = state?.winners ?? [];
  const groups = Array.from(
    winners.reduce((m, w) => m.set(w.prize, [...(m.get(w.prize) ?? []), w]), new Map<string, Winner[]>()),
  );
  const active = winners.filter((w) => w.status === 'won').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-2xl font-bold text-emerald-300">{state?.eligible ?? '…'}</p>
          <p className="mt-0.5 text-xs text-white/50">Participants éligibles restants (validés, pas encore tirés)</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-2xl font-bold text-yellow-200">{state ? active : '…'}</p>
          <p className="mt-0.5 text-xs text-white/50">Gagnants</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Lot à tirer</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(state?.prizePresets ?? []).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrize(p)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  prize === p
                    ? 'border-accent/60 bg-accent/15 text-accent'
                    : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            maxLength={60}
            placeholder="ou saisissez un autre lot"
            aria-label="Nom du lot"
            className="mt-3 w-full rounded-xl border border-white/15 bg-[#0f0606]/80 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Nombre de gagnants
            <input
              type="number"
              min={1}
              max={state?.maxCount ?? 50}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="mt-2 block w-28 rounded-xl border border-white/15 bg-[#0f0606]/80 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !prize.trim() || !state || state.eligible === 0}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white transition hover:bg-accent/80 disabled:opacity-40"
          >
            {busy ? 'Tirage…' : 'Tirer au sort'}
          </button>
        </div>
        {state && state.eligible === 0 && (
          <p className="text-sm text-amber-200">Aucun participant éligible : validez d’abord des participations.</p>
        )}
      </form>

      {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{notice}</p>}

      {latest.length > 0 && (
        <section aria-label="Dernier tirage" className="rounded-2xl border border-yellow-400/40 bg-yellow-400/[0.07] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-200/80">Dernier tirage — {latest[0]!.prize}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {latest.map((w) => (
              <li key={w.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="font-mono text-4xl font-bold text-yellow-200">LU{w.entry.sequentialNumber}</p>
                <p className="mt-1 text-lg font-semibold text-white">{w.entry.firstName} {w.entry.lastName}</p>
                <p className="break-all text-sm text-white/50">{w.entry.email}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Qui a gagné quoi" className="space-y-3">
        <h2 className="text-lg font-bold text-white">Qui a gagné quoi</h2>
        {state && winners.length === 0 && (
          <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-white/50">Aucun tirage effectué pour le moment.</p>
        )}
        {groups.map(([prizeName, list]) => (
          <div key={prizeName} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-bold text-accent">
              {prizeName} <span className="ml-1 font-normal text-white/40">{list.filter((w) => w.status === 'won').length} gagnant(s)</span>
            </p>
            <ul className="mt-2 divide-y divide-white/10">
              {list.map((w) => {
                const forfeited = w.status === 'forfeited';
                return (
                  <li key={w.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <span className={`w-20 shrink-0 font-mono text-lg font-bold ${forfeited ? 'text-white/30 line-through' : 'text-yellow-200'}`}>
                      LU{w.entry.sequentialNumber}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate font-semibold ${forfeited ? 'text-white/40 line-through' : 'text-white'}`}>
                        {w.entry.firstName} {w.entry.lastName}
                      </span>
                      <span className="block truncate text-sm text-white/50">{w.entry.email}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {w.entry.status !== 'validated' && !forfeited && (
                        <span className="rounded-full border border-red-400/40 bg-red-400/10 px-2.5 py-0.5 text-[0.7rem] font-semibold text-red-300">
                          Participation plus validée
                        </span>
                      )}
                      <span className="text-xs text-white/40">
                        {forfeited && w.forfeitedAt ? `Absent · ${fmtDate(w.forfeitedAt)}` : `Tiré le ${fmtDate(w.drawnAt)}`}
                      </span>
                      {!forfeited && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => replace(w)}
                          className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40 disabled:opacity-50"
                        >
                          Absent : remplacer
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
