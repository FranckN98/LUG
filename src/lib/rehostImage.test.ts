import { beforeEach, describe, expect, it, vi } from 'vitest';

const save = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mediaStorage', () => ({ saveMediaFile: save }));

import { RehostError, rehostPresignedImage } from './rehostImage';

const base = 'https://bucket.s3.eu-north-1.amazonaws.com/hero-pic/photo.JPG';
const fresh = () => {
  const d = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  return `${base}?X-Amz-Date=${d}&X-Amz-Expires=300&X-Amz-Signature=abc`;
};

const response = (status: number, type: string, body = 'img') =>
  new Response(body, { status, headers: { 'content-type': type } });

describe('rehostPresignedImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    save.mockReset();
    save.mockResolvedValue('/media/new.jpg');
  });

  it('stores the downloaded image and returns the permanent URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(200, 'image/jpeg'));
    const result = await rehostPresignedImage(fresh());
    expect(result).toMatchObject({ url: '/media/new.jpg', filename: 'photo.JPG', mimeType: 'image/jpeg' });
    expect(save.mock.calls[0]![1]).toMatch(/\.jpg$/);
    expect(save.mock.calls[0]![2]).toBe('media');
  });

  it('falls back to the file extension when S3 sends no image type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(200, 'binary/octet-stream'));
    expect((await rehostPresignedImage(fresh(), 'community')).mimeType).toBe('image/jpeg');
    expect(save.mock.calls[0]![2]).toBe('community');
  });

  it('refuses an expired link without calling S3', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    const expired = `${base}?X-Amz-Date=20200101T000000Z&X-Amz-Expires=300&X-Amz-Signature=abc`;
    await expect(rehostPresignedImage(expired)).rejects.toBeInstanceOf(RehostError);
    expect(spy).not.toHaveBeenCalled();
  });

  it('explains a 403 and rejects non-image content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response(403, 'application/xml'));
    await expect(rehostPresignedImage(fresh())).rejects.toThrow(/403/);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response(200, 'application/pdf'));
    await expect(rehostPresignedImage(fresh().replace('photo.JPG', 'doc.pdf'))).rejects.toThrow(/Format/);
    expect(save).not.toHaveBeenCalled();
  });
});
