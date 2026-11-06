import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { Form } from '@/components/Form';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { SponsorshipBrochureButton } from '@/components/SponsorshipBrochureButton';
import { generateMetadataForPath } from '@/lib/seo';
import { getFeaturedSponsorPdfUrl } from '@/lib/sponsorDocuments';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/sponsor-donate');
}

const journey = [
  { year: '2025', title: 'Where it all began', image: '/sponsorship/hero-community.jpg', items: [{ value: '130', label: 'Participants', body: 'Professionals, students, entrepreneurs and ambitious individuals brought together around a shared vision.' }, { value: '8', label: 'Countries represented', body: 'Cameroon, Côte d’Ivoire, Senegal, Togo, Benin, Belgium, Switzerland and France.' }, { value: '15', label: 'Speakers', body: 'Professionals and experts sharing practical insight, experience and perspective.' }] },
  { year: '2026', title: 'A new level of experience', image: '/sponsorship/2026-community-audience.jpg', items: [{ value: '250', label: 'Participants', body: 'A larger international audience of professionals, students, entrepreneurs and emerging leaders.' }, { value: '18', label: 'Speakers', body: 'An expanded network of experts, professionals and industry voices.' }, { value: '1', label: 'Main plenary', body: 'A central space for keynotes, discussions, leadership perspectives and shared experiences.' }, { value: '3', label: 'Specialized tracks', body: 'Career & Professional Development, Business & Investment, and Healthcare & Professional Opportunities.' }] },
  { year: 'Next', title: 'More ways to connect', image: '/sponsorship/formats-immersion.jpg', items: [{ value: 'Tour', label: 'Business Tour', body: 'Meet founders and explore the decisions and strategies behind building businesses.' }, { value: 'Tour', label: 'Career Tour', body: 'Explore professional journeys, companies, career paths and actionable insights.' }, { value: '+', label: 'New formats', body: 'Masterclasses, expert discussions, networking experiences and digital education.' }] },
];

const benefits = [
  ['01', 'Access to talent', 'Connect with the people shaping tomorrow.', 'Engage with ambitious professionals, entrepreneurs, researchers, students, innovators and emerging leaders across Europe.'],
  ['02', 'Employer branding', 'Position your company as an employer of choice.', 'Showcase your culture, career opportunities, workplace values and commitment to diversity through meaningful interactions.'],
  ['03', 'Brand visibility', 'Build visibility beyond the event.', 'Integrate your brand into the ecosystem before, during and after our events through campaigns, content, acknowledgements and on-site presence, depending on the selected partnership format.'],
  ['04', 'Community impact', 'Invest in opportunity. Create lasting impact.', 'Support international talent navigating careers, entrepreneurship, integration, education and professional development.'],
  ['05', 'Thought leadership', 'Put your expertise in the conversation.', 'Bring your experts into talks, panels, workshops, interviews, mentoring and career-focused discussions, subject to agreement.'],
] as const;

const opportunities = [
  ['Corporate sponsorship', 'Support our events and initiatives while creating relevant brand visibility and engagement opportunities.'],
  ['Talent & recruitment partnerships', 'Build relationships with ambitious professionals, graduates and emerging talent.'],
  ['Knowledge & expertise partnerships', 'Contribute expertise through masterclasses, panels, talks and mentoring initiatives.'],
  ['Community & strategic partnerships', 'Collaborate on projects that create sustained value for the community.'],
  ['Media & visibility partnerships', 'Work together on content, interviews, campaigns and digital storytelling.'],
] as const;

const expertise = ['Technology', 'Engineering', 'Finance', 'Mobility', 'Entrepreneurship', 'Healthcare'];

function Arrow() {
  return <span aria-hidden className="text-accent">↗</span>;
}

