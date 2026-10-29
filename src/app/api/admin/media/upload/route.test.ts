import { beforeEach, describe, expect, it, vi } from 'vitest';

const media = vi.hoisted(() => ({ create: vi.fn() }));
const save = vi.hoisted(() => vi.fn());
vi.mock('@/lib/prisma', () => ({ prisma: { media } }));
vi.mock('@/lib/adminAuth', () => ({ requireAdmin: () => null }));
vi.mock('@/lib/mediaStorage', () => ({ saveMediaFile: save }));
vi.mock('@/lib/heroSync', () => ({ syncHeroMediaToSlides: vi.fn().mockResolvedValue(0) }));

import { POST } from './route';

function upload(file: File, category = 'general') {
  const body = new FormData();
  body.append('file', file);
  body.append('category', category);
  return POST(new Request('http://localhost/api/admin/media/upload', { method: 'POST', body }));
}

describe('POST /api/admin/media/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    save.mockResolvedValue('/media/saved.jpg');
    media.create.mockImplementation(async ({ data }) => ({ id: 'm1', createdAt: new Date('2026-01-01'), ...data }));
  });

  it('accepts a photo whose browser type is empty by using the extension', async () => {
    const res = await upload(new File(['x'], 'Photo.JPG', { type: '' }));
    expect(res.status).toBe(201);
    expect(save.mock.calls[0]![1]).toMatch(/\.jpg$/);
    expect(media.create.mock.calls[0]![0].data.mimeType).toBe('image/jpeg');
  });

  it('explains why HEIC photos are refused', async () => {
    const res = await upload(new File(['x'], 'IMG_1.HEIC', { type: 'image/heic' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/HEIC/);
    expect(save).not.toHaveBeenCalled();
  });

  it('stores community photos in the community folder', async () => {
    await upload(new File(['x'], 'a.png', { type: 'image/png' }), 'community');
    expect(save.mock.calls[0]![2]).toBe('community');
  });

  it('answers with JSON when the storage fails', async () => {
    save.mockRejectedValue(new Error('EROFS'));
    const res = await upload(new File(['x'], 'a.png', { type: 'image/png' }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/stockage/i);
  });
});
