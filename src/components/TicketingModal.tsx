'use client';

import { useEffect, useRef } from 'react';

interface TicketingModalProps {
  checkoutUrl: string;
  onClose: () => void;
  passName?: string;
}

export function TicketingModal({ checkoutUrl, onClose, passName }: TicketingModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(8, 4, 4, 0.82)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={passName ? `Acheter — ${passName}` : 'Acheter mon billet'}
    >
      <div
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: '#fff',
          border: '2.5px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow:
            '0 0 0 2.5px #1a4a2e, 0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(26,74,46,0.25)',
          maxHeight: '90vh',
        }}
      >
        {/* Header bar */}
        <div
          className="flex shrink-0 items-center justify-between px-5 py-3"
          style={{
            background: 'linear-gradient(135deg, #1a4a2e 0%, #2d7a4f 60%, #c8910a 100%)',
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
              {passName ? passName : 'Level Up in Germany 2026'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
            aria-label="Fermer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* iframe */}
        <div className="relative flex-1 overflow-auto" style={{ minHeight: '500px' }}>
          {/* Loader shown behind iframe until it loads */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200"
              style={{ borderTopColor: '#1a4a2e' }}
            />
            <p className="text-sm text-gray-500">Chargement de la billetterie…</p>
          </div>

          <iframe
            src={checkoutUrl}
            title={passName ? `Acheter ${passName}` : 'Billetterie Level Up in Germany'}
            className="relative z-10 h-full w-full"
            style={{ minHeight: '500px', border: 'none' }}
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
            Ouvrir dans un nouvel onglet si la fenêtre ne charge pas
          </a>
        </div>
      </div>
    </div>
  );
}
