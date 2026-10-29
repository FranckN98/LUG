import type { Locale } from '@/i18n/config';

/** Textes des sections de l'accueil situées sous le hero (A à H). Le français est la référence. */
export type HomeSectionsCopy = {
  vision: { eyebrow: string; title: string; body: string; closing: string; imageAlt: string };
  proof: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    photoAlts: [string, string, string, string, string];
    partnersTitle: string;
  };
  why: { eyebrow: string; title: string; items: { title: string; body: string }[] };
  next: {
    eyebrow: string;
    title: string;
    body: string;
    openCta: string;
    notifyCta: string;
    facts: {
      dateLocation: string;
      programme: string;
      programmeLink: string;
      tickets: string;
      ticketsLink: string;
      price: string;
      priceFrom: (price: string) => string;
    };
    pendingTitle: string;
    pendingBody: string;
    form: {
      emailLabel: string;
      sending: string;
      success: string;
      invalid: string;
      error: string;
      rate: string;
      consentPrefix: string;
      consentLink: string;
      consentSuffix: string;
    };
  };
  partners: {
    eyebrow: string;
    title: string;
    body: string;
    axes: { title: string; body: string }[];
    offersTitle: string;
    offers: string[];
    primaryCta: string;
    secondaryLink: string;
    imageAlt: string;
  };
  tour: { eyebrow: string; title: string; body: string; cta: string };
  contribute: {
    eyebrow: string;
    title: string;
    body: string;
    options: { title: string; hint: string; mailSubject?: string }[];
  };
  final: { title: string; body: string; partner: string; contribute: string };
  /** Galerie communauté du bas de page (alimentation séparée du Hero, voir l'admin Page d'accueil). */
  community: { eyebrow: string; title: string; hint: string; regionLabel: string };
};

