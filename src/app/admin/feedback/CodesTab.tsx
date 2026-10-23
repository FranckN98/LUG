'use client';

import { useEffect, useState } from 'react';
import { api } from './api';

type Stats = { total: number; used: number; unused: number; maxPerBatch: number };

export function CodesTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [count, setCount] = useState('50');
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void api<Stats>('/api/admin/feedback/codes').then((res) => res.ok && setStats(res.data));
  }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setCopied(false);
    const res = await api<{ codes?: string[]; error?: string } & Partial<Stats>>('/api/admin/feedback/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: Number(count) }),
    });
    setBusy(false);
    if (!res.ok || !res.data.codes) {
      setError(res.data.error ?? 'La génération a échoué.');
      return;
    }
    setCodes(res.data.codes);
    setStats((s) => ({ ...(s as Stats), total: res.data.total ?? 0, used: res.data.used ?? 0, unused: res.data.unused ?? 0 }));
  }

  const link = (code: string) => `${window.location.origin}/fr/feedback?code=${code}`;

  function download() {
    const lines = ['Code;Lien', ...codes.map((c) => `${c};${link(c)}`)];
    const url = URL.createObjectURL(new Blob([`\uFEFF${lines.join('\r\n')}\r\n`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codes-feedback-level-up.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Codes créés', stats?.total, 'text-white'],
          ['Utilisés', stats?.used, 'text-emerald-300'],
          ['Disponibles', stats?.unused, 'text-accent'],
        ].map(([label, value, tone]) => (
          <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className={`text-2xl font-bold ${tone}`}>{value ?? '…'}</p>
            <p className="mt-0.5 text-xs text-white/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/60">
        <p>
          Chaque participant reçoit un code aléatoire à usage unique (par exemple dans le lien de son e-mail). Le code est
          vérifié puis marqué comme utilisé à l’envoi, mais il n’est conservé avec aucune réponse. Seul son hash est stocké :
          les codes ne s’affichent qu’une seule fois, à la génération.
        </p>
        <p className="mt-2">
          Pour que l’anonymat reste réel, ne conservez pas de tableau « code ↔ personne » après l’envoi des invitations.
        </p>
      </div>

      <form onSubmit={generate} className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <label className="text-xs text-white/50">
          Nombre de codes à générer
          <input
            type="number"
            min={1}
            max={stats?.maxPerBatch ?? 500}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="mt-1 block w-32 rounded-full border border-white/15 bg-[#0f0606]/80 px-4 py-2 text-sm text-white focus:border-accent/60 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent/80 disabled:opacity-50"
        >
          {busy ? 'Génération…' : 'Générer'}
        </button>
      </form>

      {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      {codes.length > 0 && (
        <section aria-label="Codes générés" className="rounded-2xl border border-yellow-400/40 bg-yellow-400/[0.07] p-4">
          <p className="text-sm font-semibold text-yellow-100">
            {codes.length} code(s) généré(s) — enregistrez-les maintenant, ils ne seront plus affichés.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={download} className="rounded-full bg-accent px-5 py-2 text-xs font-bold text-white hover:bg-accent/80">
              Télécharger (codes + liens, CSV)
            </button>
            <button onClick={copyAll} className="rounded-full border border-white/25 px-5 py-2 text-xs font-semibold text-white/85 hover:border-white/45">
              {copied ? 'Copié' : 'Copier les codes'}
            </button>
          </div>
          <ul className="mt-3 grid max-h-72 gap-1 overflow-y-auto font-mono text-sm text-white/85 sm:grid-cols-2 lg:grid-cols-3">
            {codes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
