import { describe, it, expect } from 'vitest';
import { buildListUnsubscribeHeaders } from './sendCampaignEmail';

describe('buildListUnsubscribeHeaders', () => {
  it('wraps the URL in angle brackets per RFC 8058', () => {
    const headers = buildListUnsubscribeHeaders('https://www.levelupingermany.com/api/unsubscribe?token=abc123');
    expect(headers['List-Unsubscribe']).toBe(
      '<https://www.levelupingermany.com/api/unsubscribe?token=abc123>',
    );
  });

  it('always includes the one-click List-Unsubscribe-Post header', () => {
    const headers = buildListUnsubscribeHeaders('https://example.com/unsub');
    expect(headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });

  it('returns exactly the two required headers', () => {
    const headers = buildListUnsubscribeHeaders('https://example.com/unsub');
    expect(Object.keys(headers).sort()).toEqual(['List-Unsubscribe', 'List-Unsubscribe-Post']);
  });
});
