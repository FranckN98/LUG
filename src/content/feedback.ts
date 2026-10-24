/** Textes et limites de la page de feedback de la deuxième édition (français). */

export const FEEDBACK_LIMITS = {
  longText: 2000,
  shortText: 1000,
  name: 60,
  email: 254,
} as const;

export const feedbackCopy = {
  seo: {
    title: 'Votre avis sur la deuxième édition | Level Up in Germany',
    description: 'Partagez votre retour sur la deuxième édition de Level Up in Germany, en toute liberté et anonymement.',
  },
  kicker: 'Deuxième édition · 17 octobre 2026',
  title: 'Votre retour fait grandir Level Up',
  intro:
    'Merci d’avoir participé à la deuxième édition de Level Up in Germany. Votre avis nous aidera à préparer une prochaine édition encore meilleure. Vous pouvez répondre anonymement et partager librement ce qui vous a plu comme ce qui pourrait être amélioré.',
  badges: ['Environ 2 minutes', 'Anonyme par défaut'],
  progress: { label: 'Progression', of: 'sur' },
  rating: {
    question: 'Quelle note globale attribuez-vous à la deuxième édition de Level Up in Germany ?',
    low: 'Très décevante',
    high: 'Excellente',
    star: (n: number) => `${n} étoile${n > 1 ? 's' : ''} sur 5`,
  },
  highlights: {
    question: 'Quel moment ou quel aspect de l’événement vous a le plus marqué ? Qu’est-ce qui vous a plu ou moins plu ?',
    placeholder: 'Écrivez librement…',
  },
  improvements: {
    question: 'Qu’avez-vous particulièrement apprécié, et que devrions-nous améliorer pour une prochaine édition ?',
    placeholder: 'Vos idées nous intéressent…',
  },
  wishes: {
    question:
      'Quels intervenants ou invités aimeriez-vous voir lors d’un prochain événement ? Quels sujets aimeriez-vous que nous abordions ?',
    speakers: 'Intervenants ou invités souhaités',
    topics: 'Sujets à aborder',
  },
  sign: {
    toggle: 'Je souhaite signer mon retour',
    hint: 'Par défaut, votre réponse reste anonyme.',
    warning: 'Votre réponse ne sera alors plus anonyme.',
    firstName: 'Prénom',
    lastName: 'Nom',
    optional: 'facultatif',
  },
  contact: {
    title: 'Rester en contact',
    optionalBadge: 'Facultatif',
    question: 'Souhaitez-vous recevoir des nouvelles de nos prochaines visites guidées, Business Tours et événements ?',
    checkbox: 'Oui, je souhaite recevoir des nouvelles',
    email: 'Adresse e-mail',
    firstName: 'Prénom',
    lastName: 'Nom',
    optional: 'facultatif',
    privacy:
      'Cette inscription est facultative. Vos coordonnées sont enregistrées séparément de vos réponses au feedback : votre adresse e-mail ne permet pas d’identifier la réponse que vous avez donnée.',
  },
  submit: 'Envoyer mon retour',
  sending: 'Envoi en cours…',
  success: 'Merci d’avoir pris le temps de nous répondre. Votre retour nous aidera à faire grandir Level Up.',
  alreadyAnswered: 'Un retour a déjà été envoyé depuis ce navigateur. Merci pour votre participation !',
  newsletterFailed:
    'Votre retour est bien enregistré, mais votre inscription aux prochaines nouvelles n’a pas pu l’être. Vous pouvez réessayer plus tard.',
  errors: {
    rating: 'Choisissez une note de 1 à 5 étoiles.',
    email: 'Saisissez une adresse e-mail valide pour recevoir nos nouvelles.',
    name: 'Ce nom contient des caractères non valides.',
    tooLong: 'Ce texte est trop long.',
    rateLimited: 'Trop de tentatives. Réessayez dans quelques minutes.',
    generic: 'L’envoi a échoué. Vérifiez votre connexion et réessayez.',
  },
} as const;

/** Étiquettes proposées à la première ouverture de l'espace d'administration. */
export const DEFAULT_FEEDBACK_TAGS = [
  'Contenu',
  'Intervenants',
  'Organisation',
  'Lieu',
  'Networking',
  'Restauration',
  'Idées pour la prochaine édition',
] as const;
