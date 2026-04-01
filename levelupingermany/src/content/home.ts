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
    heroTagline: 'Monter d’un cap — gemeinsam.',
    heroSubtitle:
      'Wir verbinden internationale Talente in Deutschland mit Mentoring, Vorbildern und einem Netzwerk, das echten Anschluss schafft.',
    heroBtnJoin: 'Bewegung beitreten',
    heroBtnAttend: 'Konferenz & Events',
    heroBtnPartner: 'Partner werden',
    problemEyebrow: 'Der Ausgangspunkt',
    problemTitle: 'Neu in Deutschland — oft allein mit grossen Traeumen',
    problemLead:
      'Viele Studierende, Absolvent:innen und Professionals kommen mit wenig Netzwerk, wenig Orientierung und ohne Vorbilder, die ihren Weg wirklich verstehen.',
    problemPoints: [
      'Studium, Berufseinstieg und Alltag wirken gleichzeitig ueberwaeltigend.',
      'Finanzen, Familie und soziales Leben brauchen klare Strategien — nicht nur Motivation.',
      'Ohne vertrauensvolle Community bleibt Potenzial ungenutzt.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'Ein Oekosystem fuer Aufstieg, Repraesentation und Wirksamkeit',
    visionBody:
      'Wir bauen eine Bewegung der Transmission: Erfahrung wird geteilt, Erfolge werden sichtbar, und jede Person kann die naechste Stufe mit Rueckenwind erreichen — nachhaltig und kollektiv.',
    missionEyebrow: 'Mission',
    missionTitle: 'Was wir konkret tun',
    missionLead:
      'Level Up in Germany begleitet Menschen mit Mentoring, Partnerhochschulen, Webinaren, Live-Events und einem Netzwerk inspirierender Role Models.',
    missionBullets: [
      'Mentoring & MentorBridge fuer persoenliche Klarheit und naechste Schritte.',
      'Workshops zu Karriere, Business, Finanzen und Leben in Deutschland.',
      'Jaehrliche Konferenz und Community-Events fuer echtes Networking.',
    ],
    profilesEyebrow: 'Drei Profile, eine Bewegung',
    profilesTitle: 'Finde deinen Platz im Netzwerk',
    profilesLead:
      'Jede Rolle profitiert — und traegt dazu bei, die Community groesser und staerker zu machen.',
    profiles: [
      {
        title: 'Student:in / Azubi',
        role: 'Lernen & erste Schritte',
        body: 'Orientierung, Praktika, Netzwerk und Vorbilder, die deinen Alltag in Deutschland verstehen.',
      },
      {
        title: 'Junge:r Absolvent:in',
        role: 'Einstieg & Beschleunigung',
        body: 'Karrierepfade, Bewerbung, Sichtbarkeit und Mentoring fuer den professionellen Start.',
      },
      {
        title: 'Etablierte:r Professional',
        role: 'Wirkung & Rueckgabe',
        body: 'Mentoring, Sponsoring, Buenen und Partnerschaften — du oeffnest Tueren und staerkst die naechste Generation.',
      },
    ],
    programsEyebrow: 'Programme & Aktionen',
    programsTitle: 'Strukturierte Wege zum naechsten Level',
    programsLead:
      'Vom Circle bis zur Buehne: Formate, die Wissen, Beziehungen und Selbstvertrauen aufbauen.',
    programs: [
      { title: 'Mentoring Circles', desc: 'Peer-Learning und begleitete Gruppen fuer Momentum.', hrefKey: 'mentoring' },
      { title: 'Webinare', desc: 'Expert:innen-Sessions zu Karriere, Business und Finanzen.', hrefKey: 'events' },
      { title: 'Events vor Ort', desc: 'Community, Networking und Energie im echten Raum.', hrefKey: 'events' },
      { title: 'Networking & Brucken', desc: 'Begegnungen, die aus Kontakten Partnerschaften machen.', hrefKey: 'partners' },
      { title: 'Workshops', desc: 'Hands-on zu Leben, Arbeit und Wachstum in Deutschland.', hrefKey: 'workshops' },
      { title: 'Jaehrliche Konferenz', desc: 'Inspiration, Speaker:innen und Impact auf einer Buehne.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Werte & Wirkung',
    impactTitle: 'Was uns zusammenhaelt',
    impactLead:
      'Exzellenz ohne Elitismus — Authentizitaet mit Ambition. Wir messen Erfolg auch an dem, was wir weitergeben.',
    values: [
      { title: 'Transmission', desc: 'Wissen und Erfahrung fliessen bewusst weiter.' },
      { title: 'Exzellenz', desc: 'Hohe Standards, pragmatisch und menschlich umgesetzt.' },
      { title: 'Authentizitaet', desc: 'Echte Geschichten, echte Begegnungen.' },
      { title: 'Repraesentation', desc: 'Sichtbarkeit fuer Wege, die unterschaetzt wurden.' },
      { title: 'Kollektiver Aufstieg', desc: 'Wenn einer levelt up, zieht die Community mit.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Community-Mitglieder & Teilnehmende' },
      { value: 50, suffix: '+', label: 'Mentor:innen & Speaker:innen' },
      { value: 15, suffix: '+', label: 'Partner & Universitaeten' },
    ],
    ctaBandTitle: 'Bereit, gemeinsam hochzusteigen?',
    ctaBandSubtitle:
      'Werde Teil der Bewegung, teile deine Erfahrung als Mentor:in oder oeffne Tueren als Partner:in.',
    ctaJoin: 'Mitglied werden',
    ctaMentor: 'Wer wir sind',
    ctaPartner: 'Partnerschaft',
    ctaDonate: 'Unterstuetzen',
    contactEyebrow: 'Kontakt & Partnerschaften',
    contactTitle: 'Lass uns wirksam zusammenarbeiten',
    contactBody:
      'Fuer Sponsoring, Kooperationen mit Hochschulen oder Presse — wir antworten strukturiert und zeitnah.',
    contactBtn: 'Kontakt aufnehmen',
    contactPartners: 'Partnerseite',
    allEventsLink: 'Alle Veranstaltungen',
    homeFormTitle: 'Direkt Nachricht senden',
    homeFormIntro:
      'Fragen zu Mitgliedschaft, Events oder Kooperationen? Wir melden uns so schnell wie moeglich.',
    formName: 'Name',
    formEmail: 'E-Mail',
    formMessage: 'Nachricht',
    formSubmit: 'Senden',
    formConsent: 'Ich stimme der Verarbeitung meiner Daten gemaess der',
    formPrivacy: 'Datenschutzerklaerung',
    formSending: 'Wird gesendet...',
    formSuccess: 'Danke! Deine Nachricht wurde gesendet.',
    formError: 'Senden fehlgeschlagen. Bitte versuche es erneut.',
  },
  en: {
    heroTitle: 'LEVEL UP IN GERMANY',
    heroTagline: 'Level up — together.',
    heroSubtitle:
      'We connect international students, graduates and professionals in Germany with mentoring, role models and a network built for real belonging.',
    heroBtnJoin: 'Join the movement',
    heroBtnAttend: 'Conference & events',
    heroBtnPartner: 'Partner with us',
    problemEyebrow: 'The starting point',
    problemTitle: 'New in Germany — often alone with big dreams',
    problemLead:
      'Many arrive with little network, little guidance, and few success models who truly understand their journey — in studies, career, money, family and entrepreneurship.',
    problemPoints: [
      'Studies, first jobs and daily life hit all at once.',
      'Without trusted peers and mentors, potential stays hidden.',
      'Representation matters: seeing paths that look like yours changes what feels possible.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'An ecosystem for elevation, representation and lasting impact',
    visionBody:
      'We are building a movement of transmission: experience is shared, wins become visible, and every person can reach their next stage with collective tailwind — sustainably and together.',
    missionEyebrow: 'Mission',
    missionTitle: 'What we do, concretely',
    missionLead:
      'Level Up in Germany supports people through mentors, university partnerships, webinars, in-person events and a network of inspiring role models.',
    missionBullets: [
      'Mentoring & MentorBridge for clarity and next steps.',
      'Workshops on career, business, finance and life in Germany.',
      'Annual conference and community events for real connection.',
    ],
    profilesEyebrow: 'Three profiles, one movement',
    profilesTitle: 'Find your place in the network',
    profilesLead:
      'Everyone benefits — and everyone can help the community grow stronger.',
    profiles: [
      {
        title: 'Student / apprentice',
        role: 'Learn & take first steps',
        body: 'Orientation, internships, network and mentors who understand your reality in Germany.',
      },
      {
        title: 'Young graduate',
        role: 'Launch & accelerate',
        body: 'Career paths, applications, visibility and mentoring for a confident professional start.',
      },
      {
        title: 'Established professional',
        role: 'Impact & give back',
        body: 'Mentoring, sponsorship, stages and partnerships — you open doors and lift the next generation.',
      },
    ],
    programsEyebrow: 'Programs & actions',
    programsTitle: 'Structured paths to the next level',
    programsLead:
      'From circles to the main stage: formats that build knowledge, relationships and confidence.',
    programs: [
      { title: 'Mentoring circles', desc: 'Peer learning and guided groups for momentum.', hrefKey: 'mentoring' },
      { title: 'Webinars', desc: 'Expert sessions on career, business and finance.', hrefKey: 'events' },
      { title: 'In-person events', desc: 'Community energy and networking in real life.', hrefKey: 'events' },
      { title: 'Networking bridges', desc: 'Introductions that turn contacts into partnerships.', hrefKey: 'partners' },
      { title: 'Workshops', desc: 'Hands-on sessions on life, work and growth in Germany.', hrefKey: 'workshops' },
      { title: 'Annual conference', desc: 'Inspiration, speakers and impact on one stage.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Values & impact',
    impactTitle: 'What holds us together',
    impactLead:
      'Excellence without elitism — authenticity with ambition. We measure success by what we pass forward.',
    values: [
      { title: 'Transmission', desc: 'Knowledge and experience flow on purpose.' },
      { title: 'Excellence', desc: 'High standards, delivered with warmth.' },
      { title: 'Authenticity', desc: 'Real stories, real encounters.' },
      { title: 'Representation', desc: 'Visibility for underestimated paths.' },
      { title: 'Collective rise', desc: 'When one person levels up, the community rises too.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Community members reached' },
      { value: 50, suffix: '+', label: 'Mentors & speakers' },
      { value: 15, suffix: '+', label: 'Partners & universities' },
    ],
    ctaBandTitle: 'Ready to rise — together?',
    ctaBandSubtitle: 'Join the movement, mentor with us, or partner to open doors at scale.',
    ctaJoin: 'Become a member',
    ctaMentor: 'Who we are',
    ctaPartner: 'Partnerships',
    ctaDonate: 'Support us',
    contactEyebrow: 'Contact & partnerships',
    contactTitle: 'Let’s build something that lasts',
    contactBody:
      'For sponsorships, university collaborations or press — we respond clearly and promptly.',
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
    heroTagline: 'Monter d’un cap — ensemble.',
    heroSubtitle:
      'Nous connectons etudiants internationaux, jeunes diplomes et professionnels en Allemagne au mentorat, aux modeles et a un reseau ou chacun trouve sa place.',
    heroBtnJoin: 'Rejoindre le mouvement',
    heroBtnAttend: 'Conference et evenements',
    heroBtnPartner: 'Devenir partenaire',
    problemEyebrow: 'Le point de depart',
    problemTitle: 'Nouveaux en Allemagne — souvent seuls avec de grands reves',
    problemLead:
      'Beaucoup arrivent avec peu de reseau, peu de reperes et peu de modeles qui comprennent vraiment leur parcours — etudes, emploi, finances, vie sociale et entrepreneuriat.',
    problemPoints: [
      'Les defis s accumulent: etudes, premier emploi, quotidien.',
      'Sans pairs et mentors de confiance, le potentiel reste invisible.',
      'La representation change ce qui semble possible.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'Un ecosysteme pour s elever, se representer et durer',
    visionBody:
      'Nous construisons un mouvement de transmission: l experience circule, les reussites deviennent visibles, et chacun peut passer au niveau suivant avec l elan du collectif.',
    missionEyebrow: 'Mission',
    missionTitle: 'Ce que nous faisons, concretement',
    missionLead:
      'Level Up in Germany accompagne par le mentorat, les partenariats universitaires, les webinaires, les evenements et un reseau de modeles inspirants.',
    missionBullets: [
      'Mentorat et MentorBridge pour la clarte et les prochaines etapes.',
      'Ateliers carriere, business, finances et vie en Allemagne.',
      'Conference annuelle et evenements pour du lien reel.',
    ],
    profilesEyebrow: 'Trois profils, un mouvement',
    profilesTitle: 'Trouve ta place dans le reseau',
    profilesLead:
      'Chacun y gagne — et chacun peut faire grandir la communaute.',
    profiles: [
      {
        title: 'Etudiant / apprenti',
        role: 'Apprendre et premier pas',
        body: 'Orientation, stages, reseau et mentors qui comprennent ton quotidien en Allemagne.',
      },
      {
        title: 'Jeune diplome',
        role: 'Lancement et acceleration',
        body: 'Parcours pro, candidatures, visibilite et mentorat pour un depart solide.',
      },
      {
        title: 'Professionnel etabli',
        role: 'Impact et retour',
        body: 'Mentorat, sponsoring, scenes et partenariats — tu ouvres des portes et tu fais monter la suivante generation.',
      },
    ],
    programsEyebrow: 'Programmes et actions',
    programsTitle: 'Des parcours structures vers le niveau suivant',
    programsLead:
      'Des cercles a la grande scene: des formats qui construisent savoir, liens et confiance.',
    programs: [
      { title: 'Cercles de mentorat', desc: 'Pair-learning et groupes guides pour garder le rythme.', hrefKey: 'mentoring' },
      { title: 'Webinaires', desc: 'Sessions expertes carriere, business et finances.', hrefKey: 'events' },
      { title: 'Evenements sur place', desc: 'Energie communautaire et networking en reel.', hrefKey: 'events' },
      { title: 'Ponts reseau', desc: 'Des rencontres qui deviennent partenariats.', hrefKey: 'partners' },
      { title: 'Ateliers', desc: 'Pratique: vie, travail et croissance en Allemagne.', hrefKey: 'workshops' },
      { title: 'Conference annuelle', desc: 'Inspiration, intervenants et impact sur une scene.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Valeurs et impact',
    impactTitle: 'Ce qui nous rassemble',
    impactLead:
      'Excellence sans elitisme — authenticite avec ambition. Nous mesurons aussi ce que nous transmettons.',
    values: [
      { title: 'Transmission', desc: 'Le savoir et l experience circulent volontairement.' },
      { title: 'Excellence', desc: 'Exigence avec chaleur humaine.' },
      { title: 'Authenticite', desc: 'Des histoires vraies, des rencontres vraies.' },
      { title: 'Representation', desc: 'Visibilite pour des parcours sous-estimes.' },
      { title: 'Elevation collective', desc: 'Quand l un monte d un cap, la communaute monte avec.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Membres et participant.e.s' },
      { value: 50, suffix: '+', label: 'Mentors et intervenant.e.s' },
      { value: 15, suffix: '+', label: 'Partenaires et universites' },
    ],
    ctaBandTitle: 'Pret.e a monter d un cap — ensemble ?',
    ctaBandSubtitle: 'Rejoins le mouvement, deviens mentor ou partenaire pour ouvrir des portes a grande echelle.',
    ctaJoin: 'Devenir membre',
    ctaMentor: 'Qui sommes-nous ?',
    ctaPartner: 'Partenariats',
    ctaDonate: 'Soutenir',
    contactEyebrow: 'Contact et partenariats',
    contactTitle: 'Construisons quelque chose de durable',
    contactBody:
      'Sponsoring, cooperations universitaires ou presse — nous repondons avec clarte et rapidite.',
    contactBtn: 'Nous ecrire',
    contactPartners: 'Page partenaires',
    allEventsLink: 'Voir tous les evenements',
    homeFormTitle: 'Ecris-nous directement',
    homeFormIntro:
      'Questions sur l adhesion, les evenements ou les partenariats ? Nous revenons vers toi vite.',
    formName: 'Nom',
    formEmail: 'E-mail',
    formMessage: 'Message',
    formSubmit: 'Envoyer',
    formConsent: "J'accepte le traitement de mes donnees selon la",
    formPrivacy: 'politique de confidentialite',
    formSending: 'Envoi en cours...',
    formSuccess: 'Merci ! Ton message a bien ete envoye.',
    formError: "L'envoi a echoue. Reessaie dans un instant.",
  },
};
