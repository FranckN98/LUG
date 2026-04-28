import type { Locale } from '@/i18n/config';
import MembershipForm from '@/components/MembershipForm';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ locale: Locale }> };

const COPY: Record<Locale, { title: string; description: string; heading: string; sub: string }> = {
  fr: {
    title: 'Devenir membre · Level Up in Germany',
    description: "Rejoignez Level Up in Germany en tant que membre officiel. Remplissez le formulaire d'adhésion.",
    heading: 'Devenir membre',
    sub: 'Rejoignez notre association et contribuez à faire grandir Level Up in Germany.',
  },
  en: {
    title: 'Become a member · Level Up in Germany',
    description: 'Join Level Up in Germany as an official member. Fill in the membership application form.',
    heading: 'Become a member',
    sub: 'Join our association and help Level Up in Germany grow.',
  },
  de: {
    title: 'Mitglied werden · Level Up in Germany',
    description: 'Werden Sie offizielles Mitglied von Level Up in Germany. Füllen Sie das Beitrittsformular aus.',
    heading: 'Mitglied werden',
    sub: 'Treten Sie unserem Verein bei und helfen Sie Level Up in Germany zu wachsen.',
  },
};

const SUFFIX: Record<Locale, 'Fr' | 'En' | 'De'> = { fr: 'Fr', en: 'En', de: 'De' };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const { title, description } = COPY[locale] ?? COPY.en;
  return { title, description };
}

async function loadHero(locale: Locale) {
  const fallback = COPY[locale] ?? COPY.en;
  try {
    const cfg = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
    if (!cfg) return { heading: fallback.heading, sub: fallback.sub, bgUrl: null as string | null };
    const s = SUFFIX[locale] ?? 'En';
    return {
      heading: cfg[`membershipHeroHeading${s}`]?.trim() || fallback.heading,
      sub: cfg[`membershipHeroSub${s}`]?.trim() || fallback.sub,
      bgUrl: cfg.membershipHeroBgUrl?.trim() || null,
    };
  } catch {
    return { heading: fallback.heading, sub: fallback.sub, bgUrl: null as string | null };
  }
}

export default async function MembershipPage({ params }: Props) {
  const { locale } = await params;
  const hero = await loadHero(locale);

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#110808] via-[#1a0a0a] to-[#0e0505] py-20 md:py-28">
        {hero.bgUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${hero.bgUrl})` }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#110808]/90 via-[#1a0a0a]/85 to-[#0e0505]/92" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.35em] text-accent/60">
            Level Up in Germany
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">{hero.heading}</h1>
          <p className="mt-4 text-base text-white/55 md:text-lg">{hero.sub}</p>
        </div>
      </section>

      <section id="membership-form" className="mx-auto max-w-2xl px-6 py-16 md:py-20">
        <MembershipForm locale={locale} />
      </section>
    </main>
  );
}
