import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Ensure config exists
    const config = await prisma.ticketingConfig.upsert({
      where: { id: 'singleton' },
      update: { isNewTicketingActive: true },
      create: {
        id: 'singleton',
        isNewTicketingActive: true,
        ticketingProvider: 'tailor',
        pageTitle: 'Choisissez votre formule',
        pageSubtitle: 'Sélectionnez la formule qui vous correspond.',
        pageIntro: 'Que vous soyez étudiant, jeune professionnel, entrepreneur ou porteur de projet, Level Up in Germany 2026 propose des parcours adaptés à votre situation.',
        eventDate: '17 octobre 2026',
        eventLocation: 'Francfort',
        ctaButtonText: 'Réserver mon ticket',
        checkoutUrl: 'https://checkout.tailor.so/levelup2026',
        weezeventUrl: '',
        videoUrl: '',
        parkingLocations: '[]',
        moderators: '[]',
        translations: '{}',
      },
    });

    console.log('✓ Config created:', config.id);

    // Delete existing passes first
    await prisma.ticketingPass.deleteMany({});
    console.log('✓ Existing passes deleted');

    // Create 4 default passes
    const passes = [
      {
        name: 'Career Launch Pass',
        label: 'Carrière & Employabilité',
        targetAudience: 'Pour les étudiants, Azubis et jeunes diplômés.',
        description: "Vous souhaitez trouver un stage, un Werkstudentenjob ou votre premier emploi en Allemagne ? Ce parcours est conçu pour vous aider à passer d'une recherche confuse à une stratégie claire.",
        highlights: JSON.stringify([
          "Les secteurs qui recrutent réellement en Allemagne.",
          "Comment construire un CV et un profil LinkedIn qui attirent les recruteurs.",
          "Les erreurs qui empêchent d'obtenir un entretien.",
          "Les compétences les plus recherchées en 2026.",
          "Les stratégies pour accélérer son évolution professionnelle.",
          "Une session interactive avec des experts RH et des professionnels expérimentés.",
        ]),
        includes: JSON.stringify([
          "Accès à toutes les conférences",
          "Accès aux keynotes",
          "Accès à l'espace networking",
          "Accès aux stands et partenaires",
          "Deep Dive Carrière & Employabilité",
          "Possibilité d'échanger avec les intervenants",
        ]),
        decisionPhrase: "Choisissez ce billet si votre priorité est de mieux vous orienter, décrocher de meilleures opportunités et construire une trajectoire professionnelle solide en Allemagne.",
        priceCents: 0,
        oldPriceCents: null,
        currency: 'EUR',
        status: 'coming_soon',
        isActive: true,
        checkoutUrl: '',
        colorPrimary: '#1a4a2e',
        colorSecondary: '#2d7a4f',
        sortOrder: 0,
        availabilityNote: null,
        translations: '{}',
      },
      {
        name: 'Healthcare Excellence Pass',
        label: 'Santé, Pflege & Leadership',
        targetAudience: 'Pour les étudiants, professionnels et porteurs de projets dans le secteur de la santé.',
        description: "Vous souhaitez évoluer dans les métiers de la santé, découvrir les possibilités offertes par le système allemand ou envisager des fonctions de management ? Ce parcours vous donne une vision concrète des opportunités du secteur healthcare.",
        highlights: JSON.stringify([
          "Les différentes possibilités d'évolution dans les métiers du Pflege.",
          "Les spécialisations les plus recherchées.",
          "Les perspectives salariales.",
          "Comment évoluer vers des postes de management.",
          "Comment créer son propre Pflegedienst.",
          "Les erreurs à éviter en début de carrière.",
          "Les opportunités de leadership dans le secteur santé.",
        ]),
        includes: JSON.stringify([
          "Accès à toutes les conférences",
          "Accès aux keynotes",
          "Accès à l'espace networking",
          "Accès aux stands et partenaires",
          "Deep Dive Santé & Leadership",
          "Possibilité d'échanger avec des professionnels du secteur",
        ]),
        decisionPhrase: "Choisissez ce billet si vous travaillez dans la santé, le Pflege ou le care business, ou si vous voulez comprendre comment évoluer dans ce secteur en Allemagne.",
        priceCents: 0,
        oldPriceCents: null,
        currency: 'EUR',
        status: 'coming_soon',
        isActive: true,
        checkoutUrl: '',
        colorPrimary: '#1a2a4a',
        colorSecondary: '#2d4f7a',
        sortOrder: 1,
        availabilityNote: null,
        translations: '{}',
      },
      {
        name: 'Business Growth Pass',
        label: 'Business, Investissement & Croissance',
        targetAudience: 'Pour les entrepreneurs, porteurs de projets, freelances et futurs investisseurs.',
        description: "Vous souhaitez créer une entreprise, investir dans l'immobilier ou construire de nouvelles sources de revenus ? Ce parcours vous aide à comprendre les bases, les erreurs à éviter et les opportunités concrètes pour développer un business en Allemagne.",
        highlights: JSON.stringify([
          "Les fondamentaux de la création d'entreprise en Allemagne.",
          "Les premières étapes pour développer une activité rentable.",
          "Les opportunités dans l'immobilier.",
          "Les bases de l'e-commerce et des modèles business scalables.",
          "Les stratégies de croissance d'un business.",
          "Les erreurs qui coûtent le plus cher aux entrepreneurs.",
          "Les clés pour construire un patrimoine durable.",
        ]),
        includes: JSON.stringify([
          "Accès à toutes les conférences",
          "Accès aux keynotes",
          "Accès à l'espace networking",
          "Accès aux stands et partenaires",
          "Deep Dive Business & Investissement",
          "Possibilité d'échanger avec entrepreneurs, experts et partenaires",
        ]),
        decisionPhrase: "Choisissez ce billet si votre priorité est de lancer, structurer ou développer un projet rentable en Allemagne.",
        priceCents: 0,
        oldPriceCents: null,
        currency: 'EUR',
        status: 'coming_soon',
        isActive: true,
        checkoutUrl: '',
        colorPrimary: '#4a2e1a',
        colorSecondary: '#8c5a1e',
        sortOrder: 2,
        availabilityNote: null,
        translations: '{}',
      },
      {
        name: 'Level Up Expo Stand',
        label: 'Stand exposant',
        targetAudience: 'Pour les entreprises et porteurs de projets souhaitant présenter leurs activités.',
        description: "Votre marque mérite d'être vue.",
        highlights: JSON.stringify([]),
        includes: JSON.stringify([
          "Un espace dans la zone d'exposition avec une table",
          "Un billet Business Growth pour une personne",
          "Accès à la conférence et au parcours Business Growth",
          "Accès à la zone d'exposition",
          "Occasions de présenter votre activité et nouer des contacts",
        ]),
        decisionPhrase: "Offre valable pour une seule personne. Toute personne supplémentaire présente sur le stand doit acheter son propre billet.",
        priceCents: 15000,
        oldPriceCents: null,
        currency: 'EUR',
        status: 'available',
        isActive: true,
        checkoutUrl: '',
        colorPrimary: '#6f4e37',
        colorSecondary: '#a0826d',
        sortOrder: 3,
        availabilityNote: null,
        translations: '{}',
      },
    ];

    for (const pass of passes) {
      const created = await prisma.ticketingPass.create({
        data: pass,
      });
      console.log(`✓ Pass created: ${created.name}`);
    }

    console.log('\n✅ All 4 passes created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
