import Image from 'next/image';
import Link from 'next/link';
import { Lora, Poppins } from 'next/font/google';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';
import { prisma } from '@/lib/prisma';
import { localizeSocialLink, seedSocialLinksIfEmpty } from '@/lib/socialLinks';
import { getEmailSocialLinks } from '@/lib/emailSocialLinks';
import { SITE_CONTACT } from '@/config/siteContact';
import { LinksCopyButton } from '@/components/LinksCopyButton';
import { LinksContactActions } from '@/components/LinksContactActions';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--links-font' });
const lora = Lora({ subsets: ['latin'], style: ['italic'], weight: ['500'], variable: '--links-display-font' });

const copy = {
  fr: { home: 'Accueil Level Up in Germany', welcome: 'Bienvenue', tagline: 'Tout notre univers, en un seul endroit', seeAll: 'Tout voir', episode: 'Épisode', new: 'Nouveau', events: 'Événements', discover: 'Découvrir', partner: 'Partenaire', lemfiTitle: 'Télécharge LemFi', lemfiSub: 'Avec notre code promo', copy: 'Copier le code', copied: 'Copié', talk: 'Parlons directement', whatsapp: 'WhatsApp', email: 'E-mail', copyPhone: 'Copier le numéro', copyEmail: 'Copier l’adresse', legal: 'Mentions légales', privacy: 'Confidentialité', empty: 'Aucun lien à afficher.' },
  de: { home: 'Startseite Level Up in Germany', welcome: 'Willkommen', tagline: 'Unser ganzes Universum an einem Ort', seeAll: 'Alle ansehen', episode: 'Folge', new: 'Neu', events: 'Veranstaltungen', discover: 'Entdecken', partner: 'Partner', lemfiTitle: 'Lade LemFi herunter', lemfiSub: 'Mit unserem Promo-Code', copy: 'Code kopieren', copied: 'Kopiert', talk: 'Schreib uns direkt', whatsapp: 'WhatsApp', email: 'E-Mail', copyPhone: 'Nummer kopieren', copyEmail: 'E-Mail kopieren', legal: 'Impressum', privacy: 'Datenschutz', empty: 'Keine Links verfügbar.' },
  en: { home: 'Level Up in Germany home', welcome: 'Welcome', tagline: 'Our whole universe, in one place', seeAll: 'See all', episode: 'Episode', new: 'New', events: 'Events', discover: 'Discover', partner: 'Partner', lemfiTitle: 'Download LemFi', lemfiSub: 'With our promo code', copy: 'Copy code', copied: 'Copied', talk: 'Talk to us directly', whatsapp: 'WhatsApp', email: 'Email', copyPhone: 'Copy number', copyEmail: 'Copy email', legal: 'Legal notice', privacy: 'Privacy', empty: 'No links available.' },
} as const;

type LinkRecord = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  coverImageUrl: string | null;
  episodeNumber: number | null;
  badge: string | null;
  isActive: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isDiscoverable: boolean;
  sortOrder: number;
  createdAt: Date;
  category: { id: string; name: string; sortOrder: number } | null;
  translations: Array<{ locale: string; title: string; description: string | null }>;
};

