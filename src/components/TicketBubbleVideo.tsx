'use client';

export function TicketBubbleVideo() {
  return (
    <a
      href="https://ticket.levelupigermany.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ouvrir la billetterie"
      className="fixed bottom-24 right-4 z-40 block h-[4cm] w-[4cm] overflow-hidden rounded-full border-2 border-[#8C1A1A]/85 bg-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:scale-105 sm:bottom-6 sm:right-6"
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
