import { describe, expect, it } from 'vitest';
import {
  cleanPersonName,
  cleanPrizeName,
  detectProofMime,
  escapeHtml,
  formatLemfiNumber,
  isValidEmail,
  isValidSubmissionKey,
  normalizeEmail,
  parseNumberQuery,
  pickRandom,
} from './lemfiContestUtils';

describe('prize draw helpers', () => {
  it('draws distinct items and never more than available', () => {
    const items = [1, 2, 3, 4, 5];
    const rng = (max: number) => Math.floor(Math.random() * max);
    for (let i = 0; i < 200; i++) {
      const picked = pickRandom(items, 3, rng);
      expect(picked).toHaveLength(3);
      expect(new Set(picked).size).toBe(3);
    }
    expect(pickRandom(items, 99, rng).sort()).toEqual(items);
    expect(pickRandom(items, 0, rng)).toEqual([]);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it('is uniform for a single draw', () => {
    const rng = (max: number) => Math.floor(Math.random() * max);
    const hits = [0, 0, 0, 0];
    for (let i = 0; i < 20000; i++) hits[pickRandom([0, 1, 2, 3], 1, rng)[0]!]!++;
    for (const h of hits) expect(h).toBeGreaterThan(4500);
  });

  it('cleans prize names', () => {
    expect(cleanPrizeName('  Tablette   Samsung ')).toBe('Tablette Samsung');
    expect(cleanPrizeName('')).toBeNull();
    expect(cleanPrizeName('   ')).toBeNull();
    expect(cleanPrizeName('x'.repeat(61))).toBeNull();
    expect(cleanPrizeName('a\u0000b')).toBeNull();
    expect(cleanPrizeName(42)).toBeNull();
  });
});

describe('lemfi numbers', () => {
  it('formats and parses LU numbers', () => {
    expect(formatLemfiNumber(200)).toBe('LU200');
    expect(parseNumberQuery('LU215')).toBe(215);
    expect(parseNumberQuery(' lu 350 ')).toBe(350);
    expect(parseNumberQuery('215')).toBe(215);
    expect(parseNumberQuery('LU21')).toBeNull();
    expect(parseNumberQuery('martin')).toBeNull();
  });
});

describe('lemfi field validation', () => {
  it('accepts real names, rejects markup and digits', () => {
    expect(cleanPersonName("  Jean-Éric   N'Gami ")).toBe("Jean-Éric N'Gami");
    expect(cleanPersonName('Zoë')).toBe('Zoë');
    expect(cleanPersonName('<script>')).toBeNull();
    expect(cleanPersonName('R2D2')).toBeNull();
    expect(cleanPersonName('   ')).toBeNull();
    expect(cleanPersonName('a'.repeat(61))).toBeNull();
  });

  it('validates e-mail addresses after normalisation', () => {
    expect(normalizeEmail('  Foo@Bar.COM ')).toBe('foo@bar.com');
    expect(isValidEmail('foo@bar.com')).toBe(true);
    expect(isValidEmail('foo@bar')).toBe(false);
    expect(isValidEmail('foo bar@x.com')).toBe(false);
    expect(isValidEmail('<a>@x.com')).toBe(false);
  });

  it('validates the idempotency key shape', () => {
    expect(isValidSubmissionKey('a1b2c3d4-e5f6-4789-a012-3456789abcde')).toBe(true);
    expect(isValidSubmissionKey('short')).toBe(false);
    expect(isValidSubmissionKey(undefined)).toBe(false);
  });
});

describe('proof file type detection', () => {
  it('detects jpeg, png and webp by signature', () => {
    expect(detectProofMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0]))).toBe('image/jpeg');
    expect(detectProofMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('image/png');
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]);
    expect(detectProofMime(webp)).toBe('image/webp');
  });

  it('rejects a script or SVG renamed to .png', () => {
    expect(detectProofMime(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(detectProofMime(new TextEncoder().encode('GIF89a......'))).toBeNull();
    expect(detectProofMime(new Uint8Array([]))).toBeNull();
  });
});

describe('escapeHtml', () => {
  it('neutralises markup in user supplied text', () => {
    expect(escapeHtml('<img src=x onerror="a()">&')).toBe('&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;');
  });
});
