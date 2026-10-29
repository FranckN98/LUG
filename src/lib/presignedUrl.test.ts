import { describe, expect, it } from 'vitest';
import { isExpiredPresignedUrl, isPresignedS3Url, presignedExpiry } from './presignedUrl';

const signed =
  'https://levelup-picture.s3.eu-north-1.amazonaws.com/hero-pic/_DSC9034.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260419T231508Z&X-Amz-Expires=300&X-Amz-Signature=abc';

describe('presignedUrl', () => {
  it('recognises signed S3 links only', () => {
    expect(isPresignedS3Url(signed)).toBe(true);
    expect(isPresignedS3Url('https://levelup-picture.s3.eu-north-1.amazonaws.com/hero-pic/a.jpg')).toBe(false);
    expect(isPresignedS3Url('https://example.com/a.jpg?X-Amz-Signature=abc')).toBe(false);
    expect(isPresignedS3Url('http://bucket.s3.amazonaws.com/a.jpg?X-Amz-Signature=abc')).toBe(false);
    expect(isPresignedS3Url('/media/a.jpg')).toBe(false);
  });

  it('computes the expiry of a SigV4 link', () => {
    expect(presignedExpiry(signed)?.toISOString()).toBe('2026-04-19T23:20:08.000Z');
    expect(presignedExpiry('https://x.s3.amazonaws.com/a.jpg')).toBeNull();
  });

  it('computes the expiry of a SigV2 link', () => {
    expect(presignedExpiry('https://x.s3.amazonaws.com/a.jpg?Signature=s&Expires=1800000000')?.getTime()).toBe(1800000000000);
  });

  it('flags expired links and ignores everything else', () => {
    expect(isExpiredPresignedUrl(signed, new Date('2026-04-19T23:19:00Z'))).toBe(false);
    expect(isExpiredPresignedUrl(signed, new Date('2026-04-19T23:21:00Z'))).toBe(true);
    expect(isExpiredPresignedUrl('/media/a.jpg')).toBe(false);
    expect(isExpiredPresignedUrl('https://cdn.example.com/a.jpg')).toBe(false);
  });
});
