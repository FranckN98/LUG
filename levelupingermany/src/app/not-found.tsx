import Link from 'next/link';
import { NotFoundPageContent } from '@/components/NotFoundPageContent';

/** Fallback for URLs that do not match [locale] (rare). */
export default function GlobalNotFound() {
  return (
    <main className="min-h-screen">
      <NotFoundPageContent />
      <div className="mx-auto max-w-lg px-4 pb-12 text-center">
        <p className="text-sm text-gray-500">Choose language:</p>
        <nav className="mt-3 flex flex-wrap justify-center gap-3">
          <Link href="/de" className="rounded-lg px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
            Deutsch
          </Link>
          <Link href="/en" className="rounded-lg px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
            English
          </Link>
          <Link href="/fr" className="rounded-lg px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
            Français
          </Link>
        </nav>
      </div>
    </main>
  );
}
