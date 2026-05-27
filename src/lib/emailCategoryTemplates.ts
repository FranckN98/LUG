import type { ContactCategory, Language } from "@/types/emailTemplate";

export interface CategoryTemplate {
  subject: string;
  body: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Localized prebuilt templates per category, in EN/DE/FR.
 *
 * Use `{firstName}`, `{eventDate}`, etc. — they will be substituted
 * at preview/send time. Social URLs are injected automatically.
 *
 * Source content provided by the Level Up in Germany team.
 */
export const CATEGORY_TEMPLATES: Record<ContactCategory, Record<Language, CategoryTemplate>> = {
  // ─────────────────────────────────────────────────────────────
  "Event guest": {
    en: {
      subject: "Invitation to Level Up in Germany {eventName}",
      body: `Hello {firstName},

I hope you are doing well.

We are pleased to invite you to the next edition of Level Up in Germany, taking place on {eventDate} in {eventCity}.

Level Up in Germany brings together students, young professionals, entrepreneurs and inspiring members of the diaspora with one clear goal: to share real experiences, create meaningful connections and help people move forward more strategically in Germany.

The program will include:
- Inspiring panel discussions
- Practical workshops
- Networking opportunities
- Real-life success stories
- Collaboration opportunities

We would be delighted to welcome you to this new edition.`,
      ctaText: "Discover the event",
      ctaLink: "https://www.levelupingermany.com",
    },
    de: {
      subject: "Einladung zu Level Up in Germany {eventName}",
      body: `Hallo {firstName},

ich hoffe, es geht Ihnen gut.

Wir möchten Sie herzlich zur nächsten Ausgabe von Level Up in Germany einladen, die am {eventDate} in {eventCity} stattfinden wird.

Level Up in Germany bringt Studierende, Young Professionals, Unternehmerinnen und Unternehmer sowie inspirierende Persönlichkeiten der Diaspora zusammen. Unser Ziel ist es, echte Erfahrungen zu teilen, wertvolle Kontakte zu schaffen und Menschen dabei zu unterstützen, ihren Weg in Deutschland bewusster und erfolgreicher zu gestalten.

Das erwartet Sie:
- Inspirierende Panels
- Praxisnahe Workshops
- Networking
- Erfahrungsberichte
- Neue Kooperationsmöglichkeiten

Wir würden uns sehr freuen, Sie bei dieser Ausgabe begrüßen zu dürfen.`,
      ctaText: "Mehr über das Event erfahren",
      ctaLink: "https://www.levelupingermany.com",
    },
    fr: {
      subject: "Invitation à Level Up in Germany {eventName}",
      body: `Bonjour {firstName},

J'espère que vous allez bien.

Nous avons le plaisir de vous inviter à la prochaine édition de Level Up in Germany, qui aura lieu le {eventDate} à {eventCity}.

Level Up in Germany est une initiative qui rassemble des étudiants, jeunes professionnels, entrepreneurs et acteurs inspirants de la diaspora autour d'un objectif simple : partager des expériences concrètes, créer des connexions utiles et aider chacun à avancer plus intelligemment dans son parcours en Allemagne.

Au programme :
- Panels inspirants
- Ateliers pratiques
- Networking
- Retours d'expérience
- Opportunités de collaboration

Nous serions ravis de vous compter parmi nous pour cette nouvelle édition.`,
      ctaText: "Découvrir l'événement",
      ctaLink: "https://www.levelupingermany.com",
    },
  },

  // ─────────────────────────────────────────────────────────────
  "Speaker / panelist": {
    en: {
    subject: "Your speaker participation at Level Up in Germany — next steps",
      body: `Hello {firstName},

  thank you very much for our great conversation and for your interest in joining Level Up in Germany as a speaker.

  We are very happy to plan you for our next event. With your background, experience and perspective, you can bring real value to our community.

  Level Up in Germany is a platform for people with an international background in Germany. Our goal is to create orientation, visibility and concrete development opportunities across career, studies, vocational training, entrepreneurship, finance, integration and personal growth.

  More information:
  - Website: https://www.levelupingermany.com
  - Socials: https://www.linkedin.com/company/level-up-in-germany/ | https://www.instagram.com/levelupingermany/ | https://www.tiktok.com/@levelupingermany
  - Event page: https://www.levelupingermany.com/en/events

  Your planned contribution

  Format:
  [Talk / Panel / Workshop / Interview / Fireside Chat]

  Duration:
  [e.g. 20 minutes + 10 minutes Q&A / 45 minutes panel / 60 minutes workshop]

  Topic / placeholder:
  [{panelTopic}]

  Short description:
  [2-5 sentences: What is the core topic? Which problem is addressed? What should participants take away concretely?]

  Potential guiding questions:
  - [Guiding question 1]
  - [Guiding question 2]
  - [Guiding question 3]

  Speaker profile

  To present you professionally on our website, social media and event programme, we kindly need:

  - Speaker photo: [Please send a professional photo]
  - Short bio: [around 100-150 words]
  - Current role: [job title, company, project or activity]
  - LinkedIn profile or website: [insert link]
  - Short statement: [What drives you? Why is this topic important to you?]
  - Travel and availability: [insert timeframe]

  Organizational information

  Planned event details:

  - Date: {eventDate}
  - Location: {eventLocation}, {eventCity}
  - Time: [e.g. 09:00-18:00]
  - Audience: students, apprentices, young professionals, founders and ambitious people with an international background in Germany.

  About one week before the event, we will send all final details on agenda, timing, travel, tech setup and on-site contacts.

  If you plan to use slides, feel free to send them in advance as PPTX or PDF. There are no strict design rules - the most important thing is clarity, practical value and audience relevance.

  Next steps

  You are pre-selected as a speaker for Level Up in Germany. As next step, please confirm:

  - final topic or working title
  - preferred format
  - short bio
  - speaker photo
  - LinkedIn link
  - rough availability on event day

  We are looking forward to your contribution and to building a format that creates real value for our community.`,
    ctaText: "Open the event page",
    ctaLink: "https://www.levelupingermany.com/en/events",
    },
    de: {
    subject: "Deine Speaker-Teilnahme bei Level Up in Germany - nächste Schritte",
      body: `Hallo {firstName},

  vielen Dank für unser angenehmes Gespräch und dein Interesse, bei Level Up in Germany als Speaker:in dabei zu sein.

  Wir freuen uns sehr, dich für unsere nächste Veranstaltung einzuplanen. Mit deinem Werdegang, deiner Erfahrung und deiner Perspektive kannst du unserer Community einen echten Mehrwert bieten.

  Level Up in Germany ist eine Plattform für Menschen mit internationalem Hintergrund in Deutschland. Unser Ziel ist es, Orientierung, Sichtbarkeit und konkrete Entwicklungsmöglichkeiten zu schaffen - in den Bereichen Karriere, Studium, Ausbildung, Unternehmertum, Finanzen, Integration und persönliches Wachstum.

  Mehr Informationen:
  - Website: https://www.levelupingermany.com
  - Social Media: https://www.linkedin.com/company/level-up-in-germany/ | https://www.instagram.com/levelupingermany/ | https://www.tiktok.com/@levelupingermany
  - Event-Seite: https://www.levelupingermany.com/de/events

  Dein geplanter Beitrag

  Format:
  [Vortrag / Panel / Workshop / Interview / Fireside Chat]

  Dauer:
  [z. B. 20 Minuten + 10 Minuten Q&A / 45 Minuten Panel / 60 Minuten Workshop]

  Thema / Platzhalter:
  [{panelTopic}]

  Kurzbeschreibung:
  [2-5 Sätze: Worum geht es? Welches Problem wird behandelt? Was sollen die Teilnehmer:innen konkret mitnehmen?]

  Mögliche Leitfragen:
  - [Leitfrage 1]
  - [Leitfrage 2]
  - [Leitfrage 3]

  Speakerprofil

  Damit wir dich professionell auf unserer Website, in den Social-Media-Beiträgen und im Eventprogramm vorstellen können, benötigen wir bitte:

  - Speakerbild: [Bitte ein professionelles Foto senden]
  - Kurzer Lebenslauf / Bio: [ca. 100-150 Wörter]
  - Aktuelle Position / Rolle: [Jobtitel, Unternehmen, Projekt oder Tätigkeit]
  - LinkedIn-Profil oder Website: [Link einfügen]
  - Kurzstatement: [Was treibt dich an? Warum ist dir dieses Thema wichtig?]
  - An- und Abreise / Verfügbarkeit: [Uhrzeit oder Zeitraum einfügen]

  Organisatorische Informationen

  Unsere Veranstaltung findet voraussichtlich statt am:

  - Datum: {eventDate}
  - Ort: {eventLocation}, {eventCity}
  - Zeitraum: [z. B. 09:00-18:00 Uhr]
  - Zielgruppe: Studierende, Auszubildende, Young Professionals, Gründer:innen und ambitionierte Menschen mit internationalem Hintergrund in Deutschland.

  Etwa eine Woche vor der Veranstaltung senden wir dir noch einmal alle finalen Informationen zu Ablauf, Timing, Anreise, Technik und Ansprechpartner:innen vor Ort.

  Falls du eine Präsentation nutzen möchtest, kannst du uns diese gerne vorab als PPTX oder PDF zusenden. Es gibt keine festen Designvorgaben - wichtig ist nur, dass die Inhalte klar, praxisnah und für unsere Zielgruppe verständlich sind.

  Nächste Schritte

  Du bist als Speaker:in für Level Up in Germany vorgemerkt. Als nächsten Schritt freuen wir uns über eine kurze Bestätigung zu:

  - finalem Thema oder Arbeitstitel
  - gewünschtem Format
  - kurzer Bio
  - Speakerbild
  - LinkedIn-Link
  - grober Verfügbarkeit am Eventtag

  Wir freuen uns sehr auf deine Mitwirkung und darauf, gemeinsam ein Format zu schaffen, das unserer Community echten Mehrwert bietet.`,
    ctaText: "Zur Event-Seite",
    ctaLink: "https://www.levelupingermany.com/de/events",
    },
    fr: {
    subject: "Ta participation comme speaker chez Level Up in Germany - prochaines étapes",
      body: `Bonjour {firstName},

  merci encore pour notre échange et pour ton intérêt à participer comme speaker à Level Up in Germany.

  Nous sommes très heureux de te prévoir pour notre prochain événement. Avec ton parcours, ton expérience et ton regard, tu peux apporter une vraie valeur à notre communauté.

  Level Up in Germany est une plateforme pour les personnes ayant un parcours international en Allemagne. Notre mission est de créer de l'orientation, de la visibilité et des opportunités concrètes de progression dans les domaines carrière, études, formation, entrepreneuriat, finances, intégration et développement personnel.

  Plus d'informations:
  - Website: https://www.levelupingermany.com
  - Réseaux sociaux: https://www.linkedin.com/company/level-up-in-germany/ | https://www.instagram.com/levelupingermany/ | https://www.tiktok.com/@levelupingermany
  - Page événement: https://www.levelupingermany.com/fr/events

  Ton intervention prévue

  Format:
  [Talk / Panel / Atelier / Interview / Fireside Chat]

  Durée:
  [par ex. 20 minutes + 10 minutes Q&A / 45 minutes panel / 60 minutes atelier]

  Thème / placeholder:
  [{panelTopic}]

  Description courte:
  [2-5 phrases: de quoi parle l'intervention? Quel problème est traité? Quels résultats concrets pour les participant(e)s?]

  Questions directrices possibles:
  - [Question 1]
  - [Question 2]
  - [Question 3]

  Profil speaker

  Pour te présenter de manière professionnelle sur notre site, nos réseaux sociaux et le programme de l'événement, nous avons besoin de:

  - Photo speaker: [merci d'envoyer une photo professionnelle]
  - Bio courte: [environ 100-150 mots]
  - Poste / rôle actuel: [fonction, entreprise, projet ou activité]
  - LinkedIn ou site web: [insérer le lien]
  - Court statement: [qu'est-ce qui te motive? pourquoi ce sujet est important pour toi?]
  - Arrivée / disponibilité: [horaire ou plage à indiquer]

  Informations organisationnelles

  L'événement est prévu:

  - Date: {eventDate}
  - Lieu: {eventLocation}, {eventCity}
  - Horaires: [par ex. 09:00-18:00]
  - Public: étudiants, alternants, young professionals, fondateurs et personnes ambitieuses avec un parcours international en Allemagne.

  Environ une semaine avant l'événement, nous t'enverrons les informations finales sur le déroulé, le timing, le déplacement, la technique et les contacts sur place.

  Si tu souhaites utiliser une présentation, tu peux nous l'envoyer à l'avance en PPTX ou PDF. Il n'y a pas de contrainte design stricte - l'essentiel est d'avoir un contenu clair, concret et utile pour notre public.

  Prochaines étapes

  Tu es pré-validé(e) comme speaker pour Level Up in Germany. Merci de confirmer:

  - thème final ou titre de travail
  - format souhaité
  - bio courte
  - photo speaker
  - lien LinkedIn
  - disponibilité approximative le jour de l'événement

  Nous serons ravis de construire avec toi un format fort et utile pour la communauté.`,
    ctaText: "Voir la page événement",
    ctaLink: "https://www.levelupingermany.com/fr/events",
    },
  },

  // ─────────────────────────────────────────────────────────────
  "Business Tour guest": {
    en: {
      subject: "Invitation to the Level Up Business Tour",
      body: `Hello {firstName},

I hope you are doing well.

We are reaching out as part of the Level Up Business Tour, a video format created by Level Up in Germany to highlight inspiring entrepreneurs, creators and project builders in Germany.

The goal is simple: to show the reality behind the journey — the decisions, challenges, lessons learned and practical insights that can help others move forward with more clarity.

We are very interested in your journey in {businessField} and would like to invite you for a mini-documentary style interview.

The format would highlight:
- Your personal story
- Your business
- Behind-the-scenes insights
- Key challenges and lessons
- Practical advice for the community

We believe your experience could inspire many people.`,
      ctaText: "Discuss the concept",
      ctaLink: "https://www.levelupingermany.com",
    },
    de: {
      subject: "Einladung zum Level Up Business Tour",
      body: `Hallo {firstName},

ich hoffe, es geht Ihnen gut.

Wir kontaktieren Sie im Rahmen des Level Up Business Tour, einem Videoformat von Level Up in Germany, mit dem wir inspirierende Unternehmerinnen, Unternehmer und Projektträger in Deutschland sichtbar machen möchten.

Das Ziel ist klar: Wir möchten nicht nur Ergebnisse zeigen, sondern auch die Realität dahinter — die Entscheidungen, Herausforderungen, Lernprozesse und konkreten Erfahrungen, die anderen Menschen helfen können.

Ihr Werdegang im Bereich {businessField} interessiert uns sehr. Deshalb würden wir Sie gerne für ein Mini-Dokumentationsformat interviewen.

Im Fokus stehen:
- Ihre persönliche Geschichte
- Ihr Business
- Ein Blick hinter die Kulissen
- Herausforderungen und Learnings
- Praktische Tipps für die Community

Wir sind überzeugt, dass Ihre Erfahrung viele Menschen inspirieren kann.`,
      ctaText: "Konzept besprechen",
      ctaLink: "https://www.levelupingermany.com",
    },
    fr: {
      subject: "Invitation au Level Up Business Tour",
      body: `Bonjour {firstName},

J'espère que vous allez bien.

Nous vous contactons dans le cadre du Level Up Business Tour, un format vidéo créé par Level Up in Germany pour mettre en lumière des entrepreneurs, créateurs et porteurs de projets inspirants en Allemagne.

L'objectif est simple : montrer les coulisses d'un parcours, comprendre les réalités du terrain, partager les difficultés, les décisions importantes et les conseils qui peuvent aider d'autres personnes à se lancer plus intelligemment.

Nous serions très intéressés par votre parcours dans {businessField} et aimerions vous proposer une interview sous forme de mini-documentaire.

Ce format permettrait de présenter :
- Votre histoire
- Votre activité
- Les coulisses de votre travail
- Les défis rencontrés
- Les conseils pour la communauté

Nous pensons que votre expérience pourrait inspirer beaucoup de personnes.`,
      ctaText: "Discuter du concept",
      ctaLink: "https://www.levelupingermany.com",
    },
  },

  // ─────────────────────────────────────────────────────────────
  Sponsor: {
    en: {
      subject: "Sponsorship Opportunity — Level Up in Germany {eventName}",
      body: `Hello {firstName},

I hope you are doing well.

I am reaching out on behalf of Level Up in Germany, an initiative supporting students, young professionals and entrepreneurs from the diaspora in Germany through events, workshops, panel discussions and educational content.

Following the success of our last edition, which brought together around {lastEventParticipants} participants, we are now preparing a more ambitious edition taking place on {eventDate} in {eventCity}.

We believe {companyName} could be a strong partner for this initiative and benefit from direct visibility within a young, engaged and multicultural community.

A sponsorship would allow your company to:
- Increase visibility within a targeted community
- Associate your brand with education, empowerment and integration
- Present your services, opportunities or social engagement
- Connect directly with international talents and young professionals

We would be happy to present our sponsorship options in a short call.`,
      ctaText: "Receive the sponsorship deck",
      ctaLink: "https://www.levelupingermany.com",
    },
    de: {
      subject: "Sponsoring-Anfrage — Level Up in Germany {eventName}",
      body: `Hallo {firstName},

ich hoffe, es geht Ihnen gut.

Ich kontaktiere Sie im Namen von Level Up in Germany, einer Initiative, die Studierende, Young Professionals und Unternehmerinnen und Unternehmer der Diaspora in Deutschland durch Events, Workshops, Panels und Bildungsformate unterstützt.

Nach dem Erfolg unserer letzten Ausgabe mit rund {lastEventParticipants} Teilnehmenden planen wir nun eine noch ambitioniertere Ausgabe am {eventDate} in {eventCity}.

Wir sind überzeugt, dass {companyName} ein passender Partner sein könnte, um diese Initiative zu unterstützen und gleichzeitig eine junge, engagierte und multikulturelle Zielgruppe zu erreichen.

Ein Sponsoring bietet Ihnen die Möglichkeit:
- Ihre Sichtbarkeit in einer relevanten Community zu erhöhen
- Ihr Unternehmen mit Bildung, Integration und Empowerment zu verbinden
- Ihre Angebote, Werte oder Karrierechancen zu präsentieren
- Direkt mit internationalen Talenten in Kontakt zu treten

Gerne würden wir Ihnen unsere Sponsoring-Möglichkeiten in einem kurzen Gespräch vorstellen.`,
      ctaText: "Sponsoring-Unterlagen erhalten",
      ctaLink: "https://www.levelupingermany.com",
    },
    fr: {
      subject: "Proposition de sponsoring — Level Up in Germany {eventName}",
      body: `Bonjour {firstName},

J'espère que vous allez bien.

Je vous contacte au nom de Level Up in Germany, une initiative qui accompagne les étudiants, jeunes professionnels et entrepreneurs de la diaspora en Allemagne à travers des événements, ateliers, panels et contenus éducatifs.

Après le succès de notre dernière édition, qui a rassemblé environ {lastEventParticipants} participants, nous préparons une nouvelle édition plus ambitieuse à {eventCity}, prévue le {eventDate}.

Nous pensons que {companyName} pourrait être un partenaire pertinent pour soutenir cette initiative et renforcer sa visibilité auprès d'une audience jeune, engagée et multiculturelle.

Un sponsoring permettrait à votre entreprise de :
- Gagner en visibilité auprès d'une communauté ciblée
- Associer votre image à un projet éducatif et structurant
- Présenter vos opportunités, services ou engagements
- Créer un lien direct avec des talents et profils internationaux

Nous serions ravis de vous présenter nos offres de sponsoring lors d'un court échange.`,
      ctaText: "Recevoir le dossier sponsoring",
      ctaLink: "https://www.levelupingermany.com",
    },
  },

  // ─────────────────────────────────────────────────────────────
  Partner: {
    en: {
      subject: "Partnership Opportunity with Level Up in Germany",
      body: `Hello {firstName},

I hope you are doing well.

I am reaching out on behalf of Level Up in Germany, an initiative that creates bridges between talents, organizations, entrepreneurs and institutions that want to support the diaspora in Germany.

We believe that a collaboration with {organizationName} could create real value for both communities.

Depending on the objective, a partnership could take different forms:
- Participation in an event
- Expert contribution
- Joint workshops
- Cross-visibility
- Logistical, institutional or strategic support
- Co-created content

Our goal is to build useful, credible and long-term collaborations.

We would be happy to exchange with you and explore possible synergies.`,
      ctaText: "Discuss a partnership",
      ctaLink: "https://www.levelupingermany.com/contact",
    },
    de: {
      subject: "Partnerschaftsanfrage mit Level Up in Germany",
      body: `Hallo {firstName},

ich hoffe, es geht Ihnen gut.

Ich melde mich im Namen von Level Up in Germany, einer Initiative, die Brücken zwischen Talenten, Organisationen, Unternehmern und Institutionen schafft, die Menschen aus der Diaspora in Deutschland unterstützen möchten.

Wir glauben, dass eine Zusammenarbeit mit {organizationName} für beide Seiten einen echten Mehrwert schaffen könnte.

Eine Partnerschaft könnte je nach Ziel verschiedene Formen annehmen:
- Teilnahme an einer Veranstaltung
- Fachlicher Input oder Expertise
- Gemeinsame Workshops
- Gegenseitige Sichtbarkeit
- Logistische, institutionelle oder strategische Unterstützung
- Gemeinsame Content-Formate

Unser Ziel ist es, sinnvolle, glaubwürdige und langfristige Kooperationen aufzubauen.

Gerne würden wir uns mit Ihnen austauschen, um mögliche Synergien zu besprechen.`,
      ctaText: "Partnerschaft besprechen",
      ctaLink: "https://www.levelupingermany.com/contact",
    },
    fr: {
      subject: "Proposition de partenariat avec Level Up in Germany",
      body: `Bonjour {firstName},

J'espère que vous allez bien.

Je vous contacte au nom de Level Up in Germany, une initiative qui vise à créer des ponts entre les talents, les organisations, les entrepreneurs et les institutions qui souhaitent accompagner la diaspora dans son développement en Allemagne.

Nous pensons qu'une collaboration avec {organizationName} pourrait créer une réelle valeur pour nos deux communautés.

Selon le format, le partenariat pourrait prendre plusieurs formes :
- Intervention lors d'un événement
- Mise à disposition d'expertise
- Collaboration autour d'un atelier
- Visibilité croisée
- Soutien logistique, institutionnel ou stratégique
- Création de contenu commun

Notre objectif est de construire des collaborations utiles, crédibles et durables.

Nous serions ravis d'échanger avec vous pour identifier les synergies possibles.`,
      ctaText: "Discuter d'un partenariat",
      ctaLink: "https://www.levelupingermany.com/contact",
    },
  },

  // ─────────────────────────────────────────────────────────────
  "Follow-up": {
    en: {
    subject: "Your participation as a speaker at Level Up in Germany",
      body: `Hello {firstName},

  thank you again for our conversation. We would be very happy to welcome you as a speaker at our next Level Up in Germany event.

  Level Up in Germany is a platform for people with an international background in Germany. We create orientation, visibility and concrete development opportunities in career, studies, vocational training, entrepreneurship, finance, integration and personal growth.

  For your contribution, we currently have this placeholder:

  - Format: [Talk / Panel / Workshop / Interview]
  - Duration: [e.g. 20 minutes + Q&A / 45 minutes panel]
  - Topic: [{panelTopic}]
  - Short description: [2-3 sentences about content and value]

  To announce you professionally, we would kindly need:

  - a speaker photo
  - a short bio
  - your current role / position
  - your LinkedIn link
  - your rough availability on event day

  More info:
  - Website: https://www.levelupingermany.com
  - Event page: https://www.levelupingermany.com/en/events
  - Socials: https://www.linkedin.com/company/level-up-in-germany/ | https://www.instagram.com/levelupingermany/ | https://www.tiktok.com/@levelupingermany

  We are looking forward to your contribution and to building a strong format together for our community.`,
    ctaText: "Open event details",
    ctaLink: "https://www.levelupingermany.com/en/events",
    },
    de: {
    subject: "Deine Teilnahme als Speaker:in bei Level Up in Germany",
      body: `Hallo {firstName},

  vielen Dank für unser angenehmes Gespräch. Wir würden uns sehr freuen, dich als Speaker:in bei unserer nächsten Level Up in Germany Veranstaltung dabei zu haben.

  Level Up in Germany ist eine Plattform für Menschen mit internationalem Hintergrund in Deutschland. Wir schaffen Orientierung, Sichtbarkeit und konkrete Entwicklungsmöglichkeiten in den Bereichen Karriere, Studium, Ausbildung, Unternehmertum, Finanzen, Integration und persönliches Wachstum.

  Für deinen Beitrag haben wir aktuell folgenden Platzhalter vorgesehen:

  - Format: [Vortrag / Panel / Workshop / Interview]
  - Dauer: [z. B. 20 Minuten + Q&A / 45 Minuten Panel]
  - Thema: [{panelTopic}]
  - Kurzbeschreibung: [2-3 Sätze zum Inhalt und Mehrwert]

  Damit wir dich professionell ankündigen können, brauchen wir bitte:

  - ein Speakerbild
  - eine kurze Bio
  - deine aktuelle Rolle / Position
  - deinen LinkedIn-Link
  - deine grobe Verfügbarkeit am Eventtag

  Weitere Informationen:
  - Website: https://www.levelupingermany.com
  - Event-Seite: https://www.levelupingermany.com/de/events
  - Social Media: https://www.linkedin.com/company/level-up-in-germany/ | https://www.instagram.com/levelupingermany/ | https://www.tiktok.com/@levelupingermany

  Wir freuen uns sehr auf deine Mitwirkung und darauf, gemeinsam ein starkes Format für unsere Community zu schaffen.`,
    ctaText: "Event-Seite öffnen",
    ctaLink: "https://www.levelupingermany.com/de/events",
    },
    fr: {
    subject: "Ta participation comme speaker à Level Up in Germany",
      body: `Bonjour {firstName},

  merci encore pour notre échange. Nous serions ravis de t'avoir comme speaker lors de notre prochain événement Level Up in Germany.

  Level Up in Germany est une plateforme pour les personnes avec un parcours international en Allemagne. Nous créons de l'orientation, de la visibilité et des opportunités concrètes dans les domaines carrière, études, formation, entrepreneuriat, finances, intégration et développement personnel.

  Pour ton intervention, voici le placeholder prévu:

  - Format: [Talk / Panel / Atelier / Interview]
  - Durée: [ex. 20 minutes + Q&A / 45 minutes panel]
  - Thème: [{panelTopic}]
  - Description courte: [2-3 phrases sur le contenu et la valeur]

  Pour pouvoir t'annoncer de manière professionnelle, nous aurions besoin de:

  - une photo speaker
  - une bio courte
  - ton poste / rôle actuel
  - ton lien LinkedIn
  - ta disponibilité approximative le jour de l'événement

  Plus d'informations:
  - Website: https://www.levelupingermany.com
  - Page événement: https://www.levelupingermany.com/fr/events
  - Réseaux sociaux: https://www.linkedin.com/company/level-up-in-germany/ | https://www.instagram.com/levelupingermany/ | https://www.tiktok.com/@levelupingermany

  Nous serons très heureux de construire avec toi un format fort pour la communauté.`,
    ctaText: "Ouvrir la page événement",
    ctaLink: "https://www.levelupingermany.com/fr/events",
    },
  },

  // ─────────────────────────────────────────────────────────────
  Participant: {
    en: {
      subject: "Welcome to Level Up in Germany — next steps",
      body: `Hello {firstName},

Thank you for registering with Level Up in Germany. We are thrilled to have you in our community.

Below you will find the next steps and key information to make the most of your participation. If you have any question, simply reply to this email.`,
      ctaText: "Access my dashboard",
      ctaLink: "https://www.levelupingermany.com",
    },
    de: {
      subject: "Willkommen bei Level Up in Germany — nächste Schritte",
      body: `Hallo {firstName},

vielen Dank für Ihre Anmeldung bei Level Up in Germany. Wir freuen uns sehr, Sie in unserer Community begrüßen zu dürfen.

Nachfolgend finden Sie die nächsten Schritte und wichtigsten Informationen für Ihre Teilnahme. Bei Fragen antworten Sie einfach auf diese E-Mail.`,
      ctaText: "Zum Dashboard",
      ctaLink: "https://www.levelupingermany.com",
    },
    fr: {
      subject: "Bienvenue chez Level Up in Germany — prochaines étapes",
      body: `Bonjour {firstName},

Merci pour votre inscription à Level Up in Germany. Nous sommes ravis de vous compter parmi nous.

Vous trouverez ci-dessous les prochaines étapes et les informations clés pour profiter au mieux de votre participation. Pour toute question, il vous suffit de répondre à cet e-mail.`,
      ctaText: "Accéder à mon espace",
      ctaLink: "https://www.levelupingermany.com",
    },
  },

  // ─────────────────────────────────────────────────────────────
  Institution: {
    en: {
      subject: "Collaboration with Level Up in Germany",
      body: `Hello {firstName},

I am writing on behalf of Level Up in Germany to introduce our work and explore a possible collaboration with {organizationName}.

We connect international talents, entrepreneurs and partners across Germany through programmes that have impact at scale. We believe an aligned initiative between our teams could unlock meaningful value for the populations you serve.

Would you be available for a short introductory call?`,
      ctaText: "Schedule a meeting",
      ctaLink: "https://www.levelupingermany.com/contact",
    },
    de: {
      subject: "Kooperation mit Level Up in Germany",
      body: `Hallo {firstName},

ich schreibe Ihnen im Namen von Level Up in Germany, um unsere Arbeit kurz vorzustellen und eine mögliche Zusammenarbeit mit {organizationName} zu erkunden.

Wir vernetzen internationale Talente, Unternehmerinnen und Unternehmer sowie Partner in ganz Deutschland durch Programme mit echter Wirkung. Eine abgestimmte Initiative zwischen unseren Teams könnte einen echten Mehrwert für die von Ihnen betreuten Zielgruppen schaffen.

Hätten Sie Zeit für ein kurzes Kennenlerngespräch?`,
      ctaText: "Termin vereinbaren",
      ctaLink: "https://www.levelupingermany.com/contact",
    },
    fr: {
      subject: "Collaboration avec Level Up in Germany",
      body: `Bonjour {firstName},

Je vous écris au nom de Level Up in Germany pour vous présenter brièvement notre travail et explorer une éventuelle collaboration avec {organizationName}.

Nous connectons des talents internationaux, entrepreneurs et partenaires partout en Allemagne à travers des programmes à fort impact. Une initiative alignée entre nos équipes pourrait apporter une réelle valeur aux populations que vous accompagnez.

Seriez-vous disponible pour un court appel de présentation ?`,
      ctaText: "Planifier un rendez-vous",
      ctaLink: "https://www.levelupingermany.com/contact",
    },
  },

  // ─────────────────────────────────────────────────────────────
  Other: {
    en: {
      subject: "A note from Level Up in Germany",
      body: `Hello {firstName},

Thank you for connecting with Level Up in Germany.`,
      ctaText: "Visit our website",
      ctaLink: "https://www.levelupingermany.com",
    },
    de: {
      subject: "Eine Nachricht von Level Up in Germany",
      body: `Hallo {firstName},

vielen Dank für Ihren Kontakt mit Level Up in Germany.`,
      ctaText: "Unsere Website besuchen",
      ctaLink: "https://www.levelupingermany.com",
    },
    fr: {
      subject: "Un mot de Level Up in Germany",
      body: `Bonjour {firstName},

Merci pour votre prise de contact avec Level Up in Germany.`,
      ctaText: "Visiter notre site",
      ctaLink: "https://www.levelupingermany.com",
    },
  },
};

/** Localized closing line + tagline + disclaimer used in the email footer. */
export const FOOTER_COPY: Record<Language, { closing: string; signature: string; tagline: string; disclaimer: string }> = {
  en: {
    closing: "Kind regards,",
    signature: "The Level Up in Germany Team",
    tagline: "Dare to be different.",
    disclaimer:
      "You are receiving this email because we believe that an exchange or collaboration with Level Up in Germany could be relevant.",
  },
  de: {
    closing: "Mit freundlichen Grüßen",
    signature: "Das Level Up in Germany Team",
    tagline: "Wage, anders zu sein.",
    disclaimer:
      "Sie erhalten diese E-Mail, weil wir glauben, dass ein Austausch oder eine Zusammenarbeit mit Level Up in Germany relevant sein könnte.",
  },
  fr: {
    closing: "Bien cordialement,",
    signature: "L'équipe Level Up in Germany",
    tagline: "Ose être différent.",
    disclaimer:
      "Vous recevez cet e-mail car nous pensons qu'une collaboration ou un échange avec Level Up in Germany pourrait être pertinent.",
  },
};
