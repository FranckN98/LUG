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
      'Wir verbinden internationale Talente in Deutschland mit Mentor:innen, Vorbildern und einem Netzwerk, in dem man wirklich ankommt.',
    heroBtnJoin: 'Bewegung beitreten',
    heroBtnAttend: 'Konferenz & Events',
    heroBtnPartner: 'Partner werden',
    problemEyebrow: 'Der Ausgangspunkt',
    problemTitle: 'Neu in Deutschland, oft allein mit großen Träumen',
    problemLead:
      'Viele Studierende, Absolvent:innen und Professionals kommen mit wenig Netzwerk und wenig Orientierung an. Vorbilder, die ihren Weg wirklich verstehen, fehlen meistens.',
    problemPoints: [
      'Studium, Berufseinstieg und Alltag treffen gleichzeitig auf einen ein.',
      'Finanzen, Familie und soziales Leben brauchen klare Strategien, nicht nur Motivation.',
      'Ohne vertrauensvolle Community bleibt vieles ungenutzt.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'Ein Raum, in dem Aufstieg, Sichtbarkeit und Wirkung Platz haben',
    visionBody:
      'Wir bauen eine Bewegung, in der Erfahrung weitergegeben wird. Erfolge werden sichtbar, und jede Person kann die nächste Stufe mit Rückenwind aus der Community erreichen.',
    missionEyebrow: 'Mission',
    missionTitle: 'Was wir konkret tun',
    missionLead:
      'Level Up in Germany begleitet Menschen mit Mentoring, Hochschul-Partnerschaften, Webinaren, Live-Events und einem Netzwerk inspirierender Role Models.',
    missionBullets: [
      'Business Tour: hinter die Kulissen erfolgreicher Marken und Gründer:innen.',
      'Workshops zu Karriere, Business, Finanzen und Leben in Deutschland.',
      'Jährliche Konferenz und Community-Events für echtes Networking.',
    ],
    businessTourEyebrow: 'Neue Initiative',
    businessTourTitle: 'Level Up Business Tour',
    businessTourTagline: 'Wir zeigen nicht den Erfolg, sondern die Arbeit dahinter.',
    businessTourBody:
      'Hinter jeder erfolgreichen Marke steckt eine Geschichte, die kaum jemand sieht: die Morgenstunden um fünf, die gescheiterten Versuche, die Entscheidungen zur richtigen Zeit. Die Business Tour geht in Unternehmen, Marken und Gründer-Communities in Deutschland, vor allem in der afrikanischen Diaspora, und dokumentiert den echten Weg hinter dem Ergebnis.',
    businessTourItems: [
      'Die Arbeit, die hinter sichtbarem Erfolg steckt',
      'Echte Gründungsgeschichten: Fehler, Disziplin, Strategie',
      'Geschäftssysteme und Abläufe aus der Praxis',
      'Praktische Inspiration für Menschen, die selbst gründen wollen',
    ],
    businessTourCta: 'Mehr erfahren',
    profilesEyebrow: 'Drei Profile, eine Bewegung',
    profilesTitle: 'Finde deinen Platz im Netzwerk',
    profilesLead:
      'Jede Rolle profitiert und trägt dazu bei, die Community größer und stärker zu machen.',
    profiles: [
      {
        title: 'Student:in / Azubi',
        role: 'Lernen & erste Schritte',
        body: 'Orientierung, Praktika, Netzwerk und Vorbilder, die deinen Alltag in Deutschland verstehen.',
      },
      {
        title: 'Junge:r Absolvent:in',
        role: 'Einstieg & Beschleunigung',
        body: 'Karrierepfade, Bewerbung, Sichtbarkeit und Mentoring für den professionellen Start.',
      },
      {
        title: 'Etablierte:r Professional',
        role: 'Wirkung & Rückgabe',
        body: 'Mentoring, Sponsoring, Bühnen und Partnerschaften: du öffnest Türen und stärkst die nächste Generation.',
      },
    ],
    programsEyebrow: 'Programme & Aktionen',
    programsTitle: 'Konkrete Wege zum nächsten Level',
    programsLead:
      'Vom kleinen Circle bis zur großen Bühne: Formate, die Wissen, Beziehungen und Selbstvertrauen aufbauen.',
    programs: [
      { title: 'Mentoring Circles', desc: 'Peer-Learning und begleitete Gruppen, die in Bewegung halten.', hrefKey: 'mentoring' },
      { title: 'Webinare', desc: 'Sessions mit Expert:innen zu Karriere, Business und Finanzen.', hrefKey: 'events' },
      { title: 'Events vor Ort', desc: 'Community, Networking und Energie im echten Raum.', hrefKey: 'events' },
      { title: 'Networking & Brücken', desc: 'Begegnungen, aus denen Partnerschaften werden.', hrefKey: 'partners' },
      { title: 'Workshops', desc: 'Hands-on rund um Leben, Arbeit und Wachstum in Deutschland.', hrefKey: 'workshops' },
      { title: 'Jährliche Konferenz', desc: 'Inspiration, Speaker:innen und Wirkung auf einer Bühne.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Werte & Wirkung',
    impactTitle: 'Was uns zusammenhält',
    impactLead:
      'Anspruch ohne Elitismus, Authentizität mit Ambition. Wir messen Erfolg auch daran, was wir weitergeben.',
    values: [
      { title: 'Weitergeben', desc: 'Wissen und Erfahrung fließen bewusst weiter.' },
      { title: 'Exzellenz', desc: 'Hohe Standards, pragmatisch und menschlich umgesetzt.' },
      { title: 'Authentizität', desc: 'Echte Geschichten, echte Begegnungen.' },
      { title: 'Repräsentation', desc: 'Sichtbarkeit für Wege, die zu oft unterschätzt wurden.' },
      { title: 'Gemeinsam aufsteigen', desc: 'Wenn eine:r aufsteigt, zieht die Community mit.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Community-Mitglieder & Teilnehmende' },
      { value: 50, suffix: '+', label: 'Mentor:innen & Speaker:innen' },
      { value: 15, suffix: '+', label: 'Partner & Universitäten' },
    ],
    ctaBandTitle: 'Bereit, gemeinsam aufzusteigen?',
    ctaBandSubtitle:
      'Werde Teil der Bewegung, gib deine Erfahrung als Mentor:in weiter oder öffne als Partner:in Türen.',
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
      'We connect international students, graduates and professionals in Germany with mentors, role models and a network where people actually feel at home.',
    heroBtnJoin: 'Join the movement',
    heroBtnAttend: 'Conference & events',
    heroBtnPartner: 'Partner with us',
    problemEyebrow: 'The starting point',
    problemTitle: 'New in Germany, often alone with big dreams',
    problemLead:
      'Many people arrive with little network, little guidance and few role models who really understand what their journey looks like, in studies, work, money, family and entrepreneurship.',
    problemPoints: [
      'Studies, first jobs and daily life all hit at the same time.',
      'Without trusted peers and mentors, a lot of potential stays hidden.',
      'Seeing paths that look like yours changes what feels possible.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'A space for elevation, representation and lasting impact',
    visionBody:
      'We are building a movement where experience is passed on. Wins become visible, and everyone can reach their next stage with the community behind them.',
    missionEyebrow: 'Mission',
    missionTitle: 'What we actually do',
    missionLead:
      'Level Up in Germany supports people through mentoring, university partnerships, webinars, in-person events and a network of inspiring role models.',
    missionBullets: [
      'Business Tour: going behind the scenes of successful brands and founders.',
      'Workshops on career, business, finance and life in Germany.',
      'An annual conference and community events for real connection.',
    ],
    businessTourEyebrow: 'New initiative',
    businessTourTitle: 'Level Up Business Tour',
    businessTourTagline: "We don't show off success. We show the work behind it.",
    businessTourBody:
      'Behind every successful brand, there is a story most people never see: the 5 a.m. starts, the failed attempts, the calls made at the right moment. The Business Tour goes directly into companies, brands and founder communities in Germany, especially within the African diaspora, to document the real path behind the visible result.',
    businessTourItems: [
      'The work behind visible success',
      'Real founder journeys: failures, discipline, strategy',
      'Business systems and operations from the inside',
      'Practical inspiration for people who want to start too',
    ],
    businessTourCta: 'Learn more',
    profilesEyebrow: 'Three profiles, one movement',
    profilesTitle: 'Find your place in the network',
    profilesLead:
      'Everyone gains something, and everyone helps the community grow stronger.',
    profiles: [
      {
        title: 'Student or apprentice',
        role: 'Learn and take first steps',
        body: 'Guidance, internships, network and mentors who understand your reality in Germany.',
      },
      {
        title: 'Young graduate',
        role: 'Launch and accelerate',
        body: 'Career paths, applications, visibility and mentoring for a confident professional start.',
      },
      {
        title: 'Established professional',
        role: 'Impact and give back',
        body: 'Mentoring, sponsorship, stages and partnerships: you open doors and lift the next generation.',
      },
    ],
    programsEyebrow: 'Programs and actions',
    programsTitle: 'Real paths to the next level',
    programsLead:
      'From small circles to the main stage, formats that build knowledge, relationships and confidence.',
    programs: [
      { title: 'Mentoring circles', desc: 'Peer learning and guided groups to keep momentum.', hrefKey: 'mentoring' },
      { title: 'Webinars', desc: 'Sessions with experts on career, business and finance.', hrefKey: 'events' },
      { title: 'In-person events', desc: 'Community energy and networking in real life.', hrefKey: 'events' },
      { title: 'Networking bridges', desc: 'Introductions that turn contacts into partnerships.', hrefKey: 'partners' },
      { title: 'Workshops', desc: 'Hands-on sessions on life, work and growth in Germany.', hrefKey: 'workshops' },
      { title: 'Annual conference', desc: 'Inspiration, speakers and impact on one stage.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Values and impact',
    impactTitle: 'What holds us together',
    impactLead:
      'High standards without elitism, authenticity with ambition. We also measure success by what we pass on.',
    values: [
      { title: 'Passing it on', desc: 'Knowledge and experience flow on purpose.' },
      { title: 'Excellence', desc: 'High standards, delivered with warmth.' },
      { title: 'Authenticity', desc: 'Real stories, real encounters.' },
      { title: 'Representation', desc: 'Visibility for paths that have been overlooked.' },
      { title: 'Rising together', desc: 'When one person levels up, the community rises too.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Community members reached' },
      { value: 50, suffix: '+', label: 'Mentors & speakers' },
      { value: 15, suffix: '+', label: 'Partners & universities' },
    ],
    ctaBandTitle: 'Ready to rise, together?',
    ctaBandSubtitle: 'Join the movement, mentor with us, or partner to open doors at scale.',
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
      'Nous mettons en lien les étudiants internationaux, les jeunes diplômés et les professionnels en Allemagne avec du mentorat, des modèles et un réseau où chacun peut vraiment se sentir à sa place.',
    heroBtnJoin: 'Rejoindre le mouvement',
    heroBtnAttend: 'Conférence et événements',
    heroBtnPartner: 'Devenir partenaire',
    problemEyebrow: 'Le point de départ',
    problemTitle: 'Nouveaux en Allemagne, souvent seuls avec de grands rêves',
    problemLead:
      'Beaucoup arrivent avec peu de réseau, peu de repères et peu de modèles qui comprennent vraiment leur parcours, que ce soit pour les études, le travail, les finances, la vie sociale ou l’entrepreneuriat.',
    problemPoints: [
      'Les études, le premier emploi et le quotidien arrivent tous en même temps.',
      'Sans pairs ni mentors de confiance, beaucoup de potentiel reste invisible.',
      'Voir des parcours qui ressemblent au sien change ce qui paraît possible.',
    ],
    visionEyebrow: 'Vision',
    visionTitle: 'Un espace pour s’élever, se représenter et durer',
    visionBody:
      'Nous construisons un mouvement où l’expérience se transmet. Les réussites deviennent visibles, et chacun peut passer au niveau suivant avec le collectif derrière lui.',
    missionEyebrow: 'Mission',
    missionTitle: 'Ce que nous faisons concrètement',
    missionLead:
      'Level Up in Germany accompagne les gens via le mentorat, des partenariats avec des universités, des webinaires, des événements en présentiel et un réseau de modèles inspirants.',
    missionBullets: [
      'Business Tour : aller dans les coulisses des marques et entrepreneurs qui réussissent.',
      'Ateliers carrière, business, finances et vie en Allemagne.',
      'Conférence annuelle et événements communautaires pour créer du vrai lien.',
    ],
    businessTourEyebrow: 'Nouvelle initiative',
    businessTourTitle: 'Level Up Business Tour',
    businessTourTagline: 'On ne montre pas le succès. On montre le travail derrière.',
    businessTourBody:
      'Derrière chaque marque qui réussit, il y a une histoire que peu de gens voient : les levers à 5 h du matin, les échecs, les décisions prises au bon moment. La Business Tour entre directement dans les entreprises, les marques et les communautés de fondateurs en Allemagne, en particulier au sein de la diaspora africaine, pour documenter le vrai parcours derrière le résultat visible.',
    businessTourItems: [
      'Le travail qu’il y a derrière le succès visible',
      'De vrais parcours d’entrepreneurs : échecs, discipline, stratégie',
      'Les systèmes et le fonctionnement vus de l’intérieur',
      'Une inspiration concrète pour ceux qui veulent se lancer',
    ],
    businessTourCta: 'En savoir plus',
    profilesEyebrow: 'Trois profils, un mouvement',
    profilesTitle: 'Trouve ta place dans le réseau',
    profilesLead:
      'Chacun y gagne quelque chose, et chacun peut faire grandir la communauté.',
    profiles: [
      {
        title: 'Étudiant ou apprenti',
        role: 'Apprendre et faire ses premiers pas',
        body: 'Orientation, stages, réseau et mentors qui comprennent ton quotidien en Allemagne.',
      },
      {
        title: 'Jeune diplômé',
        role: 'Se lancer et accélérer',
        body: 'Parcours pro, candidatures, visibilité et mentorat pour un départ solide.',
      },
      {
        title: 'Professionnel établi',
        role: 'Avoir de l’impact et transmettre',
        body: 'Mentorat, sponsoring, prises de parole et partenariats : tu ouvres des portes et tu fais monter la génération suivante.',
      },
    ],
    programsEyebrow: 'Programmes et actions',
    programsTitle: 'Des chemins concrets vers le niveau suivant',
    programsLead:
      'Des petits cercles à la grande scène, des formats qui construisent du savoir, des liens et de la confiance.',
    programs: [
      { title: 'Cercles de mentorat', desc: 'Apprentissage entre pairs et groupes accompagnés pour garder le rythme.', hrefKey: 'mentoring' },
      { title: 'Webinaires', desc: 'Sessions avec des experts sur la carrière, le business et les finances.', hrefKey: 'events' },
      { title: 'Événements sur place', desc: 'L’énergie de la communauté et du networking dans la vraie vie.', hrefKey: 'events' },
      { title: 'Ponts entre réseaux', desc: 'Des rencontres qui se transforment en partenariats.', hrefKey: 'partners' },
      { title: 'Ateliers', desc: 'En pratique : la vie, le travail et la croissance en Allemagne.', hrefKey: 'workshops' },
      { title: 'Conférence annuelle', desc: 'De l’inspiration, des intervenants et de l’impact sur une seule scène.', hrefKey: 'conference' },
    ],
    impactEyebrow: 'Valeurs et impact',
    impactTitle: 'Ce qui nous rassemble',
    impactLead:
      'De l’exigence sans élitisme, de l’authenticité avec de l’ambition. On mesure aussi le succès à ce qu’on transmet.',
    values: [
      { title: 'Transmission', desc: 'On fait circuler le savoir et l’expérience volontairement.' },
      { title: 'Excellence', desc: 'De l’exigence avec de la chaleur humaine.' },
      { title: 'Authenticité', desc: 'De vraies histoires, de vraies rencontres.' },
      { title: 'Représentation', desc: 'De la visibilité pour des parcours trop souvent sous-estimés.' },
      { title: 'Monter ensemble', desc: 'Quand l’un monte d’un cap, la communauté monte avec.' },
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Membres et participant.e.s' },
      { value: 50, suffix: '+', label: 'Mentors et intervenant.e.s' },
      { value: 15, suffix: '+', label: 'Partenaires et universités' },
    ],
    ctaBandTitle: 'Prêt.e à monter d’un cap, ensemble ?',
    ctaBandSubtitle: 'Rejoins le mouvement, deviens mentor ou partenaire pour ouvrir des portes à plus grande échelle.',
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
