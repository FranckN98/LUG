import type { Locale } from '@/i18n/config';

export type WhoWeAreStrings = {
  title: string;
  intro: string;
  story: {
    heading: string;
    lines: string[];
    /** Highlight block (the central question) */
    highlight: string;
    afterHighlight: string[];
  };
  vision: {
    heading: string;
    paragraphs: string[];
  };
  team: {
    heading: string;
    lead: string;
  };
  ctaContact: string;
};

const de: WhoWeAreStrings = {
  title: 'Über uns',
  intro:
    'Eine Idee. Ein engagiertes Team. Eine Community, die nicht allein anfangen will.',
  story: {
    heading: 'Unsere Geschichte',
    lines: [
      'Wir haben es selbst erlebt: in einem neuen Land ankommen, die Stille eines leeren Zimmers, das Gefühl, wieder ganz von vorne anzufangen. Ein neues System, eine neue Sprache, neue Codes.',
      'Was uns am meisten getroffen hat, war nicht die Schwierigkeit. Es war die Verschwendung. Das Wissen war da. Die Leute, die es schon geschafft hatten, auch. Es fehlte einfach der Kontakt zwischen beiden.',
    ],
    highlight: 'Warum kämpft jede:r allein, wenn die Antworten nur einen Schritt entfernt sind?',
    afterHighlight: [
      'Diese Frage hat uns nicht mehr losgelassen. Also haben wir etwas daraus gemacht.',
      'So ist Level Up in Germany entstanden. Keine klassische Organisation, eher ein Versprechen: niemand muss diesen Weg allein gehen.',
    ],
  },
  vision: {
    heading: 'Unsere Vision',
    paragraphs: [
      'Wir bauen das, was uns selbst gefehlt hat:',
      'Eine Brücke.',
      'Zwischen denen, die auf dem Weg sind, und denen, die schon weiter sind.',
      'Ein Ort, an dem Erfahrung weitergegeben wird, Fehler kleiner werden und Chancen wieder erreichbar sind.',
      'Weiterkommen, vor allem schneller. Und zusammen.',
    ],
  },
  team: {
    heading: 'Lernen Sie das Team kennen',
    lead: 'Menschen mit unterschiedlichen Fähigkeiten, die an dieselbe Sache glauben: Eine vernetzte Diaspora kommt weiter und öffnet gemeinsam neue Möglichkeiten.',
  },
  ctaContact: 'Kontakt',
};

const en: WhoWeAreStrings = {
  title: 'About us',
  intro:
    'One idea. A committed team. A community that does not want to start alone.',
  story: {
    heading: 'Our story',
    lines: [
      'We have lived it ourselves: arriving in a new country, the silence of an empty room, the weight of starting over. A new system, a new language, new unwritten rules.',
      'What hit us the hardest was not the difficulty. It was the waste. The knowledge was out there. The people who had figured it out were right there. What was missing was the link between the two.',
    ],
    highlight: 'Why does everyone fight alone when the answers are only one step away?',
    afterHighlight: [
      'That question stayed with us. So we did something about it.',
      'That is how Level Up in Germany started. Not as a classic organisation, more as a promise: no one should have to walk this path alone.',
    ],
  },
  vision: {
    heading: 'Our vision',
    paragraphs: [
      'We are building what was missing:',
      'A bridge.',
      'Between people who are still on the way and people who have already moved forward.',
      'A place where experience gets passed on, mistakes get smaller, and opportunities come back within reach.',
      'Moving forward, but mostly faster. And together.',
    ],
  },
  team: {
    heading: 'Get to know the team',
    lead: 'People with complementary strengths, united by one belief: a connected diaspora goes further and opens more doors together.',
  },
  ctaContact: 'Contact',
};

const fr: WhoWeAreStrings = {
  title: 'À propos',
  intro:
    'Une idée. Une équipe engagée. Une communauté qui ne veut pas avancer seule.',
  story: {
    heading: 'Notre histoire',
    lines: [
      'On l\'a vécu nous-mêmes : arriver dans un nouveau pays, le silence d\'une chambre vide, le poids de tout reprendre à zéro. Un nouveau système, une nouvelle langue, des codes qu\'on ne connaît pas.',
      'Ce qui nous a le plus frappés, ce n\'est pas la difficulté. C\'est le gâchis. Le savoir était là. Les gens qui avaient déjà trouvé leur voie aussi. Ce qui manquait, c\'était juste le lien entre les deux.',
    ],
    highlight: 'Pourquoi se battre seul quand les réponses sont à un pas ?',
    afterHighlight: [
      'Cette question ne nous a pas lâchés. Alors on a fait quelque chose.',
      'C\'est comme ça qu\'est né Level Up in Germany. Pas vraiment une organisation classique, plutôt une promesse : personne ne devrait faire ce chemin tout seul.',
    ],
  },
  vision: {
    heading: 'Notre vision',
    paragraphs: [
      'Créer ce qui nous a manqué :',
      'Un pont.',
      'Entre ceux qui sont en chemin et ceux qui ont déjà avancé.',
      'Un endroit où l\'expérience se partage, où les erreurs coûtent moins cher et où les opportunités redeviennent accessibles.',
      'Avancer, surtout plus vite. Et ensemble.',
    ],
  },
  team: {
    heading: 'Découvrez l’équipe',
    lead: 'Des personnes aux talents complémentaires, réunies par une conviction : une diaspora connectée va plus loin et ouvre davantage de possibilités ensemble.',
  },
  ctaContact: 'Contact',
};

export const whoWeAreContent: Record<Locale, WhoWeAreStrings> = {
  de,
  en,
  fr,
};
