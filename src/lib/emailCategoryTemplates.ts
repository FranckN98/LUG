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
      subject: "Invitation as a Panelist — Level Up in Germany {eventName}",
      body: `Hello {firstName},

I hope you are doing well.

I am reaching out on behalf of Level Up in Germany, an initiative that connects, inspires and supports members of the African diaspora in Germany, especially students, young professionals and entrepreneurs.

We have been following your journey with great interest, especially your work in {fieldOrTopic}. Your experience aligns strongly with the kind of perspective we would like to highlight at our next edition.

We would be honored to invite you as a panelist on the topic:
"{panelTopic}"

The goal is to give our audience practical insights, honest experiences and concrete advice from people who have successfully built their path in Germany.

The event will take place on {eventDate} in {eventCity}. We would be happy to schedule a short call to present the concept in more detail.`,
      ctaText: "Schedule a call",
      ctaLink: "https://www.levelupingermany.com",
    },
    de: {
      subject: "Einladung als Panelgast — Level Up in Germany {eventName}",
      body: `Hallo {firstName},

ich hoffe, es geht Ihnen gut.

Ich melde mich im Namen von Level Up in Germany, einer Initiative, die Menschen aus der afrikanischen Diaspora in Deutschland inspiriert, vernetzt und unterstützt.

Wir verfolgen Ihren Werdegang mit großem Interesse, insbesondere Ihre Arbeit im Bereich {fieldOrTopic}. Ihre Erfahrung passt sehr gut zu den Themen, die wir bei unserer nächsten Ausgabe sichtbar machen möchten.

Daher würden wir Sie gerne als Panelgast zu folgendem Thema einladen:
„{panelTopic}"

Unser Ziel ist es, dem Publikum konkrete Einblicke, ehrliche Erfahrungen und praxisnahe Impulse mitzugeben.

Die Veranstaltung findet am {eventDate} in {eventCity} statt. Gerne würden wir Ihnen das Konzept in einem kurzen Gespräch näher vorstellen.`,
      ctaText: "Gespräch vereinbaren",
      ctaLink: "https://www.levelupingermany.com",
    },
    fr: {
      subject: "Invitation en tant que panéliste — Level Up in Germany {eventName}",
      body: `Bonjour {firstName},

J'espère que vous allez bien.

Je me permets de vous contacter au nom de Level Up in Germany, une initiative qui accompagne et inspire la diaspora africaine, notamment les étudiants, jeunes professionnels et entrepreneurs en Allemagne.

Nous suivons votre parcours avec beaucoup d'intérêt, notamment votre travail dans {fieldOrTopic}. Votre expérience correspond exactement au type de témoignage que nous souhaitons mettre en avant lors de notre prochaine édition.

Nous aimerions vous inviter en tant que panéliste sur le thème suivant :
« {panelTopic} »

L'objectif est de permettre au public de bénéficier de votre expérience, de vos conseils concrets et de votre regard sur les réalités du parcours en Allemagne.

L'événement aura lieu le {eventDate} à {eventCity}. Nous serions ravis d'échanger avec vous lors d'un court appel afin de vous présenter le concept plus en détail.`,
      ctaText: "Planifier un appel",
      ctaLink: "https://www.levelupingermany.com",
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
      subject: "Quick follow-up — Level Up in Germany",
      body: `Hello {firstName},

I hope you are doing well.

I wanted to briefly follow up on our previous message regarding {topic}.

We would still be very happy to connect with you, as we believe your profile, experience or organization could bring real value to our community.

The idea would simply be to have a short conversation, present the concept and see whether a collaboration could make sense.

Thank you in advance for your feedback.`,
      ctaText: "Schedule a short call",
      ctaLink: "https://www.levelupingermany.com/contact",
    },
    de: {
      subject: "Kurze Erinnerung — Level Up in Germany",
      body: `Hallo {firstName},

ich hoffe, es geht Ihnen gut.

Ich wollte mich kurz bezüglich unserer letzten Nachricht zum Thema {topic} bei Ihnen melden.

Wir würden uns weiterhin sehr freuen, mit Ihnen ins Gespräch zu kommen, da wir überzeugt sind, dass Ihr Profil, Ihre Erfahrung oder Ihre Organisation einen echten Mehrwert für unsere Community bieten könnte.

Es geht zunächst nur um einen kurzen Austausch, um Ihnen das Konzept vorzustellen und gemeinsam zu prüfen, ob eine Zusammenarbeit sinnvoll wäre.

Vielen Dank im Voraus für Ihre Rückmeldung.`,
      ctaText: "Kurzes Gespräch vereinbaren",
      ctaLink: "https://www.levelupingermany.com/contact",
    },
    fr: {
      subject: "Petit rappel — Level Up in Germany",
      body: `Bonjour {firstName},

J'espère que vous allez bien.

Je me permets de revenir vers vous concernant notre précédent message au sujet de {topic}.

Nous serions toujours très heureux d'échanger avec vous, car nous pensons que votre profil, votre expérience ou votre organisation pourrait apporter une vraie valeur à notre communauté.

L'idée n'est pas de vous prendre beaucoup de temps, mais simplement d'avoir un court échange pour vous présenter le concept et voir si une collaboration serait pertinente.

Merci beaucoup pour votre retour.`,
      ctaText: "Planifier un court appel",
      ctaLink: "https://www.levelupingermany.com/contact",
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
    tagline: "Moving forward, together.",
    disclaimer:
      "You are receiving this email because we believe that an exchange or collaboration with Level Up in Germany could be relevant.",
  },
  de: {
    closing: "Mit freundlichen Grüßen",
    signature: "Das Level Up in Germany Team",
    tagline: "Gemeinsam den nächsten Schritt gehen.",
    disclaimer:
      "Sie erhalten diese E-Mail, weil wir glauben, dass ein Austausch oder eine Zusammenarbeit mit Level Up in Germany relevant sein könnte.",
  },
  fr: {
    closing: "Bien cordialement,",
    signature: "L'équipe Level Up in Germany",
    tagline: "Monter d'un cap, ensemble.",
    disclaimer:
      "Vous recevez cet e-mail car nous pensons qu'une collaboration ou un échange avec Level Up in Germany pourrait être pertinent.",
  },
};
