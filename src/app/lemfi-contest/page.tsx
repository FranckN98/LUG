import type { Metadata } from 'next';
import { getLemfiPublicSettings } from '@/config/lemfiContest';
import { isContestFull } from '@/lib/lemfiContest';
import { ContestHeader } from './ContestHeader';
import { RegistrationForm } from './RegistrationForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Jeu concours Level Up in Germany × LemFi',
  description:
    'Faites plaisir à votre personne préférée et tentez de gagner une tablette, des AirPods, des parapluies, des t-shirts et d’autres surprises le jour de Level Up in Germany.',
};

function Step({ n, title, children }: { n: number; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <li className="flex gap-4 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:p-5">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-brand-dark"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold leading-snug text-brand-dark sm:text-lg">{title}</h2>
        {children}
      </div>
    </li>
  );
}

export default async function LemFiContestPage() {
  const settings = getLemfiPublicSettings();
  const full = await isContestFull().catch(() => false);

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-20 pt-5 sm:max-w-2xl sm:pt-8">
      <ContestHeader />

      <p
        role="note"
        className="mt-4 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold leading-snug text-white sm:text-base"
      >
        Concours réservé aux personnes qui participeront à Level Up in Germany.
      </p>

      <h1 className="mt-6 text-center font-display text-3xl font-bold leading-tight text-brand-dark sm:text-4xl">
        Jeu concours Level Up in Germany × LemFi
      </h1>
      <p className="mt-4 text-base leading-relaxed text-brand-dark/80">
        Level Up, c’est aussi reconnaître les efforts de nos parents et de celles et ceux qui ont toujours été là
        pour nous. Faites plaisir à votre personne préférée et tentez de gagner une tablette, des AirPods, des
        parapluies, des t-shirts et d’autres surprises le jour de Level Up in Germany !
      </p>

      <ol className="mt-7 space-y-3">
        <Step n={1} title={<>Téléchargez LemFi</>}>
          <p className="mt-1 text-sm text-brand-dark/70">en cliquant sur le bouton ci-dessous.</p>
          {settings.partnerUrl ? (
            <a
              href={settings.partnerUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-3 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-white transition hover:bg-primary-light focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
            >
              Télécharger LemFi
            </a>
          ) : (
            <>
              <span
                aria-disabled="true"
                className="mt-3 inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-full bg-primary/40 px-6 text-base font-bold text-white"
              >
                Télécharger LemFi
              </span>
              <p className="mt-2 text-xs text-brand-dark/60">Le lien sera disponible très prochainement.</p>
            </>
          )}
        </Step>

        <Step n={2} title={<>Effectuez un transfert d’au moins 10 € avec le code LEVELUP.</>}>
          <p className="mt-2">
            <span className="inline-block rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-1 font-mono text-base font-bold tracking-widest text-primary">
              LEVELUP
            </span>
          </p>
          {settings.cashbackConfirmed && (
            <p className="mt-3 inline-block rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-brand-dark">
              Recevez 25&nbsp;% de cashback
            </p>
          )}
        </Step>

        <Step n={3} title={<>Inscrivez-vous et envoyez votre capture d’écran.</>} />
      </ol>

      {settings.existingUsersConfirmed && (
        <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm text-brand-dark/80">
          Vous utilisez déjà LemFi&nbsp;? Passez directement aux étapes 2 et 3.
        </p>
      )}

      <section id="participer" className="mt-10 scroll-mt-6">
        <h2 className="text-center font-display text-3xl font-bold text-primary sm:text-4xl">À vous de jouer !</h2>
        {full ? (
          <div role="status" className="mt-5 rounded-2xl border border-primary/15 bg-white p-6 text-center shadow-sm">
            <p className="text-xl font-bold text-brand-dark">Inscriptions complètes</p>
          </div>
        ) : (
          <RegistrationForm />
        )}
      </section>
    </main>
  );
}
