'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';

// ── Données FAQ ─────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const PARKINGS: { name: string; url: string }[] = [
  {
    name: 'Gateway Gardens Parking',
    url: 'https://www.google.com/maps/search/?api=1&query=Gateway+Gardens+Parking+Frankfurt',
  },
  {
    name: 'Gateway Gardens Plaza Parking',
    url: 'https://www.google.com/maps/search/?api=1&query=Gateway+Gardens+Plaza+Parking+Frankfurt',
  },
  {
    name: 'P+R Frankfurt Stadion',
    url: 'https://www.google.com/maps/search/?api=1&query=P%2BR+Frankfurt+Stadion',
  },
  {
    name: 'Park & Ride Flughafenstraße',
    url: 'https://www.google.com/maps/search/?api=1&query=Park+%26+Ride+Flughafenstra%C3%9Fe+Frankfurt',
  },
];

const SECTION_TEXT: Record<Locale, { eyebrow: string; title: string; subtitle: string }> = {
  fr: {
    eyebrow: 'Questions fréquentes',
    title: 'FAQ',
    subtitle: 'Tout ce que vous devez savoir avant de réserver votre place.',
  },
  en: {
    eyebrow: 'Frequently asked questions',
    title: 'FAQ',
    subtitle: 'Everything you need to know before booking your spot.',
  },
  de: {
    eyebrow: 'Häufige Fragen',
    title: 'FAQ',
    subtitle: 'Alles, was du vor der Buchung deines Platzes wissen musst.',
  },
};