export default async function SponsorDonatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const base = `/${loc}`;
  const brochureHref = await getFeaturedSponsorPdfUrl();

  return (
    <main className="bg-[#100908] text-white">
      <section className="relative isolate min-h-[min(800px,92vh)] overflow-hidden">
        <Image src="/sponsorship/hero-community.jpg" alt="Level Up in Germany community gathered at a professional event" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,5,5,.94)_0%,rgba(8,5,5,.72)_42%,rgba(8,5,5,.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#100908] to-transparent" />
        <div className="relative mx-auto flex min-h-[min(800px,92vh)] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-8 sm:pb-24 lg:px-12">
          <RevealOnScroll>
            <div className="max-w-3xl">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[.32em] text-accent">Level Up in Germany · Partnerships</p>
              <h1 className="font-display text-5xl font-semibold leading-[.98] tracking-tight sm:text-7xl lg:text-[6.4rem]">Partner with the next generation of talent, leadership & opportunity.</h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">Level Up in Germany connects ambitious professionals, entrepreneurs, researchers, students and emerging leaders across Europe. Partner with a growing platform where talent, ideas and opportunities come together.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#contact" className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-[#1b0c05] transition hover:bg-[#f4a52e]">Become a partner <Arrow /></a>
                <a href="#impact" className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">Explore our impact <Arrow /></a>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section id="impact" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <RevealOnScroll>
          <p className="text-xs font-bold uppercase tracking-[.3em] text-accent">01 · The journey</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-6xl">Our journey. Our growth. Our impact.</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">What started as a bold idea in 2025 is evolving into a dynamic platform connecting talent, expertise, business and opportunity across Europe.</p>
        </RevealOnScroll>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {journey.map((phase, index) => (
            <RevealOnScroll key={phase.year} delayMs={index * 80}>
              <article className="group overflow-hidden border border-white/10 bg-white/[.035]">
                <div className="relative aspect-[1.25] overflow-hidden"><Image src={phase.image} alt={phase.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#100908] via-transparent to-transparent" /><span className="absolute bottom-4 left-5 font-display text-5xl font-semibold text-white">{phase.year}</span></div>
                <div className="p-5 sm:p-6"><h3 className="text-xl font-semibold">{phase.title}</h3><div className="mt-5 divide-y divide-white/10">{phase.items.map((item) => <div key={item.label} className="grid grid-cols-[auto_1fr] gap-4 py-4 first:pt-0 last:pb-0"><strong className="font-display text-3xl text-accent">{item.value}</strong><div><p className="text-sm font-semibold">{item.label}</p><p className="mt-1 text-xs leading-relaxed text-white/55">{item.body}</p></div></div>)}</div></div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="bg-[#f3eee8] text-[#1d1714]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <RevealOnScroll><p className="text-xs font-bold uppercase tracking-[.3em] text-primary">02 · The opportunity</p><h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-6xl">Why partner with Level Up?</h2><p className="mt-5 max-w-2xl text-base leading-relaxed text-black/60 sm:text-lg">More than event sponsorship. A strategic opportunity to connect your brand with an ambitious international community.</p></RevealOnScroll>
          <div className="mt-14 grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-2 lg:grid-cols-3">{benefits.map(([number, eyebrow, title, body], index) => <RevealOnScroll key={number} delayMs={index * 50}><article className="min-h-[255px] bg-[#f3eee8] p-6 sm:p-8"><span className="font-display text-4xl text-accent">{number}</span><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</p><h3 className="mt-3 text-2xl font-semibold leading-tight">{title}</h3><p className="mt-3 text-sm leading-relaxed text-black/60">{body}</p></article></RevealOnScroll>)}</div>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-black/15 pt-8"><div><strong className="font-display text-6xl font-semibold text-primary">6.7K+</strong><p className="mt-1 text-sm font-semibold">Combined social media following</p></div><p className="max-w-md text-sm leading-relaxed text-black/60">An expanding community across our digital platforms, creating opportunities for partner visibility, storytelling and engagement. Combined total, not verified unique reach.</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><RevealOnScroll><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">03 · The community</p><h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">A growing community. Real connections.</h2><p className="mt-5 max-w-md text-base leading-relaxed text-white/60">The numbers are a snapshot of the community we are building, grounded in the 2025 edition and the confirmed 2026 programme. Our events are typically sold out up to three weeks before the event date, a strong signal of an engaged community and genuine demand.</p></RevealOnScroll><div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">{[['130 → 250', 'participants, 2025 to 2026'], ['8+', 'countries represented across both editions'], ['15 → 18', 'speakers, 2025 to 2026'], ['6.7K+', 'combined social following'], ['3', 'specialized 2026 tracks']].map(([value, label]) => <div key={label} className="border-t border-white/20 pt-4"><strong className="font-display text-4xl font-semibold text-accent sm:text-5xl">{value}</strong><p className="mt-2 text-sm text-white/65">{label}</p></div>)}</div></div>
      </section>

      <section className="bg-[#18100d]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12"><div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20"><RevealOnScroll><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">04 · Speaker ecosystems</p><h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">Professional expertise from leading ecosystems.</h2><p className="mt-5 max-w-md text-base leading-relaxed text-white/60">Our speakers bring perspectives from technology, engineering, finance, mobility, entrepreneurship, healthcare and beyond.</p></RevealOnScroll><RevealOnScroll delayMs={100}><div><p className="mb-5 text-xs uppercase tracking-[.18em] text-white/45">Areas represented through our speakers’ professional experience</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{expertise.map((item) => <div key={item} className="border border-white/10 bg-white/[.03] p-5 text-lg font-semibold">{item}</div>)}</div><p className="mt-5 text-xs leading-relaxed text-white/40">Speaker affiliations are presented as professional experience and do not imply sponsorship, endorsement or institutional support.</p></div></RevealOnScroll></div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12"><RevealOnScroll><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">05 · Partnership formats</p><h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-6xl">Let’s build meaningful partnerships.</h2><p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60">We are open to flexible collaboration formats shaped around your objectives and our community’s needs.</p></RevealOnScroll><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{opportunities.map(([title, body], index) => <RevealOnScroll key={title} delayMs={index * 50}><article className="border border-white/10 p-6 transition hover:border-accent/60 hover:bg-white/[.035]"><span className="text-sm text-accent">0{index + 1}</span><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-white/55">{body}</p></article></RevealOnScroll>)}</div></section>

      <section className="bg-[#f3eee8] text-[#1d1714]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-12"><RevealOnScroll><p className="text-xs font-bold uppercase tracking-[.3em] text-primary">06 · The partnership brochure</p><h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">Discover what we can build together.</h2><p className="mt-5 max-w-lg text-base leading-relaxed text-black/60">Explore partnership opportunities and discover how your organization can become part of the Level Up in Germany ecosystem.</p><SponsorshipBrochureButton href={brochureHref} className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a72525]">Download sponsorship brochure <Arrow /></SponsorshipBrochureButton></RevealOnScroll><RevealOnScroll delayMs={100}><div className="relative mx-auto aspect-[4/5] w-full max-w-sm rotate-2 overflow-hidden bg-[#24110d] shadow-2xl"><Image src="/sponsorship/business-exchange.jpg" alt="Professionals exchanging ideas at a Level Up in Germany event" fill sizes="(max-width: 1024px) 80vw, 360px" className="object-cover opacity-65" /><div className="absolute inset-0 bg-gradient-to-t from-[#24110d] via-transparent to-transparent" /><div className="absolute inset-x-7 bottom-7"><p className="text-xs uppercase tracking-[.25em] text-accent">Level Up in Germany</p><p className="mt-3 font-display text-4xl font-semibold text-white">Partnership<br />opportunities</p><p className="mt-10 text-xs text-white/60">Latest active edition · PDF</p></div></div></RevealOnScroll></div></section>

      <section id="contact" className="bg-white text-[#1d1714]"><div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.8fr_1.2fr] lg:px-12"><RevealOnScroll><p className="text-xs font-bold uppercase tracking-[.3em] text-primary">07 · Start a conversation</p><h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">Your brand. Our community. Greater impact.</h2><p className="mt-5 max-w-md text-base leading-relaxed text-black/60">Let’s connect your organization with ambitious talent, new perspectives and meaningful opportunities across Europe.</p><div className="mt-8 flex flex-wrap gap-3"><SponsorshipBrochureButton href={brochureHref} className="rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white">Download partnership brochure</SponsorshipBrochureButton><Link href={`/${loc}/partners`} className="rounded-full border border-black/15 px-5 py-3 text-sm font-semibold text-black/70 transition hover:border-primary hover:text-primary">Meet our partners</Link></div></RevealOnScroll><RevealOnScroll delayMs={100}><div><h3 className="mb-6 text-xl font-semibold">Tell us what you would like to build.</h3><Form locale={loc} formType="sponsor-inquiry" fields={[{ name: 'name', type: 'text', label: 'Name', required: true }, { name: 'organization', type: 'text', label: 'Organization', required: true }, { name: 'email', type: 'email', label: 'Email', required: true }, { name: 'message', type: 'textarea', label: 'Message', required: true }]} submitLabel="Start the conversation" consentLabel="I agree to the processing of my data according to the" consentLinkHref={`${base}/privacy`} consentLinkText="Privacy Policy" sendingLabel="Sending…" successMessage="Thank you. We will be in touch soon." errorMessage="Something went wrong. Please try again." /></div></RevealOnScroll></div></section>

      <section className="bg-[#100908]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">Ready when you are</p><h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Let’s make the next level possible.</h2></div><div className="flex items-center gap-5"><div className="relative hidden h-24 w-36 overflow-hidden sm:block"><Image src="/sponsorship/closing-community.jpg" alt="Level Up in Germany community connecting at an event" fill sizes="144px" className="object-cover" /></div><a href="#contact" className="inline-flex w-fit rounded-full bg-accent px-6 py-3 text-sm font-bold text-[#1b0c05]">Become a sponsor <Arrow /></a></div></div></section>
    </main>
  );
}
