/**
 * EXEMPLE D'INTÉGRATION DU HERO CAROUSEL
 *
 * Cette file montre comment intégrer le HeroCarousel dans une page
 * Tu peux copier/adapter ce code pour ta page d'événement ou landing page
 */

import HeroCarousel from '@/components/HeroCarousel';

/**
 * OPTION 1: Page d'événement simple
 * Copie ce code dans src/app/[locale]/event/page.tsx
 */
export default function EventPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Carousel */}
      <HeroCarousel
        title="1ER SALON BUSINESS ET SOCIO-CULTUREL DE LA DIASPORA CAMEROUNAISE D'EUROPE"
        subtitle="La billetterie est ouverte !!!"
        autoplayInterval={5000}
      />

      {/* Contenu supplémentaire */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-center">À propos de l'événement</h2>
        <p className="text-lg text-gray-700 mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        {/* Ton contenu ici */}
      </section>
    </main>
  );
}

/**
 * OPTION 2: Avec props personnalisées
 */
export function EventPageCustom() {
  return (
    <HeroCarousel
      title="Ton titre personnalisé"
      subtitle="Ton sous-titre"
      autoplayInterval={4000}      // Change la vitesse (4 secondes)
    />
  );
}

/**
 * OPTION 3: Hero minimal (avec valeurs par défaut)
 */
export function EventPageMinimal() {
  return <HeroCarousel />;
}

/**
 * OPTION 4: Intégration dans une page multilingue (de/en/fr)
 *
 * Crée: src/app/[locale]/event/page.tsx
 */
export function EventPageI18n({ locale = 'fr' }: { locale?: 'de' | 'en' | 'fr' }) {
  const copy = {
    de: {
      title: 'Dein Eventtitel',
      subtitle: 'Dein Untertitel',
    },
    en: {
      title: 'Your event title',
      subtitle: 'Your subtitle',
    },
    fr: {
      title: 'Ton titre d\'événement',
      subtitle: 'Ton sous-titre',
    },
  } as const;

  const t = copy[locale];

  return (
    <main>
      <HeroCarousel
        title={t.title}
        subtitle={t.subtitle}
        autoplayInterval={5000}
      />
      {/* Reste du contenu */}
    </main>
  );
}

/**
 * NOTES IMPORTANTES:
 *
 * 1. 'use client' est AUTOMATIQUE dans le composant HeroCarousel
 *    (voir ligne 1 du fichier HeroCarousel.tsx)
 *
 * 2. Les images DOIVENT être dans public/
 *    ✅ Elles y sont déjà (script copié automatiquement)
 *
 * 3. Les props sont OPTIONNELS (utilise les valeurs par défaut sinon)
 *
 * 4. Pour plus de photos:
 *    - Ajoute-les dans public/
 *    - Mets à jour le tableau 'images' dans HeroCarousel.tsx
 *
 * 5. Pour tester en local:
 *    npm run dev
 *    Puis va à http://localhost:3000/event
 */
