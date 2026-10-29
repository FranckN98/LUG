import { beforeEach, describe, expect, it, vi } from 'vitest';

const media = vi.hoisted(() => ({ findMany: vi.fn() }));
const heroSlide = vi.hoisted(() => ({ findMany: vi.fn(), createMany: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { media, heroSlide } }));

import { syncHeroMediaToSlides } from './heroSync';

const row = (filename: string, url: string, altText = '') => ({ filename, url, altText });

describe('syncHeroMediaToSlides', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    heroSlide.createMany.mockResolvedValue({ count: 0 });
  });

  it('adds new library images after the existing slides', async () => {
    media.findMany.mockResolvedValue([row('hero-default-1', '/hero-pic/a.jpg'), row('new.jpg', '/media/new.jpg', 'Nouvelle')]);
    heroSlide.findMany.mockResolvedValue([{ imageUrl: '/hero-pic/a.jpg', sortOrder: 3 }]);

    expect(await syncHeroMediaToSlides()).toBe(1);
    expect(heroSlide.createMany.mock.calls[0]![0].data).toEqual([
      expect.objectContaining({ imageUrl: '/media/new.jpg', sortOrder: 4, isActive: true, isMain: false, altTextFr: 'Nouvelle' }),
    ]);
  });

  it('does not bring back default images once slides exist', async () => {
    media.findMany.mockResolvedValue([row('hero-default-2', '/hero-pic/b.jpg')]);
    heroSlide.findMany.mockResolvedValue([{ imageUrl: '/media/x.jpg', sortOrder: 0 }]);

    expect(await syncHeroMediaToSlides()).toBe(0);
    expect(heroSlide.createMany).not.toHaveBeenCalled();
  });

  it('imports the defaults too while there is no slide yet, so the hero stays the same', async () => {
    media.findMany.mockResolvedValue([row('hero-default-1', '/hero-pic/a.jpg'), row('hero-default-2', '/hero-pic/b.jpg')]);
    heroSlide.findMany.mockResolvedValue([]);

    expect(await syncHeroMediaToSlides()).toBe(2);
    expect(heroSlide.createMany.mock.calls[0]![0].data.map((d: { sortOrder: number }) => d.sortOrder)).toEqual([0, 1]);
  });

  it('is idempotent', async () => {
    media.findMany.mockResolvedValue([row('new.jpg', '/media/new.jpg')]);
    heroSlide.findMany.mockResolvedValue([{ imageUrl: '/media/new.jpg', sortOrder: 0 }]);

    expect(await syncHeroMediaToSlides()).toBe(0);
  });
});