const FAQ_ITEMS: Record<Locale, FaqItem[]> = {
  fr: [
    {
      question: 'Quelle est la différence entre les trois billets ?',
      answer: (
        <div className="space-y-4">
          <p>
            Les trois billets donnent accès à toute la journée <strong>Level Up</strong> : keynotes,
            grands panels, networking et conférences communes. La seule différence concerne le{' '}
            <strong>Deep Dive</strong>, où chaque participant rejoint un parcours spécialisé selon son
            billet.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">💼 Career Lounge</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Branding professionnel</li>
                <li>Employabilité</li>
                <li>Recrutement</li>
                <li>Soft Skills</li>
                <li>Travailler et étudier autrement</li>
                <li>Trouver un Werkstudent</li>
                <li>Évolution vers des postes à responsabilité</li>
              </ul>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">💰 Business &amp; Investment</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Investissement immobilier</li>
                <li>Marchés financiers (ETF &amp; Bourse)</li>
                <li>E-commerce</li>
                <li>Gestion de patrimoine</li>
              </ul>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">🩺 Healthcare Excellence</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Opportunités professionnelles</li>
                <li>Débouchés de la formation</li>
                <li>Évolution de carrière</li>
                <li>Entrepreneuriat dans la santé</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      question: "Quel billet choisir si j'hésite ?",
      answer: (
        <div className="space-y-3">
          <p>Posez-vous simplement cette question :</p>
          <p className="font-semibold text-neutral-900">
            Quel est aujourd&apos;hui le domaine qui aura le plus d&apos;impact sur mon avenir ?
          </p>
          <p>Choisissez ensuite le parcours qui répond le mieux à votre objectif.</p>
        </div>
      ),
    },
    {
      question: 'Puis-je changer de parcours pendant les Deep Dives ?',
      answer: (
        <div className="space-y-3">
          <p>
            Les trois Deep Dives se déroulent simultanément dans trois salles différentes et durent{' '}
            <strong>2h30</strong>. Pour garantir une expérience de qualité et respecter la capacité de
            chaque salle, chaque participant suit le parcours correspondant à son billet.
          </p>
          <p>
            Nous vous recommandons donc de choisir le parcours qui correspond le mieux à votre
            objectif principal.
          </p>
        </div>
      ),
    },
    {
      question: 'Pourrai-je rencontrer les intervenants ?',
      answer: (
        <div className="space-y-3">
          <p>Oui.</p>
          <p>
            Plusieurs moments de networking sont prévus tout au long de la journée afin de permettre
            aux participants d&apos;échanger avec les intervenants, les partenaires et les autres
            participants.
          </p>
        </div>
      ),
    },
    {
      question: 'À quelle heure dois-je arriver ?',
      answer: (
        <p>
          Nous vous recommandons d&apos;arriver <strong>30 à 45 minutes avant le début de
          l&apos;événement</strong> afin de vous enregistrer sereinement, découvrir les espaces
          partenaires et profiter pleinement du networking avant l&apos;ouverture officielle.
        </p>
      ),
    },
    {
      question: 'Où puis-je me garer à moindre coût ?',
      answer: (
        <div className="space-y-3">
          <p>
            Le parking officiel du <strong>The Squaire</strong> est disponible, mais d&apos;autres
            alternatives plus économiques existent à proximité. Vous pouvez notamment consulter :
          </p>
          <ul className="space-y-1.5">
            {PARKINGS.map((p) => (
              <li key={p.name}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-primary underline decoration-primary/30 underline-offset-2 transition hover:decoration-primary"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
  ],
  en: [
    {
      question: 'What is the difference between the three tickets?',
      answer: (
        <div className="space-y-4">
          <p>
            All three tickets give access to the entire <strong>Level Up</strong> day: keynotes,
            main panels, networking and shared conferences. The only difference is the{' '}
            <strong>Deep Dive</strong>, where each attendee joins a specialised track based on their
            ticket.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">💼 Career Lounge</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Professional branding</li>
                <li>Employability</li>
                <li>Recruitment</li>
                <li>Soft skills</li>
                <li>Working and studying differently</li>
                <li>Finding a Werkstudent position</li>
                <li>Moving into leadership roles</li>
              </ul>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">💰 Business &amp; Investment</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Real estate investment</li>
                <li>Financial markets (ETFs &amp; stock market)</li>
                <li>E-commerce</li>
                <li>Wealth management</li>
              </ul>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">🩺 Healthcare Excellence</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Professional opportunities</li>
                <li>Career paths after training</li>
                <li>Career growth</li>
                <li>Entrepreneurship in healthcare</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      question: "Which ticket should I choose if I'm not sure?",
      answer: (
        <div className="space-y-3">
          <p>Simply ask yourself this question:</p>
          <p className="font-semibold text-neutral-900">
            Which area will have the biggest impact on my future today?
          </p>
          <p>Then choose the track that best matches your goal.</p>
        </div>
      ),
    },
    {
      question: 'Can I switch tracks during the Deep Dives?',
      answer: (
        <div className="space-y-3">
          <p>
            The three Deep Dives run at the same time in three different rooms and last{' '}
            <strong>2.5 hours</strong>. To ensure a quality experience and respect each room&apos;s
            capacity, each attendee follows the track that matches their ticket.
          </p>
          <p>
            We therefore recommend choosing the track that best matches your main goal from the
            start.
          </p>
        </div>
      ),
    },
    {
      question: 'Will I be able to meet the speakers?',
      answer: (
        <div className="space-y-3">
          <p>Yes.</p>
          <p>
            Several networking moments are planned throughout the day, giving attendees the chance
            to talk with speakers, partners and other participants.
          </p>
        </div>
      ),
    },
    {
      question: 'What time should I arrive?',
      answer: (
        <p>
          We recommend arriving <strong>30 to 45 minutes before the event starts</strong> so you can
          check in calmly, explore the partner areas and make the most of networking before the
          official opening.
        </p>
      ),
    },
    {
      question: 'Where can I find cheaper parking?',
      answer: (
        <div className="space-y-3">
          <p>
            The official <strong>The Squaire</strong> parking is available, but cheaper alternatives
            exist nearby. You can check out:
          </p>
          <ul className="space-y-1.5">
            {PARKINGS.map((p) => (
              <li key={p.name}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-primary underline decoration-primary/30 underline-offset-2 transition hover:decoration-primary"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
  ],
  de: [
    {
      question: 'Was ist der Unterschied zwischen den drei Tickets?',
      answer: (
        <div className="space-y-4">
          <p>
            Alle drei Tickets bieten Zugang zum gesamten <strong>Level Up</strong>-Tag: Keynotes,
            große Panels, Networking und gemeinsame Vorträge. Der einzige Unterschied betrifft den{' '}
            <strong>Deep Dive</strong>, bei dem jede:r Teilnehmer:in je nach Ticket einen
            spezialisierten Track besucht.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">💼 Career Lounge</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Professionelles Branding</li>
                <li>Beschäftigungsfähigkeit</li>
                <li>Rekrutierung</li>
                <li>Soft Skills</li>
                <li>Anders arbeiten und studieren</li>
                <li>Eine Werkstudentenstelle finden</li>
                <li>Aufstieg in verantwortungsvolle Positionen</li>
              </ul>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">💰 Business &amp; Investment</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Immobilieninvestition</li>
                <li>Finanzmärkte (ETFs &amp; Börse)</li>
                <li>E-Commerce</li>
                <li>Vermögensverwaltung</li>
              </ul>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <p className="mb-2 font-semibold text-neutral-900">🩺 Healthcare Excellence</p>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>Berufliche Möglichkeiten</li>
                <li>Perspektiven nach der Ausbildung</li>
                <li>Karriereentwicklung</li>
                <li>Unternehmertum im Gesundheitswesen</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      question: 'Welches Ticket soll ich wählen, wenn ich unsicher bin?',
      answer: (
        <div className="space-y-3">
          <p>Stellen Sie sich einfach diese Frage:</p>
          <p className="font-semibold text-neutral-900">
            Welcher Bereich wird heute den größten Einfluss auf meine Zukunft haben?
          </p>
          <p>Wählen Sie dann den Track, der am besten zu Ihrem Ziel passt.</p>
        </div>
      ),
    },
    {
      question: 'Kann ich während der Deep Dives den Track wechseln?',
      answer: (
        <div className="space-y-3">
          <p>
            Die drei Deep Dives finden gleichzeitig in drei verschiedenen Räumen statt und dauern{' '}
            <strong>2,5 Stunden</strong>. Um eine hochwertige Erfahrung zu gewährleisten und die
            Kapazität jedes Raums einzuhalten, folgt jede:r Teilnehmer:in dem Track, der zu ihrem/seinem
            Ticket gehört.
          </p>
          <p>
            Wir empfehlen daher, von Anfang an den Track zu wählen, der am besten zu Ihrem
            Hauptziel passt.
          </p>
        </div>
      ),
    },
    {
      question: 'Werde ich die Sprecher:innen treffen können?',
      answer: (
        <div className="space-y-3">
          <p>Ja.</p>
          <p>
            Über den ganzen Tag verteilt gibt es mehrere Networking-Momente, bei denen Teilnehmer:innen
            mit Sprecher:innen, Partnern und anderen Teilnehmer:innen ins Gespräch kommen können.
          </p>
        </div>
      ),
    },
    {
      question: 'Wann sollte ich ankommen?',
      answer: (
        <p>
          Wir empfehlen, <strong>30 bis 45 Minuten vor Beginn der Veranstaltung</strong> anzukommen,
          um sich in Ruhe einzuchecken, die Partnerbereiche zu entdecken und das Networking vor der
          offiziellen Eröffnung voll auszukosten.
        </p>
      ),
    },
    {
      question: 'Wo kann ich günstiger parken?',
      answer: (
        <div className="space-y-3">
          <p>
            Der offizielle Parkplatz am <strong>The Squaire</strong> steht zur Verfügung, es gibt aber
            günstigere Alternativen in der Nähe. Schauen Sie sich zum Beispiel an:
          </p>
          <ul className="space-y-1.5">
            {PARKINGS.map((p) => (
              <li key={p.name}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-primary underline decoration-primary/30 underline-offset-2 transition hover:decoration-primary"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
  ],
};

// ── Composant ───────────────────────────────────────────────────────────────────

export function TicketingFAQ({ locale = 'fr' }: { locale?: Locale }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = SECTION_TEXT[locale];
  const items = FAQ_ITEMS[locale];

  return (
    <section className="relative z-10 px-5 pb-20 pt-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-accent">
            {t.eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold uppercase text-neutral-900 sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-3 text-base text-neutral-500">
            {t.subtitle}
          </p>
        </div>

        <div className="rounded-3xl border border-black/[0.06] bg-neutral-50/80 p-2 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.35)] sm:p-3">
          <ul className="space-y-2">
            {items.map((item, i) => {
              const isOpen = openIndex === i;
              const panelId = `faq-panel-${i}`;
              const btnId = `faq-btn-${i}`;
              return (
                <li
                  key={i}
                  className={`overflow-hidden rounded-2xl border transition-colors ${
                    isOpen ? 'border-primary/20 bg-white shadow-sm' : 'border-transparent bg-white/60'
                  }`}
                >
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                    >
                      <span className={`text-base font-semibold sm:text-lg ${isOpen ? 'text-primary' : 'text-neutral-900'}`}>
                        {item.question}
                      </span>
                      <span
                        aria-hidden
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                          isOpen ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {/* barre horizontale (toujours visible) */}
                        <span className="absolute h-0.5 w-3.5 rounded-full bg-current" />
                        {/* barre verticale (disparaît quand ouvert -> "-") */}
                        <span
                          className={`absolute h-3.5 w-0.5 rounded-full bg-current transition-transform duration-300 ${
                            isOpen ? 'scale-y-0' : 'scale-y-100'
                          }`}
                        />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className="grid transition-all duration-[350ms] ease-in-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 text-sm leading-relaxed text-neutral-600 sm:px-6 sm:pb-6 sm:text-[0.95rem]">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

