
"use client";
import React from 'react';

/**
 * Affiche un PDF de façon classique, avec tous les contrôles natifs.
 * Le PDF actif est défini depuis /admin/sponsor-documents (fallback statique sinon).
 */
export function FsconPdfViewer({ src = '/pdf/sponsor-2026' }: { src?: string }) {
  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <iframe
        src={src}
        title="Sponsor PDF"
        className="w-full h-full min-h-[800px] bg-white"
        aria-label="Sponsor PDF"
        allowFullScreen
      />
    </div>
  );
}
