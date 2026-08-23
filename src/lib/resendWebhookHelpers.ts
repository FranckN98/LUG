export type ResendWebhookEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[];
    tags?: Record<string, string> | Array<{ name: string; value: string }>;
    bounce?: { type?: string; subType?: string; message?: string };
  };
};

export function extractCampaignId(data: ResendWebhookEvent['data']): string | undefined {
  const tags = data?.tags;
  if (!tags) return undefined;
  if (Array.isArray(tags)) {
    return tags.find((t) => t.name === 'campaign_id')?.value;
  }
  return tags.campaign_id;
}
