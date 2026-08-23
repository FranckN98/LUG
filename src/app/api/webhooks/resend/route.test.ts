import { describe, it, expect } from 'vitest';
import { extractCampaignId } from './route';

describe('extractCampaignId', () => {
  it('reads campaign_id from an array-shaped tags payload', () => {
    const id = extractCampaignId({
      tags: [
        { name: 'campaign_id', value: 'camp_123' },
        { name: 'other', value: 'x' },
      ],
    });
    expect(id).toBe('camp_123');
  });

  it('reads campaign_id from an object-shaped tags payload', () => {
    const id = extractCampaignId({ tags: { campaign_id: 'camp_456' } });
    expect(id).toBe('camp_456');
  });

  it('returns undefined when tags are missing', () => {
    expect(extractCampaignId(undefined)).toBeUndefined();
    expect(extractCampaignId({})).toBeUndefined();
  });

  it('returns undefined when the campaign_id tag is absent', () => {
    expect(extractCampaignId({ tags: [{ name: 'other', value: 'x' }] })).toBeUndefined();
    expect(extractCampaignId({ tags: { other: 'x' } })).toBeUndefined();
  });
});