function normalized(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeLinkUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^(?:https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function categoryIs(link: LinkRecord, keyword: string) {
  return normalized(link.category?.name ?? '').includes(keyword);
}

const SOCIAL_PLATFORMS = ['TikTok', 'Instagram', 'LinkedIn', 'Facebook', 'YouTube'] as const;
type FeaturedSocial = { id: string; platform: (typeof SOCIAL_PLATFORMS)[number]; title: string; url: string };

function matchesSocialPlatform(link: LinkRecord, platform: string) {
  const key = normalized(`${link.title} ${link.url}`);
  const name = normalized(platform);
  if (name === 'facebook') return key.includes('facebook') || key.includes('fb');
  if (name === 'youtube') return key.includes('youtube') || key.includes('youtu');
  return key.includes(name);
}

function Icon({ kind }: { kind: 'home' | 'play' | 'chevron' | 'whatsapp' | 'mail' | 'social' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'home') return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M10 20v-6h4v6" /></svg>;
  if (kind === 'play') return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="m9 6 10 6-10 6V6Z" /></svg>;
  if (kind === 'chevron') return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="m9 5 7 7-7 7" /></svg>;
  if (kind === 'mail') return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
  if (kind === 'whatsapp') return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M20 4a11 11 0 0 0-17 13L2 22l5-1a11 11 0 0 0 13-17Z" /><path d="M8 8c.3 2 2 4 4 5 .6.3 1 .2 1.3-.2l.6-.8c.2-.3.4-.3.7-.2l2 .9" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><circle cx="12" cy="12" r="8" /><path d="M8 12h8M12 8v8" /></svg>;
}

function SocialIcon({ platform }: { platform: (typeof SOCIAL_PLATFORMS)[number] }) {
  const key = normalized(platform);
  if (key.includes('youtube')) return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="6" width="18" height="12" rx="4" /><path fill="currentColor" stroke="none" d="m10 9 5 3-5 3V9Z" /></svg>;
  if (key.includes('linkedin')) return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 9v9M6 6v.1M10 18v-5a3 3 0 0 1 6 0v5M10 9v9" /><circle cx="6" cy="6" r=".8" fill="currentColor" /></svg>;
  if (key.includes('instagram')) return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" /></svg>;
  if (key.includes('facebook')) return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 20v-8h2.5l.5-3H14V7.2c0-1 .4-1.7 1.8-1.7H17V2.8c-.5-.1-1.2-.2-2.1-.2-2.7 0-4.4 1.7-4.4 4.5V9H8v3h2.5v8" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 4c.2 3 1.8 5 5 5v3c-1.8 0-3.5-.6-5-1.6V16a5 5 0 1 1-3.8-4.8v3a2 2 0 1 0 .8 1.8V4h3Z" /></svg>;
}

function SectionHeading({ title, count, seeAll, href }: { title: string; count?: number; seeAll?: string; href?: string }) {
  return <div className="lu-section-heading"><h2>{title}{typeof count === 'number' && <span className="lu-count">{count}</span>}</h2>{seeAll && href && <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{seeAll}<Icon kind="chevron" /></a>}</div>;
}

function localizedLink(link: LinkRecord, locale: Locale) {
  return { ...link, url: normalizeLinkUrl(link.url), ...localizeSocialLink(link, link.translations, locale) };
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/links');
}

export default async function LinksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const t = copy[loc];
  let links: LinkRecord[] = [];
  let emailSocialLinks: Awaited<ReturnType<typeof getEmailSocialLinks>> | null = null;

  try {
    await seedSocialLinksIfEmpty();
    links = await prisma.socialLink.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], select: { id: true, title: true, url: true, description: true, coverImageUrl: true, episodeNumber: true, badge: true, isActive: true, isNew: true, isFeatured: true, isDiscoverable: true, sortOrder: true, createdAt: true, category: { select: { id: true, name: true, sortOrder: true } }, translations: { select: { locale: true, title: true, description: true } } } });
    emailSocialLinks = await getEmailSocialLinks();
  } catch {
    links = [];
  }

  const featured: FeaturedSocial[] = SOCIAL_PLATFORMS.flatMap((platform) => {
    const link = links.find((item) => item.isActive && item.isFeatured && matchesSocialPlatform(item, platform))
      ?? links.find((item) => item.isActive && matchesSocialPlatform(item, platform));
    if (link) return [{ id: link.id, platform, title: localizedLink(link, loc).title, url: normalizeLinkUrl(link.url) }];

    const key = platform.toLowerCase() as 'tiktok' | 'instagram' | 'linkedin' | 'youtube';
    const fallbackUrl = platform === 'Facebook' ? '' : emailSocialLinks?.[key] || (platform === 'YouTube' ? 'https://www.youtube.com/@levelupingermany' : '');
    const normalizedFallbackUrl = normalizeLinkUrl(fallbackUrl);
    return normalizedFallbackUrl ? [{ id: `email-social-${key}`, platform, title: platform, url: normalizedFallbackUrl }] : [];
  });
  const featuredIds = new Set(featured.map((link) => link.id));
  const content = links.filter((link) => !featuredIds.has(link.id)).map((link) => localizedLink(link, loc));
  const businessEpisodes = content.filter((link) => categoryIs(link, 'business tour')).sort((a, b) => (b.episodeNumber ?? -1) - (a.episodeNumber ?? -1) || a.sortOrder - b.sortOrder);
  const eventFeedback = content.find((link) => categoryIs(link, 'evenement') && normalized(`${link.title} ${link.description ?? ''}`).includes('feedback'));
  const discover = content.filter((link) => !categoryIs(link, 'business tour') && !categoryIs(link, 'career tour') && !categoryIs(link, 'evenement') && !categoryIs(link, 'partner') && !categoryIs(link, 'partenaire'));
  const partnerLink = content.find((link) => categoryIs(link, 'partenaire') || categoryIs(link, 'partner'))
    ?? content.find((link) => normalized(`${link.title} ${link.url}`).includes('lemfi'));
  const promoCode = partnerLink?.badge?.trim() || partnerLink?.description?.match(/\b[A-Z][A-Z0-9]{2,}\b/)?.[0] || null;
  const discoverLinks = [...discover.filter((link) => link.isDiscoverable || !categoryIs(link, 'business tool')), ...(eventFeedback ? [eventFeedback] : [])].sort((a, b) => Number(b.isDiscoverable) - Number(a.isDiscoverable) || a.sortOrder - b.sortOrder);

  return <div className={`${poppins.variable} ${lora.variable} lu-links-page`}>
    <style>{`body:has(.lu-links-page) header.fixed,body:has(.lu-links-page) footer{display:none!important}body:has(.lu-links-page) main{padding-top:0!important}.lu-links-page .lu-hero,.lu-links-page .lu-section,.lu-links-page .lu-footer{animation:lu-links-rise .6s cubic-bezier(.2,.7,.2,1) both}.lu-links-page .lu-section:nth-of-type(2){animation-delay:80ms}.lu-links-page .lu-section:nth-of-type(3){animation-delay:160ms}.lu-links-page .lu-section:nth-of-type(4){animation-delay:240ms}.lu-links-page .lu-section:nth-of-type(5){animation-delay:320ms}@keyframes lu-links-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.lu-links-page .lu-hero,.lu-links-page .lu-section,.lu-links-page .lu-footer{animation:none!important}}`}</style>
    <style>{` .lu-links-page{--lu-bg:#1a1a1a;--lu-surface:#242424;--lu-surface-2:#333;--lu-cover:#262626;--lu-text:#fff;--lu-muted:#b5b5b0;--lu-line:rgba(255,255,255,.18);--lu-orange:var(--accent,#e98c0b);--lu-red:var(--primary,#8c1a1a);background:var(--lu-bg);color:var(--lu-text);font-family:var(--links-font),sans-serif;min-height:100vh}.lu-links-page *{box-sizing:border-box}.lu-links-page a,.lu-links-page button{outline:0}.lu-links-page a:focus-visible,.lu-links-page button:focus-visible{outline:2px solid var(--lu-orange);outline-offset:2px}.lu-links-shell{width:min(100% - 40px,440px);margin:auto;padding:16px 0 36px}.lu-links-top{display:flex;justify-content:space-between;align-items:center}.lu-home,.lu-language{border:1px solid var(--lu-line);background:var(--lu-surface);color:var(--lu-text);border-radius:999px}.lu-home{width:44px;height:44px;display:grid;place-items:center}.lu-home svg{width:20px;height:20px}.lu-language{display:flex;padding:3px;gap:2px}.lu-language a{min-width:40px;height:34px;display:grid;place-items:center;border-radius:999px;color:var(--lu-muted);font-size:11px;font-weight:600}.lu-language a[aria-current=true]{background:var(--lu-text);color:var(--lu-bg)}.lu-hero{text-align:center;padding:22px 0 30px}.lu-logo-wrap{position:relative;width:88px;height:88px;margin:0 auto 15px}.lu-logo-halo{position:absolute;width:460px;height:460px;left:50%;top:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(245,130,31,.12) 0%,rgba(245,130,31,.06) 26%,rgba(212,42,32,.03) 46%,transparent 70%);animation:lu-halo 7s ease-in-out infinite}.lu-logo{position:relative;width:88px;height:88px;border-radius:999px;object-fit:contain;background:#fff}.lu-handle{font-size:12px}.lu-welcome{margin-top:7px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--lu-muted)}.lu-links-page h1{font-size:24px;line-height:1.2;font-weight:600;margin:6px 0}.lu-tagline{font-size:14px;color:var(--lu-muted)}.lu-spark{color:var(--lu-orange);display:inline-block;animation:lu-spark 2.4s ease-in-out infinite}.lu-socials{display:flex;justify-content:center;gap:10px;margin-top:20px}.lu-social{width:44px;height:44px;border:1px solid var(--lu-line);border-radius:999px;display:grid;place-items:center;color:var(--lu-text);transition:.2s}.lu-social:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.55)}.lu-social svg{width:21px;height:21px}.lu-section{margin-top:30px}.lu-section-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.lu-section-heading h2{font-size:16px;font-weight:600;margin:0;display:flex;align-items:center;gap:8px}.lu-section-heading>a{display:flex;align-items:center;gap:2px;color:var(--lu-muted);font-size:12px}.lu-section-heading>a svg{width:14px;height:14px}.lu-count{font-size:11px;color:var(--lu-muted);border:1px solid var(--lu-line);padding:2px 7px;border-radius:999px}.lu-episodes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.lu-episode-card{min-width:0;color:var(--lu-text);transition:transform .25s}.lu-episode-card:hover{transform:translateY(-2px)}.lu-cover{height:112px;position:relative;border-radius:14px;overflow:hidden;background:var(--lu-cover);border:1px solid transparent}.lu-cover.is-new{border:1.5px solid var(--lu-red)}.lu-cover img{width:100%;height:100%;object-fit:cover;transition:transform .25s}.lu-episode-card:hover .lu-cover img{transform:scale(1.04)}.lu-cover:after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),transparent 60%)}.lu-episode-label{position:absolute;z-index:1;top:7px;left:8px;font-size:9px;color:#fff}.lu-episode-number{position:absolute;z-index:1;bottom:-5px;left:7px;font-family:var(--links-display-font),serif;font-size:80px;font-style:italic;line-height:1;color:var(--lu-orange)}.lu-play{position:absolute;z-index:1;right:8px;bottom:8px;width:30px;height:30px;background:#fff;color:#111;border-radius:999px;display:grid;place-items:center}.lu-play svg{width:14px;height:14px}.lu-new{position:absolute;z-index:2;right:7px;top:7px;background:var(--lu-red);padding:3px 6px;border-radius:999px;font-size:9px}.lu-guest{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;font-weight:600;margin-top:7px}.lu-event-list,.lu-discover-list{display:grid;gap:7px}.lu-event-row,.lu-discover-row{min-height:58px;background:var(--lu-surface);border-radius:14px;display:flex;align-items:center;gap:12px;padding:7px 10px;color:var(--lu-text);transition:.2s}.lu-event-row:hover,.lu-discover-row:hover{background:#2e2e2e}.lu-event-year{width:50px;height:44px;flex:none;display:grid;place-items:center;background:var(--lu-orange);border-radius:10px;font-family:var(--links-display-font),serif;font-size:26px;font-style:italic}.lu-event-row:nth-child(even) .lu-event-year{background:var(--lu-red)}.lu-event-copy{min-width:0;flex:1}.lu-event-name,.lu-discover-title{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lu-event-meta{font-size:10px;color:var(--lu-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}.lu-discover-icon{width:44px;height:44px;flex:none;border-radius:10px;background:var(--lu-surface-2);display:grid;place-items:center;color:var(--lu-muted)}.lu-discover-row:first-child .lu-discover-icon{background:var(--lu-orange);color:#111}.lu-discover-icon img{width:30px;height:30px;object-fit:cover;border-radius:7px}.lu-discover-row>svg{width:17px;height:17px;color:var(--lu-muted);flex:none}.lu-discover-copy{min-width:0;flex:1}.lu-badge{display:inline-block;margin-left:7px;background:var(--lu-red);border-radius:999px;padding:3px 6px;font-size:9px;font-weight:500;vertical-align:middle}.lu-partner{display:flex;align-items:center;gap:12px;padding:14px;background:#e8f0f7;color:#10243a;border-radius:14px}.lu-partner-link{display:flex;align-items:center;gap:10px;min-width:0;flex:1}.lu-partner-logo{width:42px;height:42px;object-fit:contain;background:#fff;border-radius:10px;padding:4px}.lu-partner-copy{min-width:0}.lu-partner-copy strong,.lu-partner-copy span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lu-partner-copy strong{font-size:13px}.lu-partner-copy span{font-size:10px;margin-top:2px}.lu-copy-button{min-width:84px;min-height:44px;border:1px dashed #10243a;background:transparent;color:#10243a;border-radius:9px;padding:5px 8px;display:flex;align-items:center;justify-content:center;gap:5px;font:600 11px var(--links-font);cursor:pointer}.lu-contact{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lu-contact a{height:52px;border-radius:14px;background:var(--lu-surface);display:flex;align-items:center;justify-content:center;gap:8px;color:var(--lu-text);font-size:12px}.lu-contact svg{width:19px;height:19px}.lu-footer{text-align:center;padding-top:30px}.lu-motto{font:italic 500 18px var(--links-display-font),serif;color:var(--lu-orange)}.lu-footer-links{margin-top:8px;color:var(--lu-muted);font-size:11px}.lu-footer-links a:hover{text-decoration:underline}@keyframes lu-halo{0%,100%{opacity:.82;transform:translate(-50%,-50%) scale(.94)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}}@keyframes lu-spark{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.8);opacity:.55}}@media(prefers-reduced-motion:reduce){.lu-logo-halo,.lu-spark{animation:none}.lu-social,.lu-episode-card,.lu-event-row,.lu-discover-row{transition:none}}@media(min-width:700px){.lu-links-shell{padding-top:24px}}
    `}</style>
    <style>{`.lu-links-page .lu-logo-halo{pointer-events:none}.lu-links-page .lu-socials{width:100%;flex-wrap:wrap;align-items:center;padding:0 4px}.lu-links-page .lu-social{flex:0 0 44px;position:relative;z-index:1;pointer-events:auto}.lu-links-page .lu-social svg{pointer-events:none}@media(max-width:380px){.lu-links-page .lu-links-shell{width:min(100% - 24px,440px);padding-top:12px}.lu-links-page .lu-socials{gap:7px}.lu-links-page .lu-social{flex-basis:40px;width:40px;height:40px}.lu-links-page .lu-home{width:40px;height:40px}.lu-links-page .lu-language a{min-width:34px;height:30px}}`}</style>
    <div className="lu-links-shell">
      <div className="lu-links-top"><Link className="lu-home" href={`/${loc}`} aria-label={t.home}><Icon kind="home" /></Link><nav className="lu-language" aria-label="Language"><Link href={`/fr/links`} aria-current={loc === 'fr' ? 'true' : undefined}>FR</Link><Link href={`/de/links`} aria-current={loc === 'de' ? 'true' : undefined}>DE</Link><Link href={`/en/links`} aria-current={loc === 'en' ? 'true' : undefined}>EN</Link></nav></div>
      <header className="lu-hero"><div className="lu-logo-wrap"><span className="lu-logo-halo" aria-hidden="true" /><Image className="lu-logo" src="/logo.png" alt="Level Up in Germany" width={88} height={88} priority /></div><div className="lu-handle">@levelupingermany</div><div className="lu-welcome">{t.welcome}</div><h1>Level Up in Germany</h1><p className="lu-tagline">{t.tagline} <span className="lu-spark" aria-hidden="true">✦</span></p><nav className="lu-socials" aria-label="Social media">{featured.map((link) => <a className="lu-social" key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.title} title={link.title}><SocialIcon platform={link.platform} /></a>)}</nav></header>
      {businessEpisodes.length > 0 && <section className="lu-section" aria-labelledby="business-tour"><SectionHeading title={businessEpisodes[0]?.category?.name ?? 'Level Up Business Tour'} count={businessEpisodes.length} seeAll={t.seeAll} href={featured.find((link) => normalized(link.title).includes('youtube'))?.url} /><div className="lu-episodes">{businessEpisodes.map((link) => <a className="lu-episode-card" key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"><div className={`lu-cover ${link.isNew ? 'is-new' : ''}`}><Image src={link.coverImageUrl || '/hero/hero-1.png'} alt={`${link.title} ${link.episodeNumber ?? ''}`} width={140} height={112} sizes="(max-width: 440px) 33vw, 140px" /><span className="lu-episode-label">{t.episode}</span><strong className="lu-episode-number">{link.episodeNumber ?? ''}</strong><span className="lu-play"><Icon kind="play" /></span>{link.isNew && <span className="lu-new">{t.new}</span>}</div><span className="lu-guest">{link.title}</span></a>)}</div></section>}
      {discoverLinks.length > 0 && <section className="lu-section" aria-labelledby="discover"><SectionHeading title={t.discover} count={discoverLinks.length} /><div className="lu-discover-list">{discoverLinks.map((link) => <a className="lu-discover-row" key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"><span className="lu-discover-icon">{link.coverImageUrl ? <Image src={link.coverImageUrl} alt="" width={30} height={30} /> : <Icon kind="social" />}</span><span className="lu-discover-copy"><span className="lu-discover-title">{link.title}{link.isNew && <span className="lu-badge">{t.new}</span>}</span></span><Icon kind="chevron" /></a>)}</div></section>}
      {partnerLink && <section className="lu-section" aria-labelledby="partner"><SectionHeading title={t.partner} /><div className="lu-partner"><a className="lu-partner-link" href={partnerLink.url} target="_blank" rel="noopener noreferrer"><Image className="lu-partner-logo" src="/partners/lemfi-logo.png" alt="LemFi" width={42} height={42} /><span className="lu-partner-copy"><strong>{t.lemfiTitle}</strong><span>{t.lemfiSub}</span></span></a>{promoCode && <LinksCopyButton value={promoCode} copyLabel={t.copy} copiedLabel={t.copied} />}</div></section>}
      <section className="lu-section" aria-labelledby="talk"><SectionHeading title={t.talk} /><LinksContactActions phone={SITE_CONTACT.phoneDisplay} email={SITE_CONTACT.email} whatsappLabel={t.whatsapp} emailLabel={t.email} copyPhoneLabel={t.copyPhone} copyEmailLabel={t.copyEmail} /></section>
      <footer className="lu-footer"><div className="lu-motto">Dare to be different</div><div className="lu-footer-links"><Link href={`/${loc}/imprint`}>{t.legal}</Link> · <Link href={`/${loc}/privacy`}>{t.privacy}</Link> · © {new Date().getFullYear()} Level Up in Germany</div></footer>
    </div>
  </div>;
}
