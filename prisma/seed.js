const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding blog posts...');

  await prisma.blogPost.deleteMany();

  await prisma.blogPost.createMany({
    data: [
      {
        id: 'blog-post-001',
        title: 'Notre première Méga Conférence 2025 : 300+ participants, une communauté soudée',
        body: `Le 15 mars 2025 restera gravé dans la mémoire de tous ceux qui ont eu la chance d'y participer. Plus de 300 membres de la diaspora africaine se sont réunis à Dortmund pour la toute première Méga Conférence de Level Up in Germany.\n\nDes tables rondes inspirantes, des speakers venus de toute l'Allemagne, des ateliers pratiques sur l'emploi, l'entrepreneuriat et l'intégration — cette journée a prouvé que notre communauté est forte, unie et déterminée à avancer ensemble.\n\n"Je suis arrivé seul en Allemagne il y a 3 ans. Ce jour-là, j'ai trouvé ma famille." — Témoignage d'un participant.\n\nNous remercions tous nos partenaires, bénévoles et intervenants qui ont rendu cet événement possible. Rendez-vous en 2026 pour une édition encore plus grande.`,
        author: 'Équipe Level Up in Germany',
        category: 'Événements',
        published: true,
        createdAt: new Date('2025-03-20'),
        updatedAt: new Date('2025-03-20'),
      },
      {
        id: 'blog-post-002',
        title: '5 conseils essentiels pour réussir votre intégration professionnelle en Allemagne',
        body: `S'installer en Allemagne est une aventure enrichissante, mais le marché du travail allemand a ses propres codes. Voici les 5 conseils que nos mentors partagent le plus souvent.\n\n**1. Apprenez l'allemand, même basique**\nMême dans un environnement anglophone, parler quelques mots d'allemand ouvre des portes et montre votre respect pour la culture locale.\n\n**2. Faites reconnaître vos diplômes**\nLa reconnaissance des diplômes étrangers (Anerkennung) est cruciale. Renseignez-vous auprès de l'Anerkennungsberatung de votre région.\n\n**3. Construisez votre réseau**\nEn Allemagne, le réseau est tout. Rejoignez des associations professionnelles, participez à des événements comme ceux de Level Up in Germany.\n\n**4. Adaptez votre CV au format allemand**\nPhoto, références professionnelles, lettre de motivation personnalisée — les standards diffèrent de ceux de votre pays d'origine.\n\n**5. Soyez patient et persévérant**\nLes processus de recrutement sont souvent longs. Ne vous découragez pas : chaque refus est une leçon.`,
        author: 'Équipe Level Up in Germany',
        category: 'Carrière',
        published: true,
        createdAt: new Date('2025-06-10'),
        updatedAt: new Date('2025-06-10'),
      },
      {
        id: 'blog-post-003',
        title: 'Rapport d\'impact 2025 : Level Up in Germany en chiffres',
        body: `L'année 2025 a été une année charnière pour Level Up in Germany e.V. Voici un aperçu de notre impact collectif.\n\n**En chiffres**\n- 300+ participants à la Méga Conférence de mars 2025\n- 10+ partenaires et sponsors mobilisés\n- 5 programmes actifs : conférence, mentorat, ateliers, événements réseau, accompagnement emploi\n- 3 villes représentées : Dortmund, Cologne, Berlin\n\n**Ce que disent nos membres**\n"Level Up m'a donné les outils et la confiance pour décrocher mon premier emploi en Allemagne en seulement 6 mois." — Sarah K.\n\n**Perspectives 2026**\nNous prévoyons de doubler notre capacité d'accueil pour l'édition 2026, d'élargir nos programmes de mentorat et de nouer de nouveaux partenariats stratégiques avec des entreprises allemandes.\n\nCe rapport complet sera publié en janvier 2026.`,
        author: 'Équipe Level Up in Germany',
        category: 'Impact',
        published: false,
        createdAt: new Date('2025-11-01'),
        updatedAt: new Date('2025-11-01'),
      },
    ],
  });

  console.log('✅ 3 articles créés (2 publiés, 1 brouillon)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
