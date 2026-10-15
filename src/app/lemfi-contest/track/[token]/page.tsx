import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntryForParticipant } from '@/lib/lemfiContest';
import { formatLemfiNumber } from '@/lib/lemfiContestUtils';
import { ContestHeader } from '../../ContestHeader';

export const dynamic = 'force-dynamic';

// Le lien contient un secret : pas d'indexation, pas de Referer sortant.
export const metadata: Metadata = {
  title: 'Ma participation — Jeu concours LemFi',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Berlin' });

export default async function TrackPage({ params }: { params: { token: string } }) {
  const entry = await getEntryForParticipant(params.token);
  if (!entry) notFound();

  const status = {
    pending: {
      title: 'En attente de vérification',
      text: 'Votre éligibilité au tirage sera confirmée après vérification de votre preuve.',
      tone: 'border-amber-300 bg-amber-50 text-amber-900',
    },
    validated: {
      title: 'Participation validée',
      text: 'Vous êtes éligible au tirage. Votre numéro reste inchangé.',
      tone: 'border-green-300 bg-green-50 text-green-900',
    },
    rejected: {
      title: 'Participation non retenue',
      text: 'Votre preuve n’a pas pu être validée.',
      tone: 'border-red-300 bg-red-50 text-red-900',
    },
  }[entry.status as 'pending' | 'validated' | 'rejected'] ?? {
    title: 'En attente de vérification',
    text: 'Votre éligibilité au tirage sera confirmée après vérification de votre preuve.',
    tone: 'border-amber-300 bg-amber-50 text-amber-900',
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-20 pt-5 sm:pt-8">
      <ContestHeader />
      <div className="mt-6 rounded-2xl border border-primary/10 bg-white p-5 text-center shadow-sm sm:p-7">
        <p className="text-sm text-brand-dark/70">Bonjour {entry.firstName}, votre numéro est</p>
        <p className="mt-1 font-display text-5xl font-bold tracking-wide text-primary">
          {formatLemfiNumber(entry.sequentialNumber)}
        </p>

        <div className={`mt-5 rounded-xl border px-4 py-4 text-left ${status.tone}`}>
          <p className="font-bold">{status.title}</p>
          <p className="mt-1 text-sm">{status.text}</p>
          {entry.status !== 'pending' && entry.decisionReason && (
            <p className="mt-2 text-sm">
              <span className="font-semibold">Motif :</span> {entry.decisionReason}
            </p>
          )}
        </div>

        <dl className="mt-5 space-y-1 text-left text-sm text-brand-dark/70">
          <div className="flex justify-between gap-3">
            <dt>Participation reçue le</dt>
            <dd className="text-right font-medium text-brand-dark">{fmt.format(entry.createdAt)}</dd>
          </div>
          {entry.decidedAt && (
            <div className="flex justify-between gap-3">
              <dt>Dernière décision le</dt>
              <dd className="text-right font-medium text-brand-dark">{fmt.format(entry.decidedAt)}</dd>
            </div>
          )}
          {entry.emailSentAt && (
            <div className="flex justify-between gap-3">
              <dt>E-mail de confirmation envoyé le</dt>
              <dd className="text-right font-medium text-brand-dark">{fmt.format(entry.emailSentAt)}</dd>
            </div>
          )}
        </dl>

        <p className="mt-5 text-xs text-brand-dark/60">Ce lien est personnel : ne le partagez pas.</p>
      </div>
    </main>
  );
}
