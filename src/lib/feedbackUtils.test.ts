import { describe, expect, it } from 'vitest';
import {
  berlinDay,
  CODE_ALPHABET,
  CODE_LENGTH,
  csvCell,
  formatCode,
  generateCode,
  hashCode,
  normalizeCode,
  parseFeedbackBody,
  parseFeedbackFilters,
  toCsv,
} from './feedbackUtils';

const base = { code: 'abcde-fghjk', rating: 4 };

describe('feedback codes', () => {
  it('generates codes from the safe alphabet', () => {
    const rng = (max: number) => Math.floor(Math.random() * max);
    for (let i = 0; i < 200; i++) {
      const code = generateCode(rng);
      expect(code).toHaveLength(CODE_LENGTH);
      for (const ch of code) expect(CODE_ALPHABET).toContain(ch);
    }
    expect(CODE_ALPHABET).not.toMatch(/[ILO01]/);
  });

  it('normalizes what people type and rejects the rest', () => {
    expect(normalizeCode(' abcde-fghjk ')).toBe('ABCDEFGHJK');
    expect(normalizeCode('ABCDE FGHJK')).toBe('ABCDEFGHJK');
    expect(normalizeCode('ABCDE-FGHJ')).toBeNull();
    expect(normalizeCode('ABCDE-FGHJI')).toBeNull();
    expect(normalizeCode('ABCDE-FGHJ0')).toBeNull();
    expect(normalizeCode(12345)).toBeNull();
    expect(formatCode('ABCDEFGHJK')).toBe('ABCDE-FGHJK');
  });

  it('hashes deterministically, never stores the code itself', () => {
    expect(hashCode('ABCDEFGHJK', '')).toBe(hashCode('ABCDEFGHJK', ''));
    expect(hashCode('ABCDEFGHJK', '')).not.toBe(hashCode('ABCDEFGHJM', ''));
    expect(hashCode('ABCDEFGHJK', 'pepper')).not.toBe(hashCode('ABCDEFGHJK', ''));
    expect(hashCode('ABCDEFGHJK', '')).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('berlinDay', () => {
  it('keeps only the Berlin calendar day, at UTC midnight', () => {
    expect(berlinDay(new Date('2026-10-17T21:59:00Z')).toISOString()).toBe('2026-10-17T00:00:00.000Z');
    expect(berlinDay(new Date('2026-10-17T22:30:00Z')).toISOString()).toBe('2026-10-18T00:00:00.000Z');
    expect(berlinDay(new Date('2026-12-31T23:30:00Z')).toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });
});

describe('parseFeedbackBody', () => {
  it('accepts an anonymous answer with only a rating', () => {
    const r = parseFeedbackBody(base);
    expect(r).toEqual({
      ok: true,
      value: {
        code: 'ABCDEFGHJK',
        rating: 4,
        highlights: null,
        likesAndImprovements: null,
        wantedSpeakers: null,
        wantedTopics: null,
        isSigned: false,
        firstName: null,
        lastName: null,
        news: null,
      },
    });
  });

  it('discards names unless the person chose to sign', () => {
    const r = parseFeedbackBody({ ...base, firstName: 'Awa', lastName: 'Diallo', sign: false });
    expect(r.ok && [r.value.isSigned, r.value.firstName, r.value.lastName]).toEqual([false, null, null]);
  });

  it('signs with one or two names, never requires them', () => {
    const both = parseFeedbackBody({ ...base, sign: true, firstName: ' Awa ', lastName: 'Diallo' });
    expect(both.ok && [both.value.isSigned, both.value.firstName, both.value.lastName]).toEqual([true, 'Awa', 'Diallo']);
    const empty = parseFeedbackBody({ ...base, sign: true, firstName: '', lastName: '   ' });
    expect(empty.ok && [empty.value.isSigned, empty.value.firstName]).toEqual([false, null]);
  });

  it('keeps the newsletter signup apart and requires a valid e-mail only when opted in', () => {
    expect(parseFeedbackBody({ ...base, news: false, newsEmail: 'not-an-email' }).ok).toBe(true);
    expect(parseFeedbackBody({ ...base, news: true, newsEmail: '' })).toMatchObject({ ok: false, code: 'email', field: 'newsEmail' });
    expect(parseFeedbackBody({ ...base, news: true, newsEmail: 'nope' })).toMatchObject({ ok: false, code: 'email' });
    const ok = parseFeedbackBody({ ...base, news: true, newsEmail: ' Awa@Example.COM ', newsFirstName: 'Awa' });
    expect(ok.ok && ok.value.news).toEqual({ email: 'awa@example.com', firstName: 'Awa', lastName: null });
  });

  it('rejects invalid input with a field', () => {
    expect(parseFeedbackBody(null)).toMatchObject({ ok: false, code: 'invalid' });
    expect(parseFeedbackBody({ rating: 4 })).toMatchObject({ ok: false, code: 'code', field: 'code' });
    expect(parseFeedbackBody({ ...base, code: 'ABC' })).toMatchObject({ ok: false, code: 'codeFormat' });
    for (const rating of [0, 6, 2.5, '4', null]) {
      expect(parseFeedbackBody({ ...base, rating })).toMatchObject({ ok: false, code: 'rating', field: 'rating' });
    }
    expect(parseFeedbackBody({ ...base, highlights: 'x'.repeat(2001) })).toMatchObject({ ok: false, code: 'tooLong', field: 'highlights' });
    expect(parseFeedbackBody({ ...base, wantedTopics: 'x'.repeat(1001) })).toMatchObject({ ok: false, code: 'tooLong', field: 'wantedTopics' });
    expect(parseFeedbackBody({ ...base, sign: true, firstName: '<script>' })).toMatchObject({ ok: false, code: 'name', field: 'firstName' });
  });

  it('cleans free text', () => {
    const r = parseFeedbackBody({ ...base, highlights: '  Super\r\nsoirée\u0000 ', wantedSpeakers: '   ' });
    expect(r.ok && [r.value.highlights, r.value.wantedSpeakers]).toEqual(['Super\nsoirée', null]);
  });
});

describe('parseFeedbackFilters', () => {
  it('keeps only valid values', () => {
    const f = parseFeedbackFilters(
      new URLSearchParams('rating=5&from=2026-10-17&to=2026-13-40&signed=anonymous&q=%20lieu%20&tag=not-a-uuid'),
    );
    expect(f).toEqual({ rating: 5, from: '2026-10-17', signed: 'anonymous', q: 'lieu' });
    expect(parseFeedbackFilters(new URLSearchParams('rating=9&signed=x'))).toEqual({});
  });
});

describe('csv', () => {
  it('neutralizes spreadsheet formulas and escapes separators', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+33 1')).toBe("'+33 1");
    expect(csvCell('@a')).toBe("'@a");
    expect(csvCell('a;b')).toBe('"a;b"');
    expect(csvCell('ligne 1\nligne 2')).toBe('"ligne 1\nligne 2"');
    expect(csvCell(null)).toBe('');
    expect(csvCell(4)).toBe('4');
  });

  it('writes a BOM, semicolons and CRLF', () => {
    expect(toCsv(['A', 'B'], [[1, 'x;y']])).toBe('\uFEFFA;B\r\n1;"x;y"\r\n');
  });
});
