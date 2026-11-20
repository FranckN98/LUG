import type { Locale } from '@/i18n/config';

export type HomeProgram = { title: string; desc: string; hrefKey: 'workshops' | 'mentoring' | 'conference' | 'events' | 'partners' };
export type HomeProfile = { title: string; role: string; body: string };
export type HomeValue = { title: string; desc: string };
export type HomeStat = { value: number; suffix: string; label: string };

export type HomeCopy = {
  heroTitle: string;
  heroTagline: string;
  heroSubtitle: string;
  heroBtnJoin: string;
  heroBtnAttend: string;
  heroBtnPartner: string;
  problemEyebrow: string;
  problemTitle: string;
  problemLead: string;
  problemPoints: string[];
  visionEyebrow: string;
  visionTitle: string;
  visionBody: string;
  missionEyebrow: string;
  missionTitle: string;
  missionLead: string;
  missionBullets: string[];
  businessTourEyebrow: string;
  businessTourTitle: string;
  businessTourTagline: string;
  businessTourBody: string;
  businessTourItems: string[];
  businessTourCta: string;
  profilesEyebrow: string;
  profilesTitle: string;
  profilesLead: string;
  profiles: [HomeProfile, HomeProfile, HomeProfile];
  programsEyebrow: string;
  programsTitle: string;
  programsLead: string;
  programs: HomeProgram[];
  impactEyebrow: string;
  impactTitle: string;
  impactLead: string;
  values: HomeValue[];
  stats: HomeStat[];
  ctaBandTitle: string;
  ctaBandSubtitle: string;
  ctaJoin: string;
  ctaMentor: string;
  ctaPartner: string;
  ctaDonate: string;
  contactEyebrow: string;
  contactTitle: string;
  contactBody: string;
  contactBtn: string;
  contactPartners: string;
  allEventsLink: string;
  /** Inline home contact form */
  homeFormTitle: string;
  homeFormIntro: string;
  formName: string;
  formEmail: string;
  formMessage: string;
  formSubmit: string;
  formConsent: string;
  formPrivacy: string;
  formSending: string;
  formSuccess: string;
  formError: string;
};

const href = (base: string, key: HomeProgram['hrefKey']) => {
  const map: Record<HomeProgram['hrefKey'], string> = {
    workshops: `${base}/programme/workshops`,
    mentoring: `${base}/programme/mentoring`,
    conference: `${base}/annual-conference`,
    events: `${base}/events`,
    partners: `${base}/partners`,
  };
  return map[key];
};

export function programHref(base: string, key: HomeProgram['hrefKey']) {
  return href(base, key);
}

