
"use client";
import React from 'react';

/**
 * Affiche un PDF de façon classique, avec tous les contrôles natifs.
 * Le PDF doit être placé dans /public/downloads/fscon.pdf
 */
export function FsconPdfViewer() {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <iframe
        src="/downloads/fscon.pdf"
        title="FSCon PDF"
        className="w-full h-full min-h-[600px] bg-white"
        aria-label="FSCon PDF"
        allowFullScreen
      />
    </div>
  );
}
