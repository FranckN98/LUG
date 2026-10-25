import type { Locale } from '@/i18n/config';

/**
 * Traductions de secours (EN / DE) du contenu de billetterie saisi en français dans l'admin.
 * Elles ne servent que lorsque l'admin n'a renseigné aucune traduction pour le champ : une traduction
 * saisie dans l'admin l'emporte toujours. Une phrase absente de ce glossaire reste en français.
 */

type Row = [fr: string, en: string, de: string];

const ROWS: Row[] = [
  // Libellés des catégories
  ['Santé, Pflege & Opportunités', 'Health, Care & Opportunities', 'Gesundheit, Pflege & Chancen'],
  ['Carrière & Employabilité', 'Career & Employability', 'Karriere & Beschäftigungsfähigkeit'],
  ['Business, Investissement & Croissance', 'Business, Investment & Growth', 'Business, Investment & Wachstum'],

  // Healthcare Excellence
  [
    'Mieux apprendre, mieux s’organiser et réussir sa formation',
    'Learn better, get better organised and succeed in your training',
    'Besser lernen, sich besser organisieren und die Ausbildung erfolgreich meistern',
  ],
  [
    'Construire un plan de carrière clair pour éviter de rester bloqué au même niveau',
    'Build a clear career plan to avoid being stuck at the same level',
    'Einen klaren Karriereplan aufbauen, um nicht auf derselben Stufe stehen zu bleiben',
  ],
  [
    'Identifier les meilleures opportunités de formation, de spécialisation et d’évolution dans la santé en Allemagne',
    'Identify the best training, specialisation and career-progression opportunities in healthcare in Germany',
    'Die besten Chancen für Ausbildung, Spezialisierung und Weiterentwicklung im Gesundheitswesen in Deutschland erkennen',
  ],
  [
    'Comprendre comment négocier son salaire et valoriser son expérience',
    'Understand how to negotiate your salary and make the most of your experience',
    'Verstehen, wie man sein Gehalt verhandelt und seine Erfahrung wirkungsvoll einbringt',
  ],
  [
    'Découvrir les passerelles vers d’autres fonctions, études et postes à responsabilités',
    'Discover pathways to other roles, studies and positions of responsibility',
    'Übergänge zu anderen Aufgaben, Studiengängen und Führungspositionen entdecken',
  ],
  [
    'Apprendre à accélérer sa progression pendant une Ausbildung ou une reconnaissance de diplôme',
    'Learn to speed up your progress during an Ausbildung or a diploma recognition',
    'Lernen, den eigenen Fortschritt während einer Ausbildung oder Anerkennung des Abschlusses zu beschleunigen',
  ],

  // Career Launch
  [
    'Réussir ses entretiens d’embauche et obtenir plus rapidement un stage, un emploi ou une alternance (Werkstudent)',
    'Ace your job interviews and land an internship, a job or a work-study position (Werkstudent) faster',
    'Vorstellungsgespräche meistern und schneller ein Praktikum, eine Stelle oder eine Werkstudentenstelle finden',
  ],
  [
    'Construire une carrière adaptée à son profil, ses compétences et ses objectifs',
    'Build a career that fits your profile, skills and goals',
    'Eine Karriere aufbauen, die zu Profil, Kompetenzen und Zielen passt',
  ],
  [
    'Apprendre à mieux valoriser son expérience, ses compétences et son potentiel auprès des recruteurs',
    'Learn to present your experience, skills and potential better to recruiters',
    'Lernen, Erfahrung, Kompetenzen und Potenzial gegenüber Recruitern besser zur Geltung zu bringen',
  ],
  [
    'Développer son personal branding pour gagner en visibilité et en crédibilité en entreprise',
    'Develop your personal branding to gain visibility and credibility in the workplace',
    'Das eigene Personal Branding entwickeln, um im Unternehmen sichtbarer und glaubwürdiger zu werden',
  ],
  [
    'Évoluer vers des postes plus stratégiques, mieux rémunérés et à responsabilités',
    'Move into more strategic, better-paid positions with more responsibility',
    'In strategischere, besser bezahlte Positionen mit mehr Verantwortung aufsteigen',
  ],
  [
    'Négocier plus efficacement son salaire, son évolution et ses prochaines opportunités professionnelles',
    'Negotiate your salary, your progression and your next career opportunities more effectively',
    'Gehalt, Entwicklung und die nächsten beruflichen Chancen wirkungsvoller verhandeln',
  ],

  // Business Growth
  [
    'Comprendre comment investir dans l’immobilier en Allemagne et éviter les erreurs coûteuses',
    'Understand how to invest in real estate in Germany and avoid costly mistakes',
    'Verstehen, wie man in Deutschland in Immobilien investiert und teure Fehler vermeidet',
  ],
  [
    'Découvrir les modèles e-commerce accessibles et les étapes pour se lancer',
    'Discover accessible e-commerce models and the steps to get started',
    'Zugängliche E-Commerce-Modelle und die Schritte zum Einstieg kennenlernen',
  ],
  [
    'Savoir comment enregistrer et structurer une activité indépendante en Allemagne',
    'Know how to register and structure a self-employed business in Germany',
    'Wissen, wie man in Deutschland eine selbstständige Tätigkeit anmeldet und strukturiert',
  ],
  [
    'Choisir le bon statut et comprendre les obligations administratives et fiscales',
    'Choose the right legal status and understand the administrative and tax obligations',
    'Die passende Rechtsform wählen und die administrativen und steuerlichen Pflichten verstehen',
  ],
  [
    'Transformer une idée en activité rentable avec une offre et un positionnement clairs',
    'Turn an idea into a profitable business with a clear offer and positioning',
    'Eine Idee mit klarem Angebot und klarer Positionierung in ein profitables Geschäft verwandeln',
  ],
  [
    'Développer son chiffre d’affaires, structurer ses finances et faire grandir son activité',
    'Grow your revenue, structure your finances and scale your business',
    'Den Umsatz steigern, die Finanzen strukturieren und das Geschäft wachsen lassen',
  ],

  // Rôles des intervenants
  [
    'CEO avec 25 ans de carrière internationale, Fondateur de Niang Coaching',
    'CEO with 25 years of international career, Founder of Niang Coaching',
    'CEO mit 25 Jahren internationaler Karriere, Gründer von Niang Coaching',
  ],
  ['Directeur exécutif, Gestion des risques | J.P. Morgan', 'Executive Director, Risk Management | J.P. Morgan', 'Executive Director, Risikomanagement | J.P. Morgan'],
  [
    'Ingénieur, entrepreneur & investisseur expert en immobilier',
    'Engineer, entrepreneur & real estate investment expert',
    'Ingenieur, Unternehmer & Experte für Immobilieninvestitionen',
  ],
  ['Area Manager chez Amazon • Vice-présidente chez MAPIOLE', 'Area Manager at Amazon • Vice President at MAPIOLE', 'Area Manager bei Amazon • Vizepräsidentin bei MAPIOLE'],
  [
    'Investisseur, Professeur de Mathématiques & Data Science Ancien responsable du Risk Management dans le secteur bancaire',
    'Investor, Professor of Mathematics & Data Science, former Head of Risk Management in the banking sector',
    'Investor, Professor für Mathematik & Data Science, ehemaliger Leiter des Risikomanagements im Bankensektor',
  ],
  ['Cofondateur & CEO de NDCT24 Intensivpflegedienst', 'Co-founder & CEO of NDCT24 Intensivpflegedienst', 'Mitgründer & CEO von NDCT24 Intensivpflegedienst'],
  ['Expert en finance, auteur & dirigeant international', 'Finance expert, author & international executive', 'Finanzexperte, Autor & internationale Führungskraft'],
  [
    'Business Consultant, Entrepreneure et fondatrice de Familov',
    'Business consultant, entrepreneur and founder of Familov',
    'Business Consultant, Unternehmerin und Gründerin von Familov',
  ],
  [
    'CEO et fondateur de cave des montagnes & entrepreneur agroalimentaire',
    'CEO and founder of cave des montagnes & food industry entrepreneur',
    'CEO und Gründer von cave des montagnes & Unternehmer in der Lebensmittelbranche',
  ],
  ['Coach en carrière et expert en développement professionnel', 'Career coach and professional development expert', 'Karrierecoach und Experte für berufliche Entwicklung'],
  [
    'Conférencier en leadership, mindset et transformation personnelle',
    'Speaker on leadership, mindset and personal transformation',
    'Redner zu Leadership, Mindset und persönlicher Transformation',
  ],
  [
    'Pedagogue et experte en développement de carrière en soins infirmiers',
    'Educator and career development expert in nursing',
    'Pädagogin und Expertin für Karriereentwicklung in der Pflege',
  ],
  ['Manageur en soins et expert développement de carrière', 'Care manager and career development expert', 'Pflegemanager und Experte für Karriereentwicklung'],
  [
    'Chef de projet automobile enseignant universitaire et fondateur de Germany success academy',
    'Automotive project manager, university lecturer and founder of Germany Success Academy',
    'Projektleiter in der Automobilbranche, Hochschuldozent und Gründer der Germany Success Academy',
  ],
  ['Fondatrice de PICARDE & entrepreneure agroalimentaire', 'Founder of PICARDE & food industry entrepreneur', 'Gründerin von PICARDE & Unternehmerin in der Lebensmittelbranche'],
  ['Directeur d\'etablissement en soins infirmiers', 'Director of a nursing care facility', 'Einrichtungsleiter in der Pflege'],
  ['Manageur dans le domaine de la qualité', 'Quality management professional', 'Manager im Bereich Qualität'],

  // Mentions de disponibilité
  ['Places limitées', 'Limited places', 'Begrenzte Plätze'],
  ['Dernières places', 'Last tickets', 'Letzte Plätze'],

  // Page de billetterie
  ['Une journée pour accélérer votre avenir en Allemagne.', 'A day to accelerate your future in Germany.', 'Ein Tag, um deine Zukunft in Deutschland zu beschleunigen.'],
  ['Choisir mon billet', 'Choose my ticket', 'Mein Ticket wählen'],
  ['Acheter mon billet', 'Buy my ticket', 'Mein Ticket kaufen'],
  ['Réserver ma place', 'Book my seat', 'Meinen Platz buchen'],
  ['Francfort', 'Frankfurt', 'Frankfurt'],
  ['Francfort-sur-le-Main', 'Frankfurt am Main', 'Frankfurt am Main'],
];

