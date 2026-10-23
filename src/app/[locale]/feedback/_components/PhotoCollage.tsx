import Image from 'next/image';
import type { FeedbackPhoto } from '@/config/feedbackPhotos';

// Une grande photo et jusqu'à trois photos complémentaires ; sur mobile la grande photo passe au-dessus.
const LAYOUTS: Record<number, { grid: string; cells: string[] }> = {
  1: { grid: 'grid-cols-1 h-64 sm:h-[26rem]', cells: [''] },
  2: { grid: 'grid-cols-3 h-64 sm:h-[26rem]', cells: ['col-span-2', ''] },
  3: {
    grid: 'grid-cols-2 grid-rows-[3fr_2fr] h-[26rem] sm:grid-cols-3 sm:grid-rows-2 sm:h-[28rem]',
    cells: ['col-span-2 sm:row-span-2', '', ''],
  },
  4: {
    grid: 'grid-cols-3 grid-rows-[3fr_2fr] h-[26rem] sm:grid-cols-4 sm:grid-rows-2 sm:h-[28rem]',
    cells: ['col-span-3 sm:col-span-2 sm:row-span-2', '', '', 'sm:col-span-2'],
  },
};

export function PhotoCollage({ photos }: { photos: FeedbackPhoto[] }) {
  const shown = photos.slice(0, 4);
  const layout = LAYOUTS[shown.length];
  if (!layout) return null;

  return (
    <div className={`grid gap-2 sm:gap-3 ${layout.grid}`}>
      {shown.map((photo, i) => (
        <div
          key={photo.src}
          className={`relative overflow-hidden rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/15 sm:rounded-3xl ${layout.cells[i]}`}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority={i === 0}
            sizes={i === 0 ? '(min-width: 1152px) 600px, 100vw' : '(min-width: 1152px) 300px, 50vw'}
            className="object-cover"
            style={{ objectPosition: photo.position ?? 'center' }}
          />
        </div>
      ))}
    </div>
  );
}
