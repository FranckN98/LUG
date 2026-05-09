
"use client";
import React from 'react';

/**
 * Affiche un PDF en lecture seule, sans bouton de téléchargement ni extraction.
 * Utilise <iframe> avec overlay CSS pour masquer les contrôles natifs.
 * Le PDF doit être placé dans /public/downloads/fscon.pdf
 */
export function FsconPdfViewer() {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <iframe
        src="/downloads/fscon.pdf#toolbar=0&navpanes=0&scrollbar=0"
        title="FSCon PDF"
        className="w-full h-full min-h-[600px] bg-white"
        style={{ pointerEvents: 'none' }}
        tabIndex={-1}
        aria-label="FSCon PDF (lecture seule)"
      />
      {/* Overlay pour bloquer clic droit, drag, etc. */}
      <div
        className="absolute inset-0 z-10 cursor-not-allowed select-none"
        style={{ background: 'transparent' }}
        onContextMenu={e => e.preventDefault()}
        onMouseDown={e => e.preventDefault()}
        onDragStart={e => e.preventDefault()}
      />
      {/* Watermark anti-capture (optionnel) */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-4 z-20">
        <span className="text-xs font-bold text-white/40 bg-black/30 px-2 py-1 rounded-lg">FSCon – usage interne</span>
      </div>
    </div>
  );
}
