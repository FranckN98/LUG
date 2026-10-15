'use client';

import { useState } from 'react';

export function CopyCode({ code, label, copyLabel, copiedLabel }: { code: string; label: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* copie manuelle possible : le code est affiché */
    }
  }

  return (
    <div className="mt-4 flex items-stretch overflow-hidden rounded-2xl border border-[#F5B800]/50 bg-[#0A3D27] text-white shadow-inner">
      <div className="flex flex-1 flex-col justify-center px-4 py-2.5">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#FFE08A]/80">{label}</span>
        <span className="font-mono text-xl font-bold tracking-[0.3em] text-[#F5B800] sm:text-2xl">{code}</span>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className="min-w-24 border-l border-white/15 px-4 text-sm font-semibold text-[#FFE08A] transition hover:bg-white/10 focus:outline-none focus-visible:bg-white/10"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