export const homeSectionsCopy: Record<Locale, HomeSectionsCopy> = {
  fr: {
    vision: {
      eyebrow: 'Notre vision',
      title: 'Des talents à réunir. Des expériences à transmettre. Un avenir à construire.',
      body: 'Partout en Allemagne, des étudiants, des professionnels et des entrepreneurs de la diaspora africaine construisent leur parcours. Level Up in Germany les réunit pour partager leurs expériences, rendre leurs initiatives visibles et créer des liens avec les personnes et les organisations qui peuvent les aider à avancer.',
      closing:
        'Notre ambition : faire circuler les connaissances, renforcer les connexions et donner à chacun davantage de moyens pour construire sa prochaine étape.',
      imageAlt: 'Participants suivant une intervention lors de la Méga Conférence 2025',
    },
    proof: {
      eyebrow: 'Level Up en action',
      title: 'Une vision qui prend vie dans les rencontres.',
      body: 'Des échanges sur la carrière, des expériences entrepreneuriales partagées et des rencontres entre participants, intervenants et partenaires : découvrez ce qui fait vivre Level Up in Germany.',
      cta: 'Revivre la dernière édition',
      photoAlts: [
        'Panel d’intervenants lors de la Méga Conférence 2025',
        'Public attentif lors de la Méga Conférence 2025',
        'Échanges entre participants lors de la Méga Conférence 2025',
        'Questions-réponses avec le public lors de la Méga Conférence 2025',
        'Rencontre entre deux participantes lors de la Méga Conférence 2025',
      ],
      partnersTitle: 'Partenaires de l’édition 2025',
    },
    why: {
      eyebrow: 'Pourquoi participer',
      title: 'Des perspectives pour avancer. Des rencontres pour aller plus loin.',
      items: [
        {
          title: 'Faire avancer sa carrière',
          body: 'Mieux comprendre le monde professionnel en Allemagne et apprendre de celles et ceux qui y construisent leur parcours.',
        },
        {
          title: 'Nourrir son projet entrepreneurial',
          body: 'Découvrir des expériences de terrain, confronter ses idées et mieux comprendre les réalités du développement d’une activité.',
        },
        {
          title: 'Élargir son réseau',
          body: 'Échanger avec des étudiants, professionnels, entrepreneurs et organisations réunis autour d’intérêts communs.',
        },
        {
          title: 'Découvrir des parcours qui ouvrent des perspectives',
          body: 'Rencontrer des personnes dont les expériences permettent de se projeter et d’aborder sa prochaine étape avec davantage de repères.',
        },
      ],
    },
    next: {
      eyebrow: 'Le rendez-vous Level Up',
      title: 'Prenez part à la prochaine édition.',
      body: 'Retrouvez la communauté Level Up pour une journée de partage d’expérience, de discussions et de rencontres autour de la carrière et de l’entrepreneuriat en Allemagne.',
      openCta: 'Réserver mon billet',
      notifyCta: 'Être informé de la prochaine édition',
      facts: {
        dateLocation: 'Date et lieu',
        programme: 'Programme et intervenants',
        programmeLink: 'Consulter le programme',
        tickets: 'Contenu des billets',
        ticketsLink: 'Voir le détail des billets',
        price: 'Prix et réservation',
        priceFrom: (price) => `À partir de ${price}`,
      },
      pendingTitle: 'Informations à venir',
      pendingBody:
        'La date, le lieu, le programme, les intervenants, le contenu des billets et les tarifs seront publiés ici dès leur confirmation.',
      form: {
        emailLabel: 'Votre adresse e-mail',
        sending: 'Envoi…',
        success: 'Merci ! Nous vous écrirons dès que la prochaine édition sera annoncée.',
        invalid: 'Adresse e-mail invalide.',
        error: 'Une erreur est survenue. Réessayez plus tard.',
        rate: 'Trop de tentatives. Réessayez plus tard.',
        consentPrefix: 'J’ai lu et j’accepte la ',
        consentLink: 'politique de confidentialité',
        consentSuffix: ' concernant le traitement de mes données personnelles.',
      },
    },
    partners: {
      eyebrow: 'Partenariats',
      title: 'Associez votre organisation à l’ambition de cette communauté.',
      body: 'Level Up in Germany crée un espace de rencontre entre les talents de la diaspora africaine, les entrepreneurs et les organisations qui souhaitent contribuer à leur développement. En devenant partenaire ou exposant, vous pouvez prendre part à cette dynamique et faire connaître votre organisation auprès d’un public engagé dans son avenir professionnel et entrepreneurial.',
      axes: [
        {
          title: 'Rencontrer une audience pertinente',
          body: 'Échangez avec des étudiants, professionnels et entrepreneurs aux parcours et aux projets variés.',
        },
        {
          title: 'Faire connaître votre organisation',
          body: 'Présentez votre activité grâce aux formats de présence et de visibilité prévus dans l’offre de partenariat.',
        },
        {
          title: 'Contribuer à la transmission',
          body: 'Soutenez un événement qui favorise le partage d’expérience, la découverte de parcours et les rencontres.',
        },
      ],
      offersTitle: 'Dans l’offre actuelle',
      offers: [
        'Présence lors des événements, sur le site et sur les réseaux sociaux',
        'Stand exposant pour présenter votre marque, votre produit ou votre service',
        'Dossier de partenariat consultable en ligne',
      ],
      primaryCta: 'Découvrir les partenariats',
      secondaryLink: 'Exposer lors de l’événement',
      imageAlt: 'Échange près du stand d’un partenaire lors de la Méga Conférence 2025',
    },
    tour: {
      eyebrow: 'Au-delà de l’événement',
      title: 'Découvrez le travail derrière les parcours entrepreneuriaux.',
      body: 'Avec le Level Up Business Tour, nous allons à la rencontre de celles et ceux qui construisent une activité. Leurs choix, leurs difficultés et leurs apprentissages donnent un regard concret sur l’entrepreneuriat et prolongent la transmission au-delà de la conférence.',
      cta: 'Découvrir le Business Tour',
    },
    contribute: {
      eyebrow: 'Construisons la suite',
      title: 'Une vision partagée se construit avec des personnes engagées.',
      body: 'Vous vous reconnaissez dans cette ambition ? Contribuez à Level Up in Germany en apportant vos compétences, en partageant votre expérience ou en nous mettant en relation avec des organisations qui souhaitent s’impliquer.',
      options: [
        { title: 'Rejoindre l’équipe bénévole', hint: 'Écrire à l’équipe', mailSubject: 'Bénévolat – Level Up in Germany' },
        { title: 'Proposer une intervention', hint: 'Écrire à l’équipe', mailSubject: 'Proposition d’intervention – Level Up in Germany' },
        { title: 'Mettre en relation', hint: 'Formulaire de contact' },
      ],
    },
    final: {
      title: 'Prenez votre place dans la prochaine étape de Level Up.',
      body: 'Venez rencontrer, partager et apprendre. Associez votre organisation au projet. Ou contribuez à faire vivre la vision.',
      partner: 'Devenir partenaire',
      contribute: 'Contribuer au projet',
    },
    community: {
      eyebrow: 'Communauté',
      title: 'Notre communauté en images',
      hint: 'Glisser ou balayer pour explorer',
      regionLabel: 'Galerie photos de la communauté Level Up in Germany',
    },
  },

  en: {
    vision: {
      eyebrow: 'Our vision',
      title: 'Talent to bring together. Experience to pass on. A future to build.',
      body: 'Across Germany, students, professionals and entrepreneurs from the African diaspora are building their paths. Level Up in Germany brings them together to share their experience, make their initiatives visible and connect with the people and organisations that can help them move forward.',
      closing:
        'Our ambition: to circulate knowledge, strengthen connections and give everyone more means to build their next step.',
      imageAlt: 'Attendees following a talk at the 2025 Mega Conference',
    },
    proof: {
      eyebrow: 'Level Up in action',
      title: 'A vision that comes to life in the encounters.',
      body: 'Conversations about careers, entrepreneurial experiences shared, and meetings between participants, speakers and partners: discover what makes Level Up in Germany come alive.',
      cta: 'Relive the latest edition',
      photoAlts: [
        'Speaker panel at the 2025 Mega Conference',
        'Engaged audience at the 2025 Mega Conference',
        'Participants talking at the 2025 Mega Conference',
        'Audience Q&A at the 2025 Mega Conference',
        'Two attendees meeting at the 2025 Mega Conference',
      ],
      partnersTitle: 'Partners of the 2025 edition',
    },
    why: {
      eyebrow: 'Why take part',
      title: 'Perspectives to move forward. Connections to go further.',
      items: [
        {
          title: 'Move your career forward',
          body: 'Better understand the professional world in Germany and learn from those who are building their careers there.',
        },
        {
          title: 'Nourish your entrepreneurial project',
          body: 'Discover real-world experiences, test your ideas and better understand what it takes to grow a business.',
        },
        {
          title: 'Widen your network',
          body: 'Meet students, professionals, entrepreneurs and organisations brought together by shared interests.',
        },
        {
          title: 'Discover paths that open up perspectives',
          body: 'Meet people whose experiences help you picture your future and approach your next step with more points of reference.',
        },
      ],
    },
    next: {
      eyebrow: 'The Level Up gathering',
      title: 'Take part in the next edition.',
      body: 'Join the Level Up community for a day of shared experience, discussion and meetings around careers and entrepreneurship in Germany.',
      openCta: 'Book my ticket',
      notifyCta: 'Get notified about the next edition',
      facts: {
        dateLocation: 'Date and venue',
        programme: 'Programme and speakers',
        programmeLink: 'See the programme',
        tickets: 'What the tickets include',
        ticketsLink: 'See ticket details',
        price: 'Price and booking',
        priceFrom: (price) => `From ${price}`,
      },
      pendingTitle: 'Details to come',
      pendingBody:
        'The date, venue, programme, speakers, ticket content and prices will be published here as soon as they are confirmed.',
      form: {
        emailLabel: 'Your email address',
        sending: 'Sending…',
        success: 'Thank you! We will email you as soon as the next edition is announced.',
        invalid: 'Invalid email address.',
        error: 'Something went wrong. Please try again later.',
        rate: 'Too many attempts. Try again later.',
        consentPrefix: 'I have read and accept the ',
        consentLink: 'privacy policy',
        consentSuffix: ' regarding the processing of my personal data.',
      },
    },
    partners: {
      eyebrow: 'Partnerships',
      title: 'Associate your organisation with this community’s ambition.',
      body: 'Level Up in Germany creates a meeting space between talents of the African diaspora, entrepreneurs and the organisations that want to contribute to their development. By becoming a partner or exhibitor, you can take part in this momentum and introduce your organisation to an audience committed to its professional and entrepreneurial future.',
      axes: [
        {
          title: 'Meet a relevant audience',
          body: 'Connect with students, professionals and entrepreneurs with varied backgrounds and projects.',
        },
        {
          title: 'Make your organisation known',
          body: 'Present your activity through the presence and visibility formats included in the partnership offer.',
        },
        {
          title: 'Contribute to knowledge sharing',
          body: 'Support an event that encourages the sharing of experience, the discovery of career paths and meetings.',
        },
      ],
      offersTitle: 'In the current offer',
      offers: [
        'Presence at events, on the website and on social media',
        'Exhibitor booth to present your brand, product or service',
        'Partnership brief available online',
      ],
      primaryCta: 'Discover the partnerships',
      secondaryLink: 'Exhibit at the event',
      imageAlt: 'Conversation at a partner stand at the 2025 Mega Conference',
    },
    tour: {
      eyebrow: 'Beyond the event',
      title: 'Discover the work behind entrepreneurial journeys.',
      body: 'With the Level Up Business Tour, we go and meet those who are building a business. Their choices, difficulties and lessons give a concrete view of entrepreneurship and extend the sharing beyond the conference.',
      cta: 'Discover the Business Tour',
    },
    contribute: {
      eyebrow: 'Let’s build what’s next',
      title: 'A shared vision is built with committed people.',
      body: 'Do you recognise yourself in this ambition? Contribute to Level Up in Germany by lending your skills, sharing your experience or connecting us with organisations that want to get involved.',
      options: [
        { title: 'Join the volunteer team', hint: 'Write to the team', mailSubject: 'Volunteering – Level Up in Germany' },
        { title: 'Propose a talk', hint: 'Write to the team', mailSubject: 'Speaking proposal – Level Up in Germany' },
        { title: 'Make an introduction', hint: 'Contact form' },
      ],
    },
    final: {
      title: 'Take your place in the next step of Level Up.',
      body: 'Come to meet, share and learn. Associate your organisation with the project. Or help bring the vision to life.',
      partner: 'Become a partner',
      contribute: 'Contribute to the project',
    },
    community: {
      eyebrow: 'Community',
      title: 'Our community in pictures',
      hint: 'Drag or swipe to explore',
      regionLabel: 'Level Up in Germany community photo gallery',
    },
  },

  de: {
    vision: {
      eyebrow: 'Unsere Vision',
      title: 'Talente, die zusammenfinden. Erfahrungen, die weitergegeben werden. Eine Zukunft, die wir gemeinsam gestalten.',
      body: 'Überall in Deutschland gehen Studierende, Fachkräfte und Unternehmer:innen aus der afrikanischen Diaspora ihren Weg. Level Up in Germany bringt sie zusammen, damit sie ihre Erfahrungen teilen, ihre Initiativen sichtbar machen und Kontakte zu Menschen und Organisationen knüpfen, die sie auf ihrem Weg unterstützen können.',
      closing:
        'Unser Anspruch: Wissen weitergeben, Verbindungen stärken und jedem mehr Möglichkeiten geben, den nächsten Schritt zu gehen.',
      imageAlt: 'Teilnehmende verfolgen einen Vortrag bei der Mega Konferenz 2025',
    },
    proof: {
      eyebrow: 'Level Up in Aktion',
      title: 'Eine Vision, die in Begegnungen lebendig wird.',
      body: 'Austausch über Karriere, geteilte Gründungserfahrungen und Begegnungen zwischen Teilnehmenden, Referent:innen und Partnern: Erleben Sie, was Level Up in Germany ausmacht.',
      cta: 'Die letzte Ausgabe noch einmal erleben',
      photoAlts: [
        'Podium mit Referent:innen bei der Mega Konferenz 2025',
        'Aufmerksames Publikum bei der Mega Konferenz 2025',
        'Austausch zwischen Teilnehmenden bei der Mega Konferenz 2025',
        'Fragerunde mit dem Publikum bei der Mega Konferenz 2025',
        'Begegnung zweier Teilnehmerinnen bei der Mega Konferenz 2025',
      ],
      partnersTitle: 'Partner der Ausgabe 2025',
    },
    why: {
      eyebrow: 'Warum teilnehmen',
      title: 'Perspektiven, die weiterbringen. Begegnungen, die weiterführen.',
      items: [
        {
          title: 'Die Karriere voranbringen',
          body: 'Die Arbeitswelt in Deutschland besser verstehen und von denen lernen, die dort ihren Weg gehen.',
        },
        {
          title: 'Das eigene Gründungsprojekt stärken',
          body: 'Praxiserfahrungen kennenlernen, Ideen austauschen und die Realität beim Aufbau eines Unternehmens besser verstehen.',
        },
        {
          title: 'Das Netzwerk erweitern',
          body: 'Sich mit Studierenden, Fachkräften, Unternehmer:innen und Organisationen austauschen, die gemeinsame Interessen verbinden.',
        },
        {
          title: 'Wege entdecken, die Perspektiven eröffnen',
          body: 'Menschen begegnen, deren Erfahrungen helfen, sich selbst zu verorten und den nächsten Schritt mit mehr Orientierung anzugehen.',
        },
      ],
    },
    next: {
      eyebrow: 'Das Level-Up-Treffen',
      title: 'Seien Sie bei der nächsten Ausgabe dabei.',
      body: 'Treffen Sie die Level-Up-Community zu einem Tag voller Erfahrungsaustausch, Gespräche und Begegnungen rund um Karriere und Unternehmertum in Deutschland.',
      openCta: 'Ticket sichern',
      notifyCta: 'Über die nächste Ausgabe informiert werden',
      facts: {
        dateLocation: 'Datum und Ort',
        programme: 'Programm und Referent:innen',
        programmeLink: 'Programm ansehen',
        tickets: 'Inhalt der Tickets',
        ticketsLink: 'Ticketdetails ansehen',
        price: 'Preis und Buchung',
        priceFrom: (price) => `Ab ${price}`,
      },
      pendingTitle: 'Informationen folgen',
      pendingBody:
        'Datum, Ort, Programm, Referent:innen, Ticketinhalte und Preise werden hier veröffentlicht, sobald sie bestätigt sind.',
      form: {
        emailLabel: 'Ihre E-Mail-Adresse',
        sending: 'Wird gesendet…',
        success: 'Danke! Wir schreiben Ihnen, sobald die nächste Ausgabe angekündigt wird.',
        invalid: 'Ungültige E-Mail-Adresse.',
        error: 'Ein Fehler ist aufgetreten. Bitte später erneut versuchen.',
        rate: 'Zu viele Versuche. Bitte später erneut versuchen.',
        consentPrefix: 'Ich habe die ',
        consentLink: 'Datenschutzerklärung',
        consentSuffix: ' gelesen und stimme der Verarbeitung meiner personenbezogenen Daten zu.',
      },
    },
    partners: {
      eyebrow: 'Partnerschaften',
      title: 'Verbinden Sie Ihre Organisation mit dem Anspruch dieser Community.',
      body: 'Level Up in Germany schafft einen Begegnungsraum zwischen den Talenten der afrikanischen Diaspora, Gründerinnen und Gründern und Organisationen, die zu deren Entwicklung beitragen möchten. Als Partner oder Aussteller können Sie Teil dieser Dynamik werden und Ihre Organisation einem Publikum vorstellen, das sich für seine berufliche und unternehmerische Zukunft engagiert.',
      axes: [
        {
          title: 'Ein passendes Publikum treffen',
          body: 'Tauschen Sie sich mit Studierenden, Fachkräften und Unternehmer:innen mit unterschiedlichen Werdegängen und Projekten aus.',
        },
        {
          title: 'Ihre Organisation bekannt machen',
          body: 'Stellen Sie Ihre Tätigkeit mit den Präsenz- und Sichtbarkeitsformaten des Partnerschaftsangebots vor.',
        },
        {
          title: 'Zur Weitergabe von Erfahrung beitragen',
          body: 'Unterstützen Sie eine Veranstaltung, die Erfahrungsaustausch, das Kennenlernen von Werdegängen und Begegnungen fördert.',
        },
      ],
      offersTitle: 'Im aktuellen Angebot',
      offers: [
        'Präsenz bei Veranstaltungen, auf der Website und in den sozialen Medien',
        'Ausstellerstand, um Ihre Marke, Ihr Produkt oder Ihre Dienstleistung zu präsentieren',
        'Partnerschaftsunterlagen online einsehbar',
      ],
      primaryCta: 'Partnerschaften entdecken',
      secondaryLink: 'Bei der Veranstaltung ausstellen',
      imageAlt: 'Gespräch am Stand eines Partners bei der Mega Konferenz 2025',
    },
    tour: {
      eyebrow: 'Über die Veranstaltung hinaus',
      title: 'Entdecken Sie die Arbeit hinter unternehmerischen Wegen.',
      body: 'Mit der Level Up Business Tour besuchen wir Menschen, die ein Unternehmen aufbauen. Ihre Entscheidungen, Schwierigkeiten und Erkenntnisse geben einen konkreten Einblick ins Unternehmertum und tragen den Erfahrungsaustausch über die Konferenz hinaus.',
      cta: 'Business Tour entdecken',
    },
    contribute: {
      eyebrow: 'Gemeinsam weiterbauen',
      title: 'Eine gemeinsame Vision entsteht mit engagierten Menschen.',
      body: 'Erkennen Sie sich in diesem Anspruch wieder? Unterstützen Sie Level Up in Germany mit Ihren Fähigkeiten, Ihrer Erfahrung oder indem Sie uns mit Organisationen in Kontakt bringen, die sich engagieren möchten.',
      options: [
        { title: 'Dem ehrenamtlichen Team beitreten', hint: 'Dem Team schreiben', mailSubject: 'Ehrenamt – Level Up in Germany' },
        { title: 'Einen Beitrag vorschlagen', hint: 'Dem Team schreiben', mailSubject: 'Vortragsvorschlag – Level Up in Germany' },
        { title: 'Kontakte vermitteln', hint: 'Kontaktformular' },
      ],
    },
    final: {
      title: 'Nehmen Sie Ihren Platz im nächsten Schritt von Level Up ein.',
      body: 'Kommen Sie, um sich zu begegnen, auszutauschen und zu lernen. Verbinden Sie Ihre Organisation mit dem Projekt. Oder tragen Sie dazu bei, die Vision lebendig zu halten.',
      partner: 'Partner werden',
      contribute: 'Das Projekt unterstützen',
    },
    community: {
      eyebrow: 'Community',
      title: 'Unsere Gemeinschaft in Bildern',
      hint: 'Ziehen oder wischen zum Blättern',
      regionLabel: 'Fotogalerie der Level-Up-in-Germany-Community',
    },
  },
};

