'use client';

import { useEffect, useState } from 'react';

type LinksCopyButtonProps = {
  value: string;
  copyLabel: string;
  copiedLabel: string;
};

export function LinksCopyButton({ value, copyLabel, copiedLabel }: LinksCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="lu-copy-button" onClick={copyCode} aria-label={copied ? copiedLabel : copyLabel}>
      <span>{copied ? copiedLabel : value}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {copied ? <path d="m5 12 4 4L19 6" /> : <><rect x="9" y="9" width="10" height="10" rx="1" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>}
      </svg>
      <span className="sr-only" aria-live="polite">{copied ? copiedLabel : ''}</span>
    </button>
  );
}
