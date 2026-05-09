/* eslint-disable no-console */
/*
 * Replace placeholder EN/DE translations (which were cloned from FR) with
 * proper localized content for the 3 seeded blog posts.
 *
 * Idempotent: re-running just overwrites the EN/DE rows. FR rows are left
 * as-is so the original French stays the source of truth.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TRANSLATIONS = {
  'blog-post-001': {
    en: {
      title: 'Our first Mega Conference 2025: 300+ attendees, one united community',
      excerpt: 'On 15 March 2025, more than 300 members of the African diaspora gathered in Dortmund for Level Up in Germany’s very first Mega Conference.',
      body: `15 March 2025 will remain etched in the memory of everyone who had the chance to attend. More than 300 members of the African diaspora gathered in Dortmund for the very first Mega Conference of Level Up in Germany.

Inspiring panels, speakers from across Germany, hands-on workshops on employment, entrepreneurship and integration — that day proved that our community is strong, united and determined to move forward together.

"I arrived in Germany alone three years ago. That day, I found my family." — Attendee testimonial.

We thank all our partners, volunteers and speakers who made this event possible. See you in 2026 for an even bigger edition.`,
      metaTitle: 'Mega Conference 2025: 300+ attendees gathered in Dortmund',
      metaDescription: 'A look back at Level Up in Germany’s very first Mega Conference: 300+ attendees, inspiring panels and a united African diaspora community.',
    },
    de: {
      title: 'Unsere erste Mega-Konferenz 2025: 300+ Teilnehmende, eine geeinte Community',
      excerpt: 'Am 15. März 2025 versammelten sich über 300 Mitglieder der afrikanischen Diaspora in Dortmund zur allerersten Mega-Konferenz von Level Up in Germany.',
      body: `Der 15. März 2025 wird allen, die dabei sein durften, in Erinnerung bleiben. Über 300 Mitglieder der afrikanischen Diaspora kamen in Dortmund zur allerersten Mega-Konferenz von Level Up in Germany zusammen.

Inspirierende Podiumsdiskussionen, Speaker aus ganz Deutschland, praxisnahe Workshops zu Beschäftigung, Unternehmertum und Integration — dieser Tag hat gezeigt, dass unsere Community stark, geeint und entschlossen ist, gemeinsam voranzukommen.

„Ich kam vor drei Jahren allein nach Deutschland. An diesem Tag habe ich meine Familie gefunden." — Stimme einer Teilnehmerin.

Wir danken allen Partnern, Ehrenamtlichen und Referent:innen, die diese Veranstaltung möglich gemacht haben. Wir sehen uns 2026 zu einer noch größeren Ausgabe.`,
      metaTitle: 'Mega-Konferenz 2025: 300+ Teilnehmende in Dortmund',
      metaDescription: 'Rückblick auf die erste Mega-Konferenz von Level Up in Germany: über 300 Teilnehmende, inspirierende Panels und eine geeinte afrikanische Diaspora-Community.',
    },
  },

  'blog-post-002': {
    en: {
      title: '5 essential tips to succeed in your professional integration in Germany',
      excerpt: 'Settling in Germany is rewarding, but the German job market has its own codes. Here are the 5 tips our mentors share most often.',
      body: `Settling in Germany is a rewarding adventure, but the German job market has its own codes. Here are the 5 pieces of advice our mentors share most often.

**1. Learn German, even at a basic level**
Even in an English-speaking environment, speaking a few words of German opens doors and shows your respect for the local culture.

**2. Get your qualifications recognised**
The recognition of foreign qualifications (Anerkennung) is crucial. Reach out to the Anerkennungsberatung in your region.

**3. Build your network**
In Germany, your network is everything. Join professional associations and attend events like those of Level Up in Germany.

**4. Adapt your CV to the German format**
Photo, professional references, tailored cover letter — the standards differ from those in your home country.

**5. Be patient and persistent**
Recruitment processes are often long. Don’t get discouraged: every rejection is a lesson.`,
      metaTitle: '5 tips to land a job in Germany — Level Up in Germany',
      metaDescription: 'Practical advice from our mentors to succeed in your professional integration in Germany: language, qualifications, network, CV and mindset.',
    },
    de: {
      title: '5 essenzielle Tipps für deine berufliche Integration in Deutschland',
      excerpt: 'Sich in Deutschland niederzulassen ist bereichernd, aber der Arbeitsmarkt hat seine eigenen Regeln. Hier sind die 5 Ratschläge, die unsere Mentor:innen am häufigsten geben.',
      body: `Sich in Deutschland niederzulassen ist ein bereicherndes Abenteuer, doch der deutsche Arbeitsmarkt hat seine eigenen Regeln. Hier sind die 5 Ratschläge, die unsere Mentor:innen am häufigsten teilen.

**1. Lerne Deutsch — auch auf einfachem Niveau**
Selbst in einem englischsprachigen Umfeld öffnet das Beherrschen einiger deutscher Wörter Türen und zeigt Respekt vor der lokalen Kultur.

**2. Lass deine Abschlüsse anerkennen**
Die Anerkennung ausländischer Abschlüsse ist entscheidend. Informiere dich bei der Anerkennungsberatung in deiner Region.

**3. Baue dein Netzwerk auf**
In Deutschland ist das Netzwerk alles. Trete Berufsverbänden bei und nimm an Veranstaltungen wie denen von Level Up in Germany teil.

**4. Passe deinen Lebenslauf an das deutsche Format an**
Foto, berufliche Referenzen, individuelles Anschreiben — die Standards unterscheiden sich von denen deines Herkunftslandes.

**5. Sei geduldig und beharrlich**
Bewerbungsprozesse sind oft lang. Lass dich nicht entmutigen: Jede Absage ist eine Lektion.`,
      metaTitle: '5 Tipps für den Berufseinstieg in Deutschland',
      metaDescription: 'Praktische Tipps unserer Mentor:innen für deine berufliche Integration in Deutschland: Sprache, Anerkennung, Netzwerk, Lebenslauf und Mindset.',
    },
  },

  'blog-post-003': {
    en: {
      title: '2025 Impact Report: Level Up in Germany in numbers',
      excerpt: '2025 was a turning point for Level Up in Germany e.V. Here is a snapshot of our collective impact.',
      body: `2025 was a turning point for Level Up in Germany e.V. Here is a snapshot of our collective impact.

**By the numbers**
- 300+ attendees at the March 2025 Mega Conference
- 10+ partners and sponsors engaged
- 5 active programmes: conference, mentoring, workshops, networking events, employment support
- 3 cities represented: Dortmund, Cologne, Berlin

**What our members say**
"Level Up gave me the tools and the confidence to land my first job in Germany in just 6 months." — Sarah K.

**Looking ahead to 2026**
We plan to double our capacity for the 2026 edition, expand our mentoring programmes and forge new strategic partnerships with German companies.

The full report will be published in January 2026.`,
      metaTitle: '2025 Impact Report — Level Up in Germany',
      metaDescription: 'Discover Level Up in Germany’s 2025 results: 300+ attendees, 10+ partners, 5 active programmes and our outlook for 2026.',
    },
    de: {
      title: 'Wirkungsbericht 2025: Level Up in Germany in Zahlen',
      excerpt: '2025 war ein Wendepunkt für Level Up in Germany e.V. Hier ein Überblick über unsere gemeinsame Wirkung.',
      body: `2025 war ein Wendejahr für Level Up in Germany e.V. Hier ein Überblick über unsere gemeinsame Wirkung.

**In Zahlen**
- 300+ Teilnehmende bei der Mega-Konferenz im März 2025
- 10+ Partner und Sponsoren eingebunden
- 5 aktive Programme: Konferenz, Mentoring, Workshops, Netzwerk-Events, Jobcoaching
- 3 vertretene Städte: Dortmund, Köln, Berlin

**Was unsere Mitglieder sagen**
„Level Up hat mir die Werkzeuge und das Selbstvertrauen gegeben, um in nur 6 Monaten meinen ersten Job in Deutschland zu finden." — Sarah K.

**Ausblick 2026**
Für 2026 planen wir, unsere Kapazitäten zu verdoppeln, unsere Mentoring-Programme auszubauen und neue strategische Partnerschaften mit deutschen Unternehmen zu knüpfen.

Der vollständige Bericht erscheint im Januar 2026.`,
      metaTitle: 'Wirkungsbericht 2025 — Level Up in Germany',
      metaDescription: 'Entdecke die Ergebnisse 2025 von Level Up in Germany: 300+ Teilnehmende, 10+ Partner, 5 aktive Programme und unser Ausblick auf 2026.',
    },
  },
};

async function main() {
  let updated = 0;
  let skipped = 0;

  for (const [postId, locales] of Object.entries(TRANSLATIONS)) {
    const exists = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!exists) {
      console.log(`- ${postId} not found, skipping.`);
      skipped += 1;
      continue;
    }

    for (const [locale, payload] of Object.entries(locales)) {
      await prisma.blogPostTranslation.upsert({
        where: { blogPostId_locale: { blogPostId: postId, locale } },
        create: {
          blogPostId: postId,
          locale,
          title: payload.title,
          excerpt: payload.excerpt,
          body: payload.body,
          metaTitle: payload.metaTitle,
          metaDescription: payload.metaDescription,
        },
        update: {
          title: payload.title,
          excerpt: payload.excerpt,
          body: payload.body,
          metaTitle: payload.metaTitle,
          metaDescription: payload.metaDescription,
        },
      });
      console.log(`✓ ${postId} (${locale})`);
      updated += 1;
    }
  }

  console.log(`\nDone. ${updated} translation row(s) upserted, ${skipped} post(s) skipped.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
