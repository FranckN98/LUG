/**
 * Core Team — r\u00f4les { de, en, fr } selon la langue du site (header).
 * Images : public/team/core-01.png ... core-08.png
 */

export type CoreTeamMember = {
  image: string;
  name: string;
  role: { de: string; en: string; fr: string };
};

export const CORE_TEAM_MEMBERS: CoreTeamMember[] = [
  {
    image: '/team/core-03.png',
    name: 'Franck Ngami',
    role: {
      de: 'Pr\u00e4sident',
      en: 'President',
      fr: 'Pr\u00e9sident',
    },
  },
  {
    image: '/team/core-08.png',
    name: 'Ange Wankeu',
    role: {
      de: 'Vizepr\u00e4sident \u00b7 Strategie & Operations',
      en: 'Vice President \u00b7 Strategy & Operations',
      fr: 'Vice-pr\u00e9sident \u00b7 Strat\u00e9gie & op\u00e9rations',
    },
  },
  {
    image: '/team/core-04.png',
    name: 'Nelly Ateba',
    role: {
      de: 'Generalsekret\u00e4rin',
      en: 'General Secretary',
      fr: 'Secr\u00e9taire g\u00e9n\u00e9rale',
    },
  },
  {
    image: '/team/core-02.png',
    name: 'Ryan Curtis Doumbeu',
    role: {
      de: 'Leitung Finanzen',
      en: 'Head of Finance',
      fr: 'Responsable finances',
    },
  },
  {
    image: '/team/core-07.png',
    name: 'Vayesma Kamte',
    role: {
      de: 'Compliance & Governance',
      en: 'Compliance & Governance',
      fr: 'Conformit\u00e9 & gouvernance',
    },
  },
  {
    image: '/team/core-05.png',
    name: 'Frank Tchana',
    role: {
      de: 'People & Culture',
      en: 'People & Culture',
      fr: 'People & culture',
    },
  },
  {
    image: '/team/core-06.png',
    name: 'Valdo Djeumo',
    role: {
      de: 'Interner Revisor',
      en: 'Internal Auditor',
      fr: 'Auditeur interne',
    },
  },
  {
    image: '/team/core-01.png',
    name: 'Sonia Nguembou',
    role: {
      de: 'Community & Partnerschaften',
      en: 'Community & Partnerships',
      fr: 'Communaut\u00e9 & partenariats',
    },
  },
];