/** Clé de comparaison : sans accents ni casse, ponctuation et espaces réduits à un espace. */
export function glossaryKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const INDEX = new Map<string, { en: string; de: string }>(
  ROWS.map(([fr, en, de]) => [glossaryKey(fr), { en, de }]),
);

/** Traduction de secours d'une phrase française connue ; null si elle n'est pas dans le glossaire. */
export function translateKnownPhrase(text: string | null | undefined, locale: Locale): string | null {
  if (!text || locale === 'fr') return null;
  return INDEX.get(glossaryKey(text))?.[locale] ?? null;
}

const MONTHS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];

/** « 17 octobre 2026 » (éventuellement précédé du jour de la semaine) → date écrite dans la langue demandée. */
export function translateFrenchDate(text: string | null | undefined, locale: Locale): string | null {
  if (!text || locale === 'fr') return null;
  const m = glossaryKey(text).match(/^(?:(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) )?(\d{1,2})(?:er)? ([a-z]+) (\d{4})$/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2]!);
  if (month === -1) return null;
  const weekday = /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) /.test(glossaryKey(text));
  const date = new Date(Date.UTC(Number(m[3]), month, Number(m[1])));
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
    ...(weekday ? { weekday: 'long' as const } : {}),
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** « Moderatrice Career Launch » → rôle écrit dans la langue demandée (corrige aussi les accents et une faute de frappe courante). */
export function localizeModeratorRole(role: string | null | undefined, locale: Locale): string {
  const raw = (role ?? '').trim();
  const m = glossaryKey(raw).match(/^moderat(eur|rice) (.+)$/);
  if (!m) return raw;
  const track = raw.replace(/^\S+\s+/, '').replace(/heahlcare/i, 'Healthcare');
  const feminine = m[1] === 'rice';
  if (locale === 'fr') return `${feminine ? 'Modératrice' : 'Modérateur'} ${track}`;
  if (locale === 'en') return `Moderator ${track}`;
  return `${feminine ? 'Moderatorin' : 'Moderator'} ${track}`;
}
