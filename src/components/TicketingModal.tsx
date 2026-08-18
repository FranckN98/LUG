'use client';

import { useEffect, useRef } from 'react';
import type { Locale } from '@/i18n/config';

interface TicketingModalProps {
  checkoutUrl: string;
  onClose: () => void;
  passName?: string;
  locale?: Locale;
}

const MODAL_TEXT: Record<Locale, {
  defaultTitle: string;
  close: string;
  buyLabel: (name?: string) => string;
  loading: string;
  iframeFallbackTitle: string;
  openInNewTab: string;
}> = {
  fr: {
    defaultTitle: 'Level Up in Germany 2026',
    close: 'Fermer',
    buyLabel: (name) => (name ? `Acheter — ${name}` : 'Acheter mon billet'),
    loading: 'Chargement de la billetterie…',
    iframeFallbackTitle: 'Billetterie Level Up in Germany',
    openInNewTab: 'Ouvrir dans un nouvel onglet si la fenêtre ne charge pas',
  },
  en: {
    defaultTitle: 'Level Up in Germany 2026',
    close: 'Close',
    buyLabel: (name) => (name ? `Buy — ${name}` : 'Buy my ticket'),
    loading: 'Loading the ticket shop…',
    iframeFallbackTitle: 'Level Up in Germany ticket shop',
    openInNewTab: "Open in a new tab if the window doesn't load",
  },
  de: {
    defaultTitle: 'Level Up in Germany 2026',
    close: 'Schließen',
    buyLabel: (name) => (name ? `Kaufen — ${name}` : 'Mein Ticket kaufen'),
    loading: 'Ticketshop wird geladen…',
    iframeFallbackTitle: 'Level Up in Germany Ticketshop',
    openInNewTab: 'In neuem Tab öffnen, falls das Fenster nicht lädt',
  },
};

export function TicketingModal({ checkoutUrl, onClose, passName, locale = 'fr' }: TicketingModalProps) {
  const t = MODAL_TEXT[locale];
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-6"
      style={{ background: 'rgba(8, 4, 4, 0.82)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={t.buyLabel(passName)}
    >
      <div
        className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-none shadow-2xl sm:h-auto sm:rounded-2xl"
        style={{
          background: '#fff',
          border: '2.5px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow:
            '0 0 0 2.5px #8C1A1A, 0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(140,26,26,0.25)',
          maxHeight: '100dvh',
        }}
      >
        {/* Header bar */}
        <div
          className="flex shrink-0 items-center justify-between px-5 py-3"
          style={{
            background: 'linear-gradient(135deg, #6f1414 0%, #8C1A1A 60%, #b3401f 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-white/90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M3 9.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 9.5v1a2 2 0 0 0 0 4v1a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5v-1a2 2 0 0 0 0-4v-1Z" />
              <path d="M9 8v8" strokeDasharray="2 2" />
            </svg>
            <span className="text-sm font-semibold text-white">
              {passName ? passName : t.defaultTitle}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
            aria-label={t.close}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* iframe */}
        <div
          className="relative flex-1 overflow-auto"
          style={{ minHeight: 'min(78dvh, 720px)' }}
        >
          {/* Loader shown behind iframe until it loads */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200"
              style={{ borderTopColor: '#8C1A1A' }}
            />
            <p className="text-sm text-gray-500">{t.loading}</p>
          </div>

          <iframe
            src={checkoutUrl}
            title={passName ? t.buyLabel(passName) : t.iframeFallbackTitle}
            className="relative z-10 origin-top-left border-0"
            style={{
              // Dézoom léger : le contenu est réduit à 85 % pour afficher plus
              // d'éléments d'un coup, tout en agrandissant l'iframe (100/0.85 ≈ 117.6 %)
              // pour qu'il remplisse toujours la fenêtre après la mise à l'échelle.
              transform: 'scale(0.85)',
              transformOrigin: 'top left',
              width: '117.65%',
              height: '117.65%',
              minHeight: 'calc(min(78dvh, 720px) / 0.85)',
            }}
            allow="payment"
          />
        </div>

        {/* Fallback footer */}
        <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-3 text-center">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            {t.openInNewTab}
          </a>
        </div>
      </div>
    </div>
  );
}
