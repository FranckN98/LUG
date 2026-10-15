import { afterEach, describe, expect, it } from 'vitest';
import { getLemfiPublicSettings, LEMFI_DEFAULT_PARTNER_URL } from './lemfiContest';

const original = process.env.LEMFI_PARTNER_URL;

afterEach(() => {
  if (original === undefined) delete process.env.LEMFI_PARTNER_URL;
  else process.env.LEMFI_PARTNER_URL = original;
});

describe('LemFi partner link', () => {
  it('defaults to the official referral link', () => {
    delete process.env.LEMFI_PARTNER_URL;
    expect(LEMFI_DEFAULT_PARTNER_URL).toBe('https://referral.lemfi.com/hKwsPoVa66b');
    expect(getLemfiPublicSettings().partnerUrl).toBe(LEMFI_DEFAULT_PARTNER_URL);
  });

  it('can be overridden by LEMFI_PARTNER_URL', () => {
    process.env.LEMFI_PARTNER_URL = 'https://example.com/ref/abc';
    expect(getLemfiPublicSettings().partnerUrl).toBe('https://example.com/ref/abc');
  });

  it('ignores an unsafe or malformed override', () => {
    for (const bad of ['javascript:alert(1)', 'not a url', '   ']) {
      process.env.LEMFI_PARTNER_URL = bad;
      expect(getLemfiPublicSettings().partnerUrl).toBe(LEMFI_DEFAULT_PARTNER_URL);
    }
  });
});
