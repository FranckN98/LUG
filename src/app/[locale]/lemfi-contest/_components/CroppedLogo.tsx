/**
 * Affiche un logo officiel en ne montrant que sa zone utile (les fichiers fournis sont des carrés
 * avec de larges marges blanches). Le fichier n'est jamais modifié : seul l'affichage est recadré.
 */
export type LogoBox = { w: number; h: number; x: number; y: number; bw: number; bh: number };

/** Zones utiles mesurées sur les fichiers (marge de sécurité de 6 px incluse). */
export const LEMFI_LOGO: { src: string; box: LogoBox } = {
  src: '/partners/lemfi-logo.png',
  box: { w: 768, h: 768, x: 79, y: 322, bw: 609, bh: 123 },
};

export const LEVELUP_LOGO: { src: string; box: LogoBox } = {
  src: '/logo.png',
  box: { w: 499, h: 500, x: 47, y: 204, bw: 405, bh: 121 },
};

export function CroppedLogo({
  src,
  box,
  alt,
  className = 'h-9',
}: {
  src: string;
  box: LogoBox;
  alt: string;
  /** Définit la hauteur affichée ; la largeur suit le ratio de la zone utile. */
  className?: string;
}) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden ${className}`}
      style={{ aspectRatio: `${box.bw} / ${box.bh}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute max-w-none select-none"
        style={{
          width: `${(box.w / box.bw) * 100}%`,
          left: `${-(box.x / box.bw) * 100}%`,
          top: `${-(box.y / box.bh) * 100}%`,
        }}
      />
    </span>
  );
}
