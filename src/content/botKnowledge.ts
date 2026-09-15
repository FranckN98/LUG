import type { Locale } from '@/i18n/config';

/**
 * Static knowledge base for "Level Up Bot".
 * Used both as a keyword-matched fallback (no AI configured) and as
 * grounding context passed to the AI model when OPENAI_API_KEY is set.
 */
export interface BotKnowledgeEntry {
  id: string;
  /** Words/phrases (accents/case don't matter, matching normalizes both sides). */
  keywords: string[];
  question: string;
  answer: string;
}

export const BOT_KNOWLEDGE: Record<Locale, BotKnowledgeEntry[]> = {
  fr: [
    {
      id: 'tickets_difference',
      keywords: ['difference billet', 'trois billets', 'career lounge', 'business investment', 'healthcare excellence', 'types de billet', 'quel billet choisir'],
      question: 'Quelle est la différence entre les trois billets ?',
      answer:
        "Les trois billets (Career Lounge, Business & Investment, Healthcare Excellence) donnent tous accès à toute la journée Level Up : keynotes, grands panels, networking et conférences communes. La seule différence concerne le Deep Dive, un atelier spécialisé de 2h30 selon votre billet : Career Lounge (branding, employabilité, recrutement, soft skills), Business & Investment (immobilier, bourse/ETF, e-commerce, gestion de patrimoine), Healthcare Excellence (opportunités et carrière dans la santé).",
    },
    {
      id: 'ticket_choice',
      keywords: ["quel billet choisir si j'hesite", 'je ne sais pas quel billet prendre', 'lequel choisir'],
      question: "Quel billet choisir si j'hésite ?",
      answer:
        "Posez-vous cette question : quel est aujourd'hui le domaine qui aura le plus d'impact sur mon avenir (carrière, business/investissement, ou santé) ? Choisissez ensuite le billet/parcours qui correspond le mieux à cet objectif.",
    },
    {
      id: 'deep_dive_switch',
      keywords: ['changer de parcours', 'changer de deep dive', 'switch pendant deep dive'],
      question: 'Puis-je changer de parcours pendant les Deep Dives ?',
      answer:
        "Non, les trois Deep Dives se déroulent en même temps dans trois salles différentes et durent 2h30 chacun. Chaque participant suit le parcours correspondant à son billet, pour garantir la qualité de l'expérience et la capacité des salles.",
    },
    {
      id: 'meet_speakers',
      keywords: ['rencontrer les intervenants', 'rencontrer les speakers', 'parler aux intervenants', 'networking avec intervenants'],
      question: 'Pourrai-je rencontrer les intervenants ?',
      answer:
        "Oui ! Plusieurs moments de networking sont prévus tout au long de la journée pour échanger avec les intervenants, les partenaires et les autres participants.",
    },
    {
      id: 'arrival_time',
      keywords: ['a quelle heure arriver', "heure d'arrivee", 'quand arriver'],
      question: "À quelle heure dois-je arriver ?",
      answer:
        "Nous recommandons d'arriver 30 à 45 minutes avant le début de l'événement, pour vous enregistrer sereinement, découvrir les espaces partenaires et profiter du networking avant l'ouverture officielle.",
    },
    {
      id: 'parking',
      keywords: ['parking', 'se garer', 'stationner', 'garer ma voiture'],
      question: 'Où puis-je me garer ?',
      answer:
        "Le parking officiel du The Squaire est disponible sur place. Des alternatives moins chères existent à proximité (Gateway Gardens Parking, Gateway Gardens Plaza Parking, P+R Frankfurt Stadion, Park & Ride Flughafenstraße) — cherchez-les sur Google Maps.",
    },
    {
      id: 'venue',
      keywords: ['lieu evenement', 'adresse', 'the squaire', 'ou se passe', 'ou a lieu', 'frankfurt'],
      question: "Où se déroule l'événement ?",
      answer:
        "L'événement Level Up in Germany se déroule à Frankfurt am Main, au The Squaire (zone de l'aéroport de Francfort). L'adresse exacte et les détails de salle sont communiqués lors de l'inscription.",
    },
    {
      id: 'buy_ticket',
      keywords: ['acheter billet', 'prix billet', 'combien coute', 'tarif billet', 'reserver ma place', 'ou acheter'],
      question: 'Comment et où acheter mon billet ?',
      answer:
        "Vous pouvez réserver votre billet directement sur la page \"Buy Ticket\" du site. Les tarifs et disponibilités (Early Bird, etc.) y sont mis à jour en temps réel, je ne peux donc pas les indiquer ici avec certitude.",
    },
    {
      id: 'programme',
      keywords: ['programme', 'planning journee', 'horaires evenement', 'agenda de la journee'],
      question: "Où puis-je voir le programme de la journée ?",
      answer:
        "Le programme détaillé (keynotes, panels, Deep Dives, networking) est disponible sur la page \"Programme\" du site, et peut évoluer jusqu'à l'événement.",
    },
    {
      id: 'community_whatsapp',
      keywords: ['whatsapp', 'communaute', 'rejoindre le groupe', 'groupe whatsapp'],
      question: 'Comment rejoindre la communauté Level Up in Germany ?',
      answer:
        "Vous pouvez rejoindre notre communauté WhatsApp via le bouton \"Rejoindre\" présent dans le menu du site, pour recevoir les actualités et échanger avec d'autres membres.",
    },
    {
      id: 'speaker_apply',
      keywords: ['devenir intervenant', 'etre speaker', 'proposer une conference', 'candidature intervenant', 'postuler comme intervenant', 'animer un atelier'],
      question: 'Comment devenir intervenant (speaker) ?',
      answer:
        "Pour proposer une intervention ou une candidature en tant qu'intervenant, le mieux est de contacter l'équipe via le formulaire de la page \"Contact\" ou par e-mail à info@levelupingermany.com, en précisant votre domaine d'expertise et votre proposition de sujet.",
    },
    {
      id: 'partner_sponsor',
      keywords: ['devenir partenaire', 'sponsor', 'sponsoriser', 'partenariat', 'reserver un stand'],
      question: 'Comment devenir partenaire ou sponsor ?',
      answer:
        "Toutes les informations sur les formules de partenariat et de sponsoring sont sur les pages \"Partenaires\" et \"Sponsor/Donate\" du site. Vous pouvez aussi nous contacter directement via la page \"Contact\".",
    },
    {
      id: 'membership',
      keywords: ['adhesion', 'devenir membre', 'rejoindre association', 'membership'],
      question: "Comment devenir membre de l'association ?",
      answer:
        "Les modalités d'adhésion sont détaillées sur la page \"Membership\" du site. Vous pouvez y remplir un formulaire pour rejoindre l'association Level Up in Germany.",
    },
    {
      id: 'contact',
      keywords: ['contact', 'joindre les organisateurs', 'autre question', 'parler a quelqu un'],
      question: "Comment contacter les organisateurs ?",
      answer:
        "Vous pouvez écrire à info@levelupingermany.com ou utiliser le formulaire de la page \"Contact\" du site — l'équipe vous répondra dès que possible.",
    },
  ],
  en: [
    {
      id: 'tickets_difference',
      keywords: ['difference between tickets', 'three tickets', 'career lounge', 'business investment', 'healthcare excellence', 'ticket types', 'which ticket'],
      question: 'What is the difference between the three tickets?',
      answer:
        "All three tickets (Career Lounge, Business & Investment, Healthcare Excellence) give access to the entire Level Up day: keynotes, main panels, networking and shared conferences. The only difference is the Deep Dive, a specialised 2.5-hour workshop based on your ticket: Career Lounge (branding, employability, recruitment, soft skills), Business & Investment (real estate, stock market/ETFs, e-commerce, wealth management), Healthcare Excellence (career opportunities in healthcare).",
    },
    {
      id: 'ticket_choice',
      keywords: ["which ticket should i choose", "not sure which ticket", 'which one to pick'],
      question: "Which ticket should I choose if I'm not sure?",
      answer:
        "Ask yourself: which area will have the biggest impact on my future today — career, business/investment, or healthcare? Then choose the ticket/track matching that goal.",
    },
    {
      id: 'deep_dive_switch',
      keywords: ['switch track', 'change deep dive', 'switch during deep dive'],
      question: 'Can I switch tracks during the Deep Dives?',
      answer:
        "No, the three Deep Dives run at the same time in three different rooms and last 2.5 hours each. Every attendee follows the track matching their ticket to ensure quality and respect room capacity.",
    },
    {
      id: 'meet_speakers',
      keywords: ['meet the speakers', 'talk to speakers', 'networking with speakers'],
      question: 'Will I be able to meet the speakers?',
      answer:
        "Yes! Several networking moments are planned throughout the day so you can talk with speakers, partners and other attendees.",
    },
    {
      id: 'arrival_time',
      keywords: ['what time should i arrive', 'arrival time', 'when to arrive'],
      question: 'What time should I arrive?',
      answer:
        "We recommend arriving 30 to 45 minutes before the event starts, so you can check in calmly, explore partner areas and enjoy networking before the official opening.",
    },
    {
      id: 'parking',
      keywords: ['parking', 'where to park', 'park my car'],
      question: 'Where can I park?',
      answer:
        "The official The Squaire parking is available on site. Cheaper alternatives exist nearby (Gateway Gardens Parking, Gateway Gardens Plaza Parking, P+R Frankfurt Stadion, Park & Ride Flughafenstraße) — search for them on Google Maps.",
    },
    {
      id: 'venue',
      keywords: ['event location', 'venue address', 'the squaire', 'where does it take place', 'frankfurt'],
      question: 'Where does the event take place?',
      answer:
        "Level Up in Germany takes place in Frankfurt am Main, at The Squaire (near Frankfurt Airport). The exact address and room details are shared upon registration.",
    },
    {
      id: 'buy_ticket',
      keywords: ['buy ticket', 'ticket price', 'how much does it cost', 'ticket fee', 'book my spot', 'where to buy'],
      question: 'How and where can I buy my ticket?',
      answer:
        "You can book your ticket directly on the \"Buy Ticket\" page of the site. Prices and availability (Early Bird, etc.) are updated there in real time, so I can't state exact figures here with certainty.",
    },
    {
      id: 'programme',
      keywords: ['programme', 'schedule', 'event agenda', 'day schedule'],
      question: 'Where can I see the day\'s programme?',
      answer:
        "The detailed programme (keynotes, panels, Deep Dives, networking) is available on the \"Programme\" page of the site, and may still evolve before the event.",
    },
    {
      id: 'community_whatsapp',
      keywords: ['whatsapp', 'community', 'join the group', 'whatsapp group'],
      question: 'How do I join the Level Up in Germany community?',
      answer:
        "You can join our WhatsApp community via the \"Join\" button in the site menu to get updates and connect with other members.",
    },
    {
      id: 'speaker_apply',
      keywords: ['become a speaker', 'apply as speaker', 'propose a talk', 'speaker application', 'host a workshop'],
      question: 'How can I become a speaker?',
      answer:
        "To propose a talk or apply as a speaker, the best way is to contact the team through the \"Contact\" page form or by email at info@levelupingermany.com, describing your area of expertise and topic idea.",
    },
    {
      id: 'partner_sponsor',
      keywords: ['become a partner', 'sponsor', 'sponsorship', 'partnership', 'book a booth'],
      question: 'How can I become a partner or sponsor?',
      answer:
        "All information about partnership and sponsorship packages is on the \"Partners\" and \"Sponsor/Donate\" pages of the site. You can also contact us directly via the \"Contact\" page.",
    },
    {
      id: 'membership',
      keywords: ['membership', 'become a member', 'join the association'],
      question: 'How do I become a member of the association?',
      answer:
        "Membership details are explained on the \"Membership\" page of the site, where you can fill out a form to join the Level Up in Germany association.",
    },
    {
      id: 'contact',
      keywords: ['contact', 'reach organizers', 'another question', 'talk to someone'],
      question: 'How can I contact the organizers?',
      answer:
        "You can write to info@levelupingermany.com or use the form on the \"Contact\" page of the site — the team will get back to you as soon as possible.",
    },
  ],
  de: [
    {
      id: 'tickets_difference',
      keywords: ['unterschied ticket', 'drei tickets', 'career lounge', 'business investment', 'healthcare excellence', 'welches ticket'],
      question: 'Was ist der Unterschied zwischen den drei Tickets?',
      answer:
        "Alle drei Tickets (Career Lounge, Business & Investment, Healthcare Excellence) bieten Zugang zum gesamten Level-Up-Tag: Keynotes, große Panels, Networking und gemeinsame Vorträge. Der einzige Unterschied ist der Deep Dive, ein 2,5-stündiger Workshop je nach Ticket: Career Lounge (Branding, Beschäftigungsfähigkeit, Rekrutierung, Soft Skills), Business & Investment (Immobilien, Börse/ETFs, E-Commerce, Vermögensverwaltung), Healthcare Excellence (Karrieremöglichkeiten im Gesundheitswesen).",
    },
    {
      id: 'ticket_choice',
      keywords: ['welches ticket waehlen', 'unsicher welches ticket', 'welches nehmen'],
      question: 'Welches Ticket soll ich wählen, wenn ich unsicher bin?',
      answer:
        "Fragen Sie sich: Welcher Bereich wird heute den größten Einfluss auf meine Zukunft haben — Karriere, Business/Investment oder Gesundheit? Wählen Sie dann das Ticket/den Track, der zu diesem Ziel passt.",
    },
    {
      id: 'deep_dive_switch',
      keywords: ['track wechseln', 'deep dive wechseln'],
      question: 'Kann ich während der Deep Dives den Track wechseln?',
      answer:
        "Nein, die drei Deep Dives finden gleichzeitig in drei verschiedenen Räumen statt und dauern jeweils 2,5 Stunden. Jede:r Teilnehmer:in folgt dem Track, der zum eigenen Ticket gehört, um Qualität und Raumkapazität zu gewährleisten.",
    },
    {
      id: 'meet_speakers',
      keywords: ['sprecher treffen', 'mit sprechern sprechen', 'networking mit sprechern'],
      question: 'Werde ich die Sprecher:innen treffen können?',
      answer:
        "Ja! Über den ganzen Tag verteilt gibt es mehrere Networking-Momente, bei denen Sie mit Sprecher:innen, Partnern und anderen Teilnehmer:innen ins Gespräch kommen können.",
    },
    {
      id: 'arrival_time',
      keywords: ['wann ankommen', 'ankunftszeit'],
      question: 'Wann sollte ich ankommen?',
      answer:
        "Wir empfehlen, 30 bis 45 Minuten vor Beginn der Veranstaltung anzukommen, um sich in Ruhe einzuchecken, die Partnerbereiche zu entdecken und das Networking vor der offiziellen Eröffnung zu genießen.",
    },
    {
      id: 'parking',
      keywords: ['parken', 'parkplatz', 'auto abstellen'],
      question: 'Wo kann ich parken?',
      answer:
        "Der offizielle Parkplatz am The Squaire steht vor Ort zur Verfügung. Günstigere Alternativen gibt es in der Nähe (Gateway Gardens Parking, Gateway Gardens Plaza Parking, P+R Frankfurt Stadion, Park & Ride Flughafenstraße) — suchen Sie sie auf Google Maps.",
    },
    {
      id: 'venue',
      keywords: ['veranstaltungsort', 'adresse', 'the squaire', 'wo findet statt', 'frankfurt'],
      question: 'Wo findet die Veranstaltung statt?',
      answer:
        "Level Up in Germany findet in Frankfurt am Main statt, im The Squaire (nahe dem Frankfurter Flughafen). Die genaue Adresse und Raumdetails werden bei der Anmeldung mitgeteilt.",
    },
    {
      id: 'buy_ticket',
      keywords: ['ticket kaufen', 'ticketpreis', 'wie viel kostet', 'platz buchen', 'wo kaufen'],
      question: 'Wie und wo kaufe ich mein Ticket?',
      answer:
        "Sie können Ihr Ticket direkt auf der Seite \"Buy Ticket\" buchen. Preise und Verfügbarkeit (Early Bird usw.) werden dort in Echtzeit aktualisiert, daher kann ich hier keine genauen Zahlen nennen.",
    },
    {
      id: 'programme',
      keywords: ['programm', 'zeitplan', 'tagesablauf', 'agenda'],
      question: 'Wo finde ich das Tagesprogramm?',
      answer:
        "Das detaillierte Programm (Keynotes, Panels, Deep Dives, Networking) ist auf der Seite \"Programme\" verfügbar und kann sich bis zur Veranstaltung noch ändern.",
    },
    {
      id: 'community_whatsapp',
      keywords: ['whatsapp', 'community', 'gruppe beitreten', 'whatsapp gruppe'],
      question: 'Wie trete ich der Level Up in Germany Community bei?',
      answer:
        "Sie können unserer WhatsApp-Community über den Button \"Join\" im Menü der Website beitreten, um Neuigkeiten zu erhalten und sich mit anderen Mitgliedern auszutauschen.",
    },
    {
      id: 'speaker_apply',
      keywords: ['sprecher werden', 'als sprecher bewerben', 'vortrag vorschlagen', 'workshop leiten'],
      question: 'Wie kann ich Sprecher:in werden?',
      answer:
        "Um einen Vortrag vorzuschlagen oder sich als Sprecher:in zu bewerben, kontaktieren Sie am besten das Team über das Formular auf der Seite \"Contact\" oder per E-Mail an info@levelupingermany.com, mit Angabe Ihres Fachgebiets und Themenvorschlags.",
    },
    {
      id: 'partner_sponsor',
      keywords: ['partner werden', 'sponsor', 'sponsoring', 'partnerschaft', 'stand buchen'],
      question: 'Wie kann ich Partner oder Sponsor werden?',
      answer:
        "Alle Informationen zu Partnerschafts- und Sponsoring-Paketen finden Sie auf den Seiten \"Partners\" und \"Sponsor/Donate\". Sie können uns auch direkt über die Seite \"Contact\" kontaktieren.",
    },
    {
      id: 'membership',
      keywords: ['mitgliedschaft', 'mitglied werden', 'verein beitreten'],
      question: 'Wie werde ich Mitglied des Vereins?',
      answer:
        "Die Details zur Mitgliedschaft finden Sie auf der Seite \"Membership\", wo Sie ein Formular ausfüllen können, um dem Verein Level Up in Germany beizutreten.",
    },
    {
      id: 'contact',
      keywords: ['kontakt', 'organisatoren erreichen', 'andere frage', 'jemanden sprechen'],
      question: 'Wie kann ich die Organisator:innen kontaktieren?',
      answer:
        "Sie können an info@levelupingermany.com schreiben oder das Formular auf der Seite \"Contact\" nutzen — das Team antwortet Ihnen so schnell wie möglich.",
    },
  ],
};
