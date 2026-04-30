import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LEGACY_LOCALE_PATH_REDIRECTS } from '@/lib/legacyUrlRedirects';

const locales = ['de', 'en', 'fr'] as const;
const defaultLocale = 'en';

type Locale = (typeof locales)[number];

function legacyLocalePathRedirect(request: NextRequest, pathnameNorm: string): NextResponse | null {
  const m = pathnameNorm.match(/^\/(de|en|fr)(\/[^?#]*)?$/);
  if (!m) return null;
  const loc = m[1] as Locale;
  const sub = (m[2] || '').replace(/\/$/, '') || '';
  const target = LEGACY_LOCALE_PATH_REDIRECTS[sub];
  if (target) {
    return NextResponse.redirect(new URL(`/${loc}${target}`, request.url), 308);
  }
  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /* ── Admin routes: hors locale, protégées par cookie ── */
  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/login')) return NextResponse.next();
    const session = request.cookies.get('admin_session')?.value;
    if (session !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
  /**
   * Fichiers sous public/ sont servis à la racine (/events/…, /downloads/…, /hero/…).
   * Ne pas les préfixer par /de|en|fr/ sinon les images renvoient 404.
   */
  const isPublicStatic =
    pathname.startsWith('/events/') ||
    pathname.startsWith('/downloads/') ||
    pathname.startsWith('/hero/') ||
    /\.(ico|png|jpe?g|gif|webp|svg|avif|pdf|woff2?)$/i.test(pathname);
  if (isPublicStatic) return NextResponse.next();

  const pathnameNorm = pathname.replace(/\/$/, '') || '/';
  const legacy = legacyLocalePathRedirect(request, pathnameNorm);
  if (legacy) return legacy;

  const cookieLocale = request.cookies.get('lug_locale')?.value;
  const preferredLocale =
    cookieLocale && locales.includes(cookieLocale as Locale) ? cookieLocale : defaultLocale;
  const hasLocale = locales.some((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`));
  if (hasLocale) {
    // Surface the URL locale to the root layout so <html lang> is correct server-side.
    const m = pathname.match(/^\/(de|en|fr)(?:\/|$)/);
    const urlLocale = (m?.[1] as Locale) ?? defaultLocale;
    const res = NextResponse.next();
    res.headers.set('x-locale', urlLocale);
    return res;
  }
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL(`/${preferredLocale}`, request.url));
  }
  return NextResponse.redirect(new URL(`/${preferredLocale}`, request.url));
}

export const config = {
  matcher: ['/((?!_next|api|favicon).*)'],
};