/** Photos authentiques de la Méga Conférence 2025 (public/community) : la première occupe la grande case de la mosaïque. */
export const HOME_PROOF_PHOTOS = [
  '/community/_DSC9111.JPG',
  '/community/_DSC9034.JPG',
  '/community/_DSC9074.JPG',
  '/community/_DSC8987.JPG',
  '/community/_DSC9047.JPG',
] as const;

export const HOME_VISION_PHOTO = '/community/_DSC8964.JPG';
export const HOME_PARTNERS_PHOTO = '/community/_DSC8802.JPG';

/** Logos des partenaires de l'édition 2025 (association nom ↔ fichier vérifiée visuellement sur chaque logo). */
export const HOME_PARTNER_LOGOS_2025: { name: string; logo: string; website?: string; zoom?: number }[] = [
  { name: 'AAD Institut', logo: '/partners/2.png' },
  { name: 'AfroGeek', logo: '/partners/8.png' },
  { name: 'GrowInDE', logo: '/partners/9.png' },
  { name: 'Delycious', logo: '/partners/10.png' },
  { name: 'Dream Village', logo: '/partners/6.png' },
  { name: 'SESANA', logo: '/partners/4.png' },
  { name: 'Believe Real Estate Formation', logo: '/partners/3.png' },
  { name: 'Regus', logo: '/partners/regus.png', website: 'https://www.regus.com/de' },
  { name: 'Campusdirekt', logo: '/partners/campusdirekt.webp', website: 'https://campusdirekt.de/' },
  { name: 'Cave des Montagnes', logo: '/partners/cave-des-montagnes.png', website: 'https://cave-des-montagnes.com/de/' },
  { name: 'African Power', logo: '/partners/african-power.png', website: 'https://african-power.com/', zoom: 2.2 },
];
