import React from 'react';

/** Fond commun des pages Events (liste + éditions). */
export function EventsPageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(140,26,26,0.06),transparent)]" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">{children}</div>
    </div>
  );
}
