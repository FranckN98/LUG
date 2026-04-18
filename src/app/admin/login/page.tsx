'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Email ou mot de passe incorrect.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* Background gradient brand */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0505] via-[#1a0808] to-[#110606]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_20%_80%,rgba(233,140,11,0.18),transparent_70%)]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,rgba(140,26,26,0.4),transparent_65%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">

          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center mb-5">
              <Image
                src="/logo_neu.png"
                alt="Level Up in Germany"
                width={120}
                height={48}
                className="object-contain drop-shadow-[0_0_20px_rgba(233,140,11,0.25)]"
                priority
              />
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-white/15" />
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.35em] text-white/35">Espace Admin</p>
              <div className="h-px w-8 bg-white/15" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@levelupingermany.de"
                  className="w-full rounded-xl bg-white/[0.08] border border-white/10 text-white placeholder-white/25 px-4 py-3 pr-11 text-sm focus:outline-none focus:border-accent/50 focus:bg-white/[0.12] transition"
                />
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full rounded-xl bg-white/[0.08] border border-white/10 text-white placeholder-white/25 px-4 py-3 pr-11 text-sm focus:outline-none focus:border-accent/50 focus:bg-white/[0.12] transition"
                />
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-12 rounded-xl bg-primary text-white font-semibold text-sm tracking-wide shadow-[0_4px_20px_rgba(140,26,26,0.4)] hover:bg-[#a82020] hover:shadow-[0_6px_28px_rgba(140,26,26,0.5)] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>

          </form>

          {/* Accent line */}
          <div className="mt-8 flex items-center gap-3 justify-center">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/20">Accès restreint</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

        </div>
      </div>
    </div>
  );
}
