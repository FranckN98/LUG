/**
 * Photos de la deuxième édition (17 octobre 2026) — uniquement celles fournies par l'équipe.
 * Fichiers à placer dans public/feedback/. La première est la grande photo, les suivantes (jusqu'à 3)
 * sont complémentaires. Tant que la liste est vide, la page affiche un en-tête sans image.
 * `position` règle le cadrage (ex. 'center 25%') pour garder les visages dans le cadre.
 */
export type FeedbackPhoto = { src: string; alt: string; position?: string };

export const FEEDBACK_PHOTOS: FeedbackPhoto[] = [
  {
    src: '/feedback/edition-2-groupe.jpg',
    position: 'center 35%',
    alt: 'Photo de groupe sur le tapis rouge devant le mur Level Up in Germany, deuxième édition',
  },
];
