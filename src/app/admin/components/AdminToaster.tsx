'use client';

import { useEffect, useState } from 'react';

/**
 * Toast notification system for admin pages.
 *
 * Usage from anywhere on the client side:
 *   import { adminNotify } from '@/app/admin/components/AdminToaster';
 *   adminNotify.success('Article enregistré');
 *   adminNotify.error('Erreur lors de la sauvegarde.');
 *
 * The <AdminToaster /> component must be mounted once (in the admin layout).
 */

type ToastKind = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

const EVENT_NAME = 'admin-toast';

type ToastEventDetail = { kind: ToastKind; message: string };

function dispatch(kind: ToastKind, message: string) {
  if (typeof window === 'undefined') return;
  const ev = new CustomEvent<ToastEventDetail>(EVENT_NAME, {
    detail: { kind, message },
  });
  window.dispatchEvent(ev);
}

export const adminNotify = {
  success: (message: string) => dispatch('success', message),
  error: (message: string) => dispatch('error', message),
  info: (message: string) => dispatch('info', message),
};

const KIND_STYLES: Record<ToastKind, { bg: string; ring: string; icon: JSX.Element; label: string }> = {
  success: {
    bg: 'bg-emerald-600/95',
    ring: 'ring-emerald-300/30',
    label: 'Succès',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-rose-600/95',
    ring: 'ring-rose-300/30',
    label: 'Erreur',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v3.5M12 16h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-sky-600/95',
    ring: 'ring-sky-300/30',
    label: 'Info',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function AdminToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<ToastEventDetail>).detail;
      if (!detail || !detail.message) return;
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, kind: detail.kind, message: detail.message }]);
      // Auto-dismiss after 4s (errors stay 6s for readability).
      const ttl = detail.kind === 'error' ? 6000 : 4000;
      window.setTimeout(() => {
        setToasts((list) => list.filter((t) => t.id !== id));
      }, ttl);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1000] flex flex-col items-end gap-2 px-4 py-6 sm:px-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="ml-auto flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const s = KIND_STYLES[t.kind];
          return (
            <div
              key={t.id}
              role={t.kind === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl ${s.bg} px-4 py-3 text-white shadow-2xl ring-1 ${s.ring} backdrop-blur transition-all animate-[fadeInRight_0.25s_cubic-bezier(0.22,1,0.36,1)]`}
            >
              {s.icon}
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest opacity-80">{s.label}</p>
                <p className="mt-0.5 break-words text-sm font-medium leading-snug">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
                className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Fermer"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
