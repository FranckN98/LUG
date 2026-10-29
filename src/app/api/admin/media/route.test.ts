import { beforeEach, describe, expect, it, vi } from 'vitest';

const media = vi.hoisted(() => ({ findUnique: vi.fn(), delete: vi.fn(), findFirst: vi.fn(), create: vi.fn() }));
const heroSlide = vi.hoisted(() => ({ deleteMany: vi.fn() }));
const unlink = vi.hoisted(() => vi.fn());
vi.mock('@/lib/prisma', () => ({ prisma: { media, heroSlide } }));
vi.mock('@/lib/adminAuth', () => ({ requireAdmin: () => null }));
vi.mock('@/lib/heroSync', () => ({ syncHeroMediaToSlides: vi.fn() }));
vi.mock('fs/promises', () => ({ unlink }));

import { DELETE } from './route';

const del = (id: string) => DELETE(new Request(`http://localhost/api/admin/media?id=${encodeURIComponent(id)}`, { method: 'DELETE' }));
const UUID = '115d2843-08df-4fdd-b4a8-8b8a5c083cc2';

describe('DELETE /api/admin/media', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unlink.mockResolvedValue(undefined);
  });

  it('hides a project file of the community gallery instead of deleting it', async () => {
    media.findFirst.mockResolvedValue(null);
    const res = await del('community:_DSC9081 (1).JPG');
    expect(res.status).toBe(200);
    expect(media.create.mock.calls[0]![0].data).toMatchObject({
      category: 'community_hidden',
      url: '/community/_DSC9081%20(1).JPG',
    });
    expect(unlink).not.toHaveBeenCalled();
  });

  it('removes the file of an uploaded photo and its hero slide', async () => {
    media.findUnique.mockResolvedValue({ id: 'm1', category: 'hero', url: `/media/${UUID}.jpg` });
    expect((await del('m1')).status).toBe(200);
    expect(unlink).toHaveBeenCalledTimes(1);
    expect(heroSlide.deleteMany).toHaveBeenCalledWith({ where: { imageUrl: `/media/${UUID}.jpg` } });
  });

  it('never deletes a project file referenced by a library row', async () => {
    media.findUnique.mockResolvedValue({ id: 'm2', category: 'general', url: '/community/_DSC8759.JPG' });
    await del('m2');
    expect(media.delete).toHaveBeenCalled();
    expect(unlink).not.toHaveBeenCalled();
  });

  it('restoring a hidden photo only drops the marker', async () => {
    media.findUnique.mockResolvedValue({ id: 'h1', category: 'community_hidden', url: `/community/${UUID}.jpg` });
    expect((await del('h1')).status).toBe(200);
    expect(unlink).not.toHaveBeenCalled();
  });

  it('answers 404 for an unknown id', async () => {
    media.findUnique.mockResolvedValue(null);
    expect((await del('nope')).status).toBe(404);
  });
});
