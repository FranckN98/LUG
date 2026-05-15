export const CONTACT_CATEGORIES = [
  "Sponsor",
  "Partner",
  "Business Tour guest",
  "Speaker / panelist",
  "Event guest",
  "Participant",
  "Institution",
  "Other",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export interface SocialLinks {
  website: string;
  linkedin: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
  email: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: ContactCategory;
  subject: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  headerImageUrl: string;
  footerContact: string;
  updatedAt: string;
  createdAt: string;
}

export interface EmailSendHistory {
  id: string;
  templateId: string | null;
  to: string;
  cc: string[];
  bcc: string[];
  subject: string;
  category: ContactCategory | string;
  sentAt: string;
  status: "sent" | "failed" | "test";
  errorMessage?: string | null;
}

/** levelupdiaspo@gmail.com is ALWAYS added to BCC and cannot be removed. */
export const MANDATORY_BCC = "levelupdiaspo@gmail.com";
