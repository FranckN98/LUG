import React from 'react';

function IconBookSmartDownload({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

/** Vercel Blob ne force le téléchargement (au lieu de l'aperçu) qu'avec ?download=1. */
function toDownloadUrl(pdfPath: string): string {
  try {
    const url = new URL(pdfPath);
    if (url.hostname.endsWith('.public.blob.vercel-storage.com')) url.searchParams.set('download', '1');
    return url.toString();
  } catch {
    return pdfPath;
  }
}

type Props = {
  anchorId: string;
  pdfPath: string;
  title: string;
  subtitle: string;
};

export function EventPdfDownloadCta({ anchorId, pdfPath, title, subtitle }: Props) {
  return (
    <section
      id={anchorId}
      className="relative scroll-mt-28 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-[#1a0a0a] via-primary to-[#3d0f12] p-1 shadow-2xl shadow-primary/30"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
      <div className="relative rounded-[1.35rem] bg-gradient-to-br from-white/[0.08] to-transparent px-5 py-6 sm:px-8 sm:py-8">
        <a
          href={toDownloadUrl(pdfPath)}
          download
          rel="noopener noreferrer"
          className="group relative flex w-full flex-col gap-5 text-left sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4 sm:items-center">
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 shadow-inner ring-2 ring-white/20 transition duration-300 group-hover:scale-105 group-hover:ring-accent/60">
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent/0 via-transparent to-accent/25 opacity-0 transition group-hover:opacity-100" />
              <IconBookSmartDownload className="relative h-9 w-9 text-white drop-shadow-md" />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</p>
              <p className="mt-1 text-sm text-white/75">{subtitle}</p>
            </div>
          </div>
          <span className="inline-flex items-center justify-center gap-2 self-stretch rounded-2xl bg-accent px-6 py-3.5 text-sm font-bold text-brand-dark shadow-lg shadow-black/20 transition duration-300 group-hover:bg-accent-light group-hover:shadow-xl sm:self-center">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            PDF
          </span>
        </a>
      </div>
    </section>
  );
}
