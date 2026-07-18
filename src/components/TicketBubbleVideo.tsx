'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function TicketBubbleVideo() {
  const pathname = usePathname();
  const isBuyTicketPage = pathname?.endsWith('/buy-ticket') ?? false;
  const [showBoost, setShowBoost] = useState(false);

  useEffect(() => {
    if (!isBuyTicketPage) {
      setShowBoost(false);
      return;
    }

    setShowBoost(true);
    const t = window.setTimeout(() => setShowBoost(false), 5000);
    return () => window.clearTimeout(t);
  }, [isBuyTicketPage, pathname]);

  return (
    <a
      href="https://ticket.levelupigermany.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ouvrir la billetterie"
      className={`fixed block h-[4cm] w-[4cm] overflow-hidden rounded-full border-2 border-[#8C1A1A]/85 bg-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.28)] transition-all duration-500 hover:scale-105 ${
        showBoost
          ? 'bottom-1/2 right-1/2 z-[80] translate-x-1/2 translate-y-1/2 ring-8 ring-[#8C1A1A]/30'
          : 'bottom-24 right-4 z-40 sm:bottom-6 sm:right-6'
      }`}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="h-full w-full object-cover"
        src="/media/Level%20Up%20animation.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </a>
  );
}
