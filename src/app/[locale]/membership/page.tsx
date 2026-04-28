import type { Locale } from '@/i18n/config';
import MembershipForm from '@/components/MembershipForm';

type Props = { params: Promise<{ locale: Locale }> };

const META: Record<Locale, { title: string; description: string }> = {
  fr: {
    title: 'Devenir membre · Level Up in Germany',
    description:
      'Rejoignez Level Up in Germany en tant que membre officiel. Remplissez le formulaire d\'adhésion.',
  },
  en: {
    title: 'Become a member · Level Up in Germany',
    description:
      'Join Level Up in Germany as an official member. Fill in the membership application form.',
  },
  de: {
    title: 'Mitglied werden · Level Up in Germany',
    description:
      'Werden Sie offizielles Mitglied von Level Up in Germany. Füllen Sie das Beitrittsformular aus.',
  },
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const m = META[locale] ?? META.en;
  return { title: m.title, description: m.description };
}

const HERO: Record<Locale, { heading: string; sub: string }> = {
  fr: {
    heading: 'Devenir membre',
    sub: 'Rejoignez notre association et contribuez à faire grandir Level Up in Germany.',
  },
  en: {
    heading: 'Become a member',
    sub: 'Join our association and help Level Up in Germany grow.',
  },
  de: {
    heading: 'Mitglied werden',
    sub: 'Treten Sie unserem Verein bei und helfen Sie Level Up in Germany zu wachsen.',
  },
};

export default async function MembershipPage({ params }: Props) {
  const { locale } = await params;
  const hero = HERO[locale] ?? HERO.en;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#110808] via-[#1a0a0a] to-[#0e0505] py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.35em] text-accent/60">
            Level Up in Germany
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {hero.heading}
          </h1>
          <p className="mt-4 text-base text-white/55 md:text-lg">{hero.sub}</p>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-2xl px-6 py-16 md:py-20">
        <MembershipForm locale={locale} />
      </section>
    </main>
  );
}