export const homeContent: Record<Locale, HomeCopy> = {
  de: {
    heroTitle: 'LEVEL UP IN GERMANY',
    heroTagline: 'Gemeinsam eine Stufe höher.',
    heroSubtitle:
      'Wir verbinden erfolgreiche Vorbilder der afrikanischen Diaspora mit einer ambitionierten Generation, um Karrieren zu entwickeln, Unternehmergeist zu stärken und Verbindungen in Deutschland zu schaffen.',
    heroBtnJoin: 'Bewegung beitreten',
    heroBtnAttend: 'Konferenz & Events',
    heroBtnPartner: 'Partner werden',
    problemEyebrow: 'Ambition verbindet uns',
    problemTitle: 'Wege, die inspirieren. Begegnungen, die weiterbringen.',
    problemLead:
      'Die afrikanische Diaspora ist voller Talente und Erfolge. Wir machen sie sichtbar und zugänglich, damit wir aus Erfahrungen lernen, anders denken und unseren eigenen Weg gehen können.',
    problemPoints: [
      'Entdecke Wege, die Mut machen.',
      'Lerne von Menschen, die sich bewährt haben.',
      'Triff Menschen, mit denen du weiterkommst.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'Eine Diaspora, die mutig ist und sichtbar wird.',
    visionBody:
      'Wir lassen unsere Erfolge sichtbar werden und inspirieren eine Generation, die zu ihren Ambitionen steht, ihren Weg geht und Erfahrungen weitergibt.',
    missionEyebrow: 'Mission',
    missionTitle: 'Erfolge mit Ambitionen verbinden.',
    missionLead:
      'Wir bringen Professionals, Unternehmer:innen und ambitionierte junge Menschen zusammen, um Erfahrungen zu teilen, ihr Netzwerk auszubauen und in Karriere oder Business voranzukommen.',
    missionBullets: [
      'Business Tour: Von Unternehmer:innen in ihrem Alltag lernen.',
      'Treffen und Webinare: Austausch über Karriere und Business.',
      'Jahreskonferenz: Inspirierende Wege und Talente von morgen zusammenbringen.',
    ],
    businessTourEyebrow: 'Im Zentrum des Unternehmertums',
    businessTourTitle: 'Level Up Business Tour',
    businessTourTagline: 'Ihre Wege. Ihre Methoden. Deine Impulse.',
    businessTourBody:
      'Wir besuchen Unternehmer:innen aus der Diaspora und erfahren, wie sie ihr Unternehmen aufbauen. Anfänge, Methoden, Fehler und Entscheidungen liefern konkrete Einblicke für deinen Unternehmergeist und deine Projekte.',
    businessTourItems: [
      'Unternehmer:innen, die ihre Erfahrungen teilen.',
      'Methoden und Entscheidungen verständlich erklärt.',
      'Der Unternehmensalltag von innen gesehen.',
      'Lektionen für deine eigenen Projekte.',
    ],
    businessTourCta: 'Mehr erfahren',
    profilesEyebrow: 'Drei Säulen, eine Ambition',
    profilesTitle: 'Mach den nächsten Schritt.',
    profilesLead:
      'Erfahrungen zum Teilen. Ambitionen zum Weiterentwickeln.',
    profiles: [
      {
        title: 'Karriere',
        role: 'Mach den nächsten Schritt.',
        body: 'Student:in, junge:r Berufstätige:r oder erfahrene:r Professional: Lerne von inspirierenden Wegen und entwickle deinen eigenen weiter.',
      },
      {
        title: 'Business',
        role: 'Stärke deinen Unternehmergeist.',
        body: 'Lerne von Unternehmer:innen mit Erfahrung und tausche dich mit Menschen aus deiner Branche aus.',
      },
      {
        title: 'Netzwerk',
        role: 'Triff die richtigen Menschen.',
        body: 'Tausche dich mit Talenten, Unternehmer:innen, künftigen Partnern und potenziellen Kund:innen aus.',
      },
    ],
    programsEyebrow: 'Programme & Aktionen',
    programsTitle: 'Begegnungen, die ins Handeln bringen.',
    programsLead:
      'Auf der Bühne, online oder im Unternehmen: Lerne aus Erfahrungen und entwickle deine Beziehungen.',
    programs: [
      { title: 'Mentoring Circles', desc: 'Herausforderungen teilen und aus den Erfahrungen anderer lernen.', hrefKey: 'mentoring' },
      { title: 'Webinare', desc: 'Karriere und Business mit Expert:innen vertiefen.', hrefKey: 'events' },
      { title: 'Events vor Ort', desc: 'Die Community treffen und über Ambitionen sprechen.', hrefKey: 'events' },
      { title: 'Networking & Brücken', desc: 'Talente, Unternehmer:innen und Partner zusammenbringen.', hrefKey: 'partners' },
      { title: 'Workshops', desc: 'Konkrete Methoden für Karriere oder Projekt entdecken.', hrefKey: 'workshops' },
      { title: 'Jährliche Konferenz', desc: 'Erfolgreiche Vorbilder der Diaspora treffen und aus ihren Wegen lernen.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Werte & Wirkung',
    impactTitle: 'Anders sein. Gemeinsam wachsen.',
    impactLead:
      'Level Up ist eine gemeinnützige Organisation. Wir machen die Talente der afrikanischen Diaspora sichtbar und fördern den Austausch über Karriere und Business.',
    values: [
      { title: 'Weitergabe', desc: 'Erfahrungen teilen, damit andere weiterkommen.' },
      { title: 'Exzellenz', desc: 'Hohe Ziele setzen und das Beste geben.' },
      { title: 'Authentizität', desc: 'Über Erfolge und Schwierigkeiten sprechen.' },
      { title: 'Repräsentation', desc: 'Talente der afrikanischen Diaspora sichtbar machen.' },
      { title: 'Mut', desc: 'Zu den eigenen Ambitionen stehen und den eigenen Weg gehen.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Community-Mitglieder & Teilnehmende' },
      { value: 50, suffix: '+', label: 'Mentor:innen & Speaker:innen' },
      { value: 15, suffix: '+', label: 'Partner & Universitäten' },
    ],
    ctaBandTitle: 'Deine Ambitionen verdienen die richtigen Begegnungen.',
    ctaBandSubtitle: 'Schließe dich Menschen an, die lernen, unternehmen und Erfahrungen weitergeben wollen.',
    ctaJoin: 'Mitglied werden',
    ctaMentor: 'Wer wir sind',
    ctaPartner: 'Partnerschaft',
    ctaDonate: 'Unterstützen',
    contactEyebrow: 'Kontakt & Partnerschaften',
    contactTitle: 'Lass uns gemeinsam etwas aufbauen',
    contactBody:
      'Für Sponsoring, Kooperationen mit Hochschulen oder Presseanfragen: wir antworten klar und zeitnah.',
    contactBtn: 'Kontakt aufnehmen',
    contactPartners: 'Partnerseite',
    allEventsLink: 'Alle Veranstaltungen',
    homeFormTitle: 'Direkt eine Nachricht senden',
    homeFormIntro:
      'Fragen zu Mitgliedschaft, Events oder Kooperationen? Wir melden uns so schnell wie möglich.',
    formName: 'Name',
    formEmail: 'E-Mail',
    formMessage: 'Nachricht',
    formSubmit: 'Senden',
    formConsent: 'Ich stimme der Verarbeitung meiner Daten gemäß der',
    formPrivacy: 'Datenschutzerklärung',
    formSending: 'Wird gesendet…',
    formSuccess: 'Danke! Deine Nachricht wurde gesendet.',
    formError: 'Senden fehlgeschlagen. Bitte versuche es erneut.',
  },
  en: {
    heroTitle: 'LEVEL UP IN GERMANY',
    heroTagline: 'Level up, together.',
    heroSubtitle:
      'We connect successful role models from the African diaspora with an ambitious generation to advance careers, grow an entrepreneurial mindset and build connections in Germany.',
    heroBtnJoin: 'Join the movement',
    heroBtnAttend: 'Conference & events',
    heroBtnPartner: 'Partner with us',
    problemEyebrow: 'Ambition brings us together',
    problemTitle: 'Journeys that inspire. Encounters that move you forward.',
    problemLead:
      'The African diaspora is full of talent and achievement. We make those journeys visible and accessible so people can learn from experience, dare to be different and build their own path.',
    problemPoints: [
      'Discover journeys that make you want to take a chance.',
      'Learn from people who have proven themselves.',
      'Meet people who can help you go further.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'A diaspora that dares and shines.',
    visionBody:
      'We make our achievements visible and inspire a generation to own its ambitions, shape its path and pass experience on.',
    missionEyebrow: 'Mission',
    missionTitle: 'Connecting achievement with ambition.',
    missionLead:
      'We bring together professionals, entrepreneurs and ambitious young people to share experience, grow their network and move forward in their career or business.',
    missionBullets: [
      'Business Tour: learn from entrepreneurs in their daily work.',
      'Meet-ups and webinars: exchange ideas about career and business.',
      'Annual conference: bring inspiring journeys and future talent together.',
    ],
    businessTourEyebrow: 'At the heart of entrepreneurship',
    businessTourTitle: 'Level Up Business Tour',
    businessTourTagline: 'Their journeys. Their methods. Your next insight.',
    businessTourBody:
      'We meet entrepreneurs from the diaspora to understand how they build their businesses. Their beginnings, methods, mistakes and decisions offer practical experience to feed your entrepreneurial mindset and move your projects forward.',
    businessTourItems: [
      'Entrepreneurs sharing their experience.',
      'Methods and decisions explained clearly.',
      'The daily life of a business from the inside.',
      'Lessons to support your own projects.',
    ],
    businessTourCta: 'Learn more',
    profilesEyebrow: 'Three pillars, one ambition',
    profilesTitle: 'Take your next step.',
    profilesLead:
      'Experiences to share. Ambitions to grow.',
    profiles: [
      {
        title: 'Career',
        role: 'Take your next step.',
        body: 'Student, young professional or established professional: learn from inspiring journeys to move your own forward.',
      },
      {
        title: 'Business',
        role: 'Grow your entrepreneurial mindset.',
        body: 'Learn from proven entrepreneurs and connect with people in your field.',
      },
      {
        title: 'Network',
        role: 'Meet the right people.',
        body: 'Connect with talent, entrepreneurs, future partners and potential clients.',
      },
    ],
    programsEyebrow: 'Programs and actions',
    programsTitle: 'Encounters that lead to action.',
    programsLead:
      'On stage, online or inside a business, learn from experience and grow your relationships.',
    programs: [
      { title: 'Mentoring circles', desc: 'Share your challenges and learn from other people’s experience.', hrefKey: 'mentoring' },
      { title: 'Webinars', desc: 'Go deeper into career and business with experts.', hrefKey: 'events' },
      { title: 'In-person events', desc: 'Meet the community and exchange on your ambitions.', hrefKey: 'events' },
      { title: 'Networking bridges', desc: 'Connect talent, entrepreneurs and partners.', hrefKey: 'partners' },
      { title: 'Workshops', desc: 'Explore practical methods for your career or project.', hrefKey: 'workshops' },
      { title: 'Annual conference', desc: 'Meet successful role models from the diaspora and learn from their journeys.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Values and impact',
    impactTitle: 'Dare to be different. Grow together.',
    impactLead:
      'Level Up is a non-profit association. We make African diaspora talent visible and encourage the sharing of experience around career and business.',
    values: [
      { title: 'Passing it on', desc: 'Share your experience to help others move forward.' },
      { title: 'Excellence', desc: 'Aim high and give your best.' },
      { title: 'Authenticity', desc: 'Talk about achievements as well as difficulties.' },
      { title: 'Representation', desc: 'Make African diaspora talent visible.' },
      { title: 'Boldness', desc: 'Own your ambitions and dare to shape your path.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Community members reached' },
      { value: 50, suffix: '+', label: 'Mentors & speakers' },
      { value: 15, suffix: '+', label: 'Partners & universities' },
    ],
    ctaBandTitle: 'Your ambitions deserve the right encounters.',
    ctaBandSubtitle: 'Join people who want to learn, build and pass experience on.',
    ctaJoin: 'Become a member',
    ctaMentor: 'Who we are',
    ctaPartner: 'Partnerships',
    ctaDonate: 'Support us',
    contactEyebrow: 'Contact and partnerships',
    contactTitle: "Let's build something that lasts",
    contactBody:
      'For sponsorships, university collaborations or press, we get back to you clearly and quickly.',
    contactBtn: 'Get in touch',
    contactPartners: 'Partners page',
    allEventsLink: 'View all events',
    homeFormTitle: 'Send us a message',
    homeFormIntro:
      'Questions about membership, events or partnerships? We will get back to you as soon as we can.',
    formName: 'Name',
    formEmail: 'Email',
    formMessage: 'Message',
    formSubmit: 'Send message',
    formConsent: 'I agree to the processing of my data according to the',
    formPrivacy: 'Privacy Policy',
    formSending: 'Sending…',
    formSuccess: 'Thank you! Your message was sent.',
    formError: 'Something went wrong. Please try again.',
  },
  fr: {
    heroTitle: 'LEVEL UP IN GERMANY',
    heroTagline: 'Monter d’un cap, ensemble.',
    heroSubtitle:
      'Nous connectons les modèles de réussite de la diaspora africaine à une génération ambitieuse pour faire évoluer les carrières, développer l’esprit d’entreprendre et créer des liens en Allemagne.',
    heroBtnJoin: 'Rejoindre le mouvement',
    heroBtnAttend: 'Conférence et événements',
    heroBtnPartner: 'Devenir partenaire',
    problemEyebrow: 'L’ambition nous rassemble',
    problemTitle: 'Des parcours qui inspirent. Des rencontres qui font avancer.',
    problemLead:
      'La diaspora africaine regorge de talents et de réussites. Nous les rendons visibles et accessibles pour apprendre de leur expérience, oser être différent et construire sa propre voie.',
    problemPoints: [
      'Découvrir des parcours qui donnent envie d’oser.',
      'Apprendre de ceux qui ont fait leurs preuves.',
      'Rencontrer des personnes avec qui aller plus loin.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'Une diaspora qui ose et qui rayonne.',
    visionBody:
      'Faire briller nos réussites et inspirer une génération qui assume ses ambitions, trace sa voie et transmet à son tour.',
    missionEyebrow: 'Mission',
    missionTitle: 'Connecter les réussites aux ambitions.',
    missionLead:
      'Nous réunissons professionnels, entrepreneurs et jeunes ambitieux pour partager des expériences, développer leur réseau et avancer dans leur carrière ou leur business.',
    missionBullets: [
      'Business Tour : apprendre au contact d’entrepreneurs dans leur quotidien.',
      'Rencontres et webinaires : échanger sur la carrière et le business.',
      'Conférence annuelle : réunir les parcours inspirants et les talents de demain.',
    ],
    businessTourEyebrow: 'Au cœur de l’entrepreneuriat',
    businessTourTitle: 'Level Up Business Tour',
    businessTourTagline: 'Leurs parcours. Leurs méthodes. Tes déclics.',
    businessTourBody:
      'Nous allons à la rencontre d’entrepreneurs de la diaspora pour comprendre comment ils bâtissent leur activité. Leurs débuts, leurs méthodes, leurs erreurs et leurs décisions : des expériences concrètes pour nourrir ton esprit d’entrepreneur et faire avancer tes projets.',
    businessTourItems: [
      'Des entrepreneurs qui partagent leur expérience.',
      'Des méthodes et des décisions expliquées.',
      'Le quotidien d’une entreprise vu de l’intérieur.',
      'Des leçons pour nourrir tes propres projets.',
    ],
    businessTourCta: 'En savoir plus',
    profilesEyebrow: 'Trois piliers, une ambition',
    profilesTitle: 'Passe au niveau supérieur.',
    profilesLead:
      'Des expériences à partager. Des ambitions à faire grandir.',
    profiles: [
      {
        title: 'Carrière',
        role: 'Franchis un nouveau cap.',
        body: 'Étudiant, jeune professionnel ou professionnel établi : apprends de parcours inspirants pour faire évoluer le tien.',
      },
      {
        title: 'Business',
        role: 'Cultive ton esprit d’entrepreneur.',
        body: 'Apprends les méthodes d’entrepreneurs qui ont fait leurs preuves et échange avec ceux de ton secteur.',
      },
      {
        title: 'Réseau',
        role: 'Rencontre les bonnes personnes.',
        body: 'Échange avec des talents, des entrepreneurs, de futurs partenaires et des clients potentiels.',
      },
    ],
    programsEyebrow: 'Programmes et actions',
    programsTitle: 'Des rencontres pour passer à l’action.',
    programsLead:
      'Sur scène, en ligne ou en entreprise, apprends des expériences et développe tes relations.',
    programs: [
      { title: 'Cercles de mentorat', desc: 'Partager ses défis et apprendre de l’expérience des autres.', hrefKey: 'mentoring' },
      { title: 'Webinaires', desc: 'Approfondir la carrière et le business avec des experts.', hrefKey: 'events' },
      { title: 'Événements sur place', desc: 'Rencontrer la communauté et échanger sur ses ambitions.', hrefKey: 'events' },
      { title: 'Ponts entre réseaux', desc: 'Mettre en relation des talents, des entrepreneurs et des partenaires.', hrefKey: 'partners' },
      { title: 'Ateliers', desc: 'Explorer des méthodes concrètes pour sa carrière ou son projet.', hrefKey: 'workshops' },
      { title: 'Conférence annuelle', desc: 'Rencontrer les modèles de réussite de la diaspora et apprendre de leurs parcours.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Valeurs et impact',
    impactTitle: 'Oser être différent. Grandir ensemble.',
    impactLead:
      'Association à but non lucratif, Level Up fait rayonner les talents de la diaspora africaine et encourage la transmission autour de la carrière et du business.',
    values: [
      { title: 'Transmission', desc: 'Partager son expérience pour faire avancer les autres.' },
      { title: 'Excellence', desc: 'Viser haut et donner le meilleur de soi.' },
      { title: 'Authenticité', desc: 'Parler des réussites comme des difficultés.' },
      { title: 'Représentation', desc: 'Rendre visibles les talents de la diaspora africaine.' },
      { title: 'Audace', desc: 'Assumer ses ambitions et oser sa propre voie.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Membres et participant.e.s' },
      { value: 50, suffix: '+', label: 'Mentors et intervenant.e.s' },
      { value: 15, suffix: '+', label: 'Partenaires et universités' },
    ],
    ctaBandTitle: 'Tes ambitions méritent les bonnes rencontres.',
    ctaBandSubtitle: 'Rejoins celles et ceux qui veulent apprendre, entreprendre et transmettre.',
    ctaJoin: 'Devenir membre',
    ctaMentor: 'Qui sommes-nous ?',
    ctaPartner: 'Partenariats',
    ctaDonate: 'Soutenir',
    contactEyebrow: 'Contact et partenariats',
    contactTitle: 'Construisons quelque chose qui dure',
    contactBody:
      'Pour le sponsoring, les coopérations universitaires ou la presse, on te répond clairement et rapidement.',
    contactBtn: 'Nous écrire',
    contactPartners: 'Page partenaires',
    allEventsLink: 'Voir tous les événements',
    homeFormTitle: 'Écris-nous directement',
    homeFormIntro:
      'Questions sur l’adhésion, les événements ou les partenariats ? On te répond dès qu’on peut.',
    formName: 'Nom',
    formEmail: 'E-mail',
    formMessage: 'Message',
    formSubmit: 'Envoyer',
    formConsent: 'J’accepte le traitement de mes données selon la',
    formPrivacy: 'politique de confidentialité',
    formSending: 'Envoi en cours…',
    formSuccess: 'Merci ! Ton message a bien été envoyé.',
    formError: 'L’envoi a échoué. Réessaie dans un instant.',
  },
};
