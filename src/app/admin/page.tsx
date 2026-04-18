import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  let totalContacts = 0, unreadContacts = 0, totalSubscribers = 0;
  try {
    totalContacts = await prisma.contactMessage.count();
    unreadContacts = await prisma.contactMessage.count({ where: { read: false } });
    totalSubscribers = await prisma.newsletterSubscriber.count();
  } catch {
    // DB not yet available
  }

  const stats = [
    {
      label: 'Messages reçus',
      value: totalContacts,
      sub: `${unreadContacts} non lu${unreadContacts !== 1 ? 's' : ''}`,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Abonnés newsletter',
      value: totalSubscribers,
      sub: 'inscrits au PDF événement',
      color: 'text-accent',
      bg: 'bg-accent/10 border-accent/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Tableau de bord</p>
        <h1 className="text-2xl font-bold text-white">Bienvenue</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-6 ${s.bg}`}>
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-sm font-semibold text-white/70">{s.label}</p>
            <p className="mt-0.5 text-xs text-white/35">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
