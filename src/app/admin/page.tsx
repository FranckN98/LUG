import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ensureDefaultStats } from '@/lib/siteStats';
import { backfillAcceptedMembersToNewsletter } from '@/lib/memberNewsletter';
import StatsAdmin from './components/StatsAdmin';

export default async function AdminDashboard() {
  let totalSubscribers = 0;
  let pendingMembers = 0;
  let totalMembers = 0;
  try {
    [totalSubscribers, pendingMembers, totalMembers] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.member.count({ where: { applicationStatus: 'pending' } }),
      prisma.member.count({ where: { applicationStatus: 'accepted' } }),
    ]);
  } catch {
    // DB not yet available
  }
  // Ensure default KPI rows exist so the editor below is never empty.
  await ensureDefaultStats();
  // Idempotently backfill accepted members into the newsletter list.
  await backfillAcceptedMembersToNewsletter();

  const stats = [
    {
      label: 'Abonnés newsletter',
      value: totalSubscribers,
      sub: 'inscrits au PDF événement',
      color: 'text-accent',
      bg: 'bg-accent/10 border-accent/20',
      href: '/admin/newsletter',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Membres actifs',
      value: totalMembers,
      sub: pendingMembers > 0 ? `${pendingMembers} demande${pendingMembers > 1 ? 's' : ''} en attente` : 'adhésions acceptées',
      color: pendingMembers > 0 ? 'text-amber-400' : 'text-emerald-400',
      bg: pendingMembers > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
      href: '/admin/members',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Tableau de bord</p>
        <h1 className="text-2xl font-bold text-white">Bienvenue</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-2xl border p-5 sm:p-6 ${s.bg} hover:opacity-90 transition-opacity`}>
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-sm font-semibold text-white/70">{s.label}</p>
            <p className={`mt-0.5 text-xs font-semibold ${pendingMembers > 0 && s.href === '/admin/members' ? 'text-amber-400' : 'text-white/35'}`}>
              {s.sub}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 max-w-2xl">
        <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-white/30">Accès rapide</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/members"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Gérer les membres
            {pendingMembers > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {pendingMembers}
              </span>
            )}
          </Link>
          <Link
            href="/admin/newsletter"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Newsletter
          </Link>
          <Link
            href="/admin/homepage"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Page d'accueil (Hero & Boutons)
          </Link>
        </div>
      </div>

      {/* KPIs editor */}
      <div className="mt-10">
        <StatsAdmin />
      </div>
    </div>
  );
}
