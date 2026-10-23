'use client';

import { useEffect, useState } from 'react';
import { api } from './api';

type Signup = { id: string; email: string; firstName: string | null; lastName: string | null };

export function SignupsTab() {
  const [signups, setSignups] = useState<Signup[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void api<{ signups: Signup[]; error?: string }>('/api/admin/feedback/signups').then((res) => {
      if (res.ok) setSignups(res.data.signups);
      else setError(res.data.error ?? 'Chargement impossible.');
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-2xl font-bold text-white">{signups ? signups.length : '…'}</p>
          <p className="text-xs text-white/50">Inscriptions aux prochaines visites guidées, Business Tours et événements</p>
        </div>
        <a
          href="/api/admin/feedback/signups?format=csv"
          download
          className="rounded-full border border-accent/50 bg-accent/10 px-5 py-2.5 text-center text-sm font-semibold text-accent hover:bg-accent/20 sm:ml-auto"
        >
          Exporter en CSV
        </a>
      </div>

      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
        Cette liste est enregistrée à part : elle n’a ni date ni lien avec les réponses au feedback, il est donc impossible
        d’associer une adresse à une réponse.
      </p>

      {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      {signups && signups.length === 0 && (
        <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-white/50">Aucune inscription pour le moment.</p>
      )}
      <ul className="space-y-2">
        {(signups ?? []).map((s) => (
          <li key={s.id} className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:gap-5">
            <span className="min-w-0 flex-1 break-all font-medium text-white">{s.email}</span>
            <span className="text-sm text-white/55">{[s.firstName, s.lastName].filter(Boolean).join(' ') || '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
