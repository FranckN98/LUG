export const CONTACT_CATEGORIES = [
  "Sponsor",
  "Partner",
  "Business Tour guest",
  "Speaker / panelist",
  "Event guest",
  "Participant",
  "Institution",
  "Follow-up",
  "Other",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export const LANGUAGES = ["en", "de", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

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
  language: Language;
  subject: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  headerImageUrl: string;
  footerContact: string;
  /** Optional signature override (e.g. "Franck Ngami\nFounder, Level Up in Germany"). When empty, the localized default team signature is used. */
  signature: string;
  /** Optional footer tagline override. When empty, the localized default tagline is used. */
  tagline: string;
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

/** Known variables admins can use inside subject / body / CTA. */
export const TEMPLATE_VARIABLES = [
  "firstName",
  "lastName",
  "fullName",
  "companyName",
  "organizationName",
  "eventName",
  "eventDate",
  "eventCity",
  "eventLocation",
  "panelTopic",
  "businessField",
  "fieldOrTopic",
  "topic",
  "lastEventParticipants",
] as const;

export type TemplateVariableName = (typeof TEMPLATE_VARIABLES)[number];

/** levelupdiaspo@gmail.com is ALWAYS added to BCC and cannot be removed. */
export const MANDATORY_BCC = "levelupdiaspo@gmail.com";
