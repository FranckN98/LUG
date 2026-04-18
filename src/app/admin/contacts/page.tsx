import { prisma } from '@/lib/prisma';

export default async function AdminContactsPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Formulaire de contact</p>
          <h1 className="text-2xl font-bold text-white">Messages reçus</h1>
        </div>
        <span className="rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-12 text-center">
          <svg className="mx-auto mb-4 w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-white/40 text-sm">Aucun message pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl border p-6 transition ${
                msg.read
                  ? 'border-white/8 bg-white/[0.02]'
                  : 'border-accent/25 bg-accent/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm">{msg.name}</p>
                    {!msg.read && (
                      <span className="rounded-full bg-accent/20 border border-accent/30 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs text-white/40 hover:text-accent transition focus:outline-none"
                  >
                    {msg.email}
                  </a>
                </div>
                <p className="text-xs text-white/30 shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
