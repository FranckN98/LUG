'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// N'affiche l'animation qu'une fois par session (pas à chaque actualisation de la page).
const SESSION_KEY = 'lug-ticket-bubble-video-seen';

export function TicketBubbleVideo({ ticketingActive }: { ticketingActive: boolean }) {
  const pathname = usePathname();
  const isBuyTicketPage = pathname?.endsWith('/buy-ticket') ?? false;
  // Décidé côté client uniquement (après montage) pour éviter un mismatch d'hydratation
  // entre le rendu serveur (sessionStorage indisponible) et le client (déjà vu ou non).
  const [shouldShow, setShouldShow] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isBuyTicketPage || !ticketingActive) return;
    const alreadySeen = window.sessionStorage.getItem(SESSION_KEY) === '1';
    if (alreadySeen) return;
    window.sessionStorage.setItem(SESSION_KEY, '1');
    setShouldShow(true);
  }, [isBuyTicketPage, ticketingActive]);

  useEffect(() => {
    if (!shouldShow) return;

    const v = videoRef.current;
    if (!v) {
      setVisible(false);
      return;
    }

    v.muted = true;
    v.playbackRate = 1.9;

    const dismiss = () => {
      setFadeOut(true);
      window.setTimeout(() => setVisible(false), 500);
    };

    const play = () => {
      v.play().catch(() => {
        /* autoplay bloqué : on masque quand même l'écran de chargement */
        dismiss();
      });
    };

    if (v.readyState >= 2) play();
    else v.addEventListener('loadeddata', play, { once: true });

    // Se referme à la fin de l'animation, avec un filet de sécurité (4 s max).
    v.addEventListener('ended', dismiss, { once: true });
    const safety = window.setTimeout(dismiss, 4000);

    return () => {
      v.removeEventListener('loadeddata', play);
      v.removeEventListener('ended', dismiss);
      window.clearTimeout(safety);
    };
  }, [shouldShow]);

  if (!shouldShow || !visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-md transition-opacity duration-500 ${
        fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className="h-[8cm] w-[8cm] rounded-full object-cover shadow-[0_12px_36px_rgba(0,0,0,0.28)]"
        src="/media/level-up-animation.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
