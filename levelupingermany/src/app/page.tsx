import Link from 'next/link';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Choose language',
  description: 'Level Up in Germany — select Deutsch, English or Français to enter the site.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold text-primary mb-4">
        Level Up in Germany
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Choose your language to continue.
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link
          href="/de"
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition"
        >
          Deutsch
        </Link>
        <Link
          href="/en"
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition"
        >
          English
        </Link>
        <Link
          href="/fr"
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition"
        >
          Français
        </Link>
      </nav>
    </main>
  );
}
