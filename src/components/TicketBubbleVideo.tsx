'use client';

import { useEffect, useRef, useState } from 'react';

export function TicketBubbleVideo() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) {
      setVisible(false);
      return;
    }

    v.muted = true;

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

    // Se referme à la fin de l'animation, avec un filet de sécurité.
    v.addEventListener('ended', dismiss, { once: true });
    const safety = window.setTimeout(dismiss, 8000);

    return () => {
      v.removeEventListener('loadeddata', play);
      v.removeEventListener('ended', dismiss);
      window.clearTimeout(safety);
    };
  }, []);

  if (!visible) return null;

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
        className="h-[4cm] w-[4cm] rounded-full object-cover shadow-[0_12px_36px_rgba(0,0,0,0.28)]"
        src="/media/level-up-animation.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
