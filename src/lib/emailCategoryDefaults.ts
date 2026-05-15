import type { ContactCategory } from "@/types/emailTemplate";

export interface CategoryDefaults {
  subject: string;
  body: string;
  ctaText: string;
  ctaLink: string;
}

/** Smart starter content per category. Used when admin creates a brand new template. */
export const CATEGORY_DEFAULTS: Record<ContactCategory, CategoryDefaults> = {
  Sponsor: {
    subject: "Partnering with Level Up in Germany — Sponsorship Opportunity",
    body: `Dear [Recipient Name],

I hope this message finds you well. I am reaching out on behalf of Level Up in Germany, a platform empowering the African diaspora and international talents across Germany through events, mentorship and high-impact networking.

We are preparing our upcoming flagship event and are inviting a select group of sponsors whose values align with ours. Becoming a sponsor would give your brand premium visibility in front of an engaged community of professionals, entrepreneurs and decision-makers.

I would love to share our sponsorship deck and discuss the package that best fits your goals.`,
    ctaText: "View Sponsorship Package",
    ctaLink: "https://www.levelupingermany.com",
  },
  Partner: {
    subject: "Strategic Partnership with Level Up in Germany",
    body: `Dear [Recipient Name],

I am reaching out from Level Up in Germany to explore a strategic partnership between our organisations. Our mission is to bridge talents, businesses and institutions to accelerate impact across Germany and Europe.

A collaboration with you would create real value for both our communities — through co-branded programmes, content, or events.

Could we book a short 20-minute call next week to explore this?`,
    ctaText: "Schedule a Call",
    ctaLink: "https://www.levelupingermany.com/contact",
  },
  "Business Tour guest": {
    subject: "Invitation — Level Up Business Tour",
    body: `Dear [Recipient Name],

It is my pleasure to invite you to join the upcoming Level Up Business Tour — an exclusive programme connecting visionary entrepreneurs, investors and changemakers across key German business hubs.

This curated experience includes site visits, executive roundtables and private networking moments designed for serious operators.

Spots are limited and assigned by invitation only.`,
    ctaText: "Reserve My Seat",
    ctaLink: "https://www.levelupingermany.com",
  },
  "Speaker / panelist": {
    subject: "Speaker Invitation — Level Up in Germany",
    body: `Dear [Recipient Name],

On behalf of the Level Up in Germany team, I would be honoured to invite you to join us as a speaker / panelist at our upcoming event.

Your expertise and journey would inspire our community of professionals, students and entrepreneurs. We will take care of all logistics and provide premium visibility before, during and after the event.

Please let me know if you would be open to a brief call to share more details.`,
    ctaText: "Confirm My Participation",
    ctaLink: "https://www.levelupingermany.com",
  },
  "Event guest": {
    subject: "You are invited — Level Up in Germany Event",
    body: `Dear [Recipient Name],

We would be delighted to welcome you to our upcoming Level Up in Germany event. It will be an evening of meaningful conversations, inspiring speakers and unique connections with leaders from across our ecosystem.

Your presence would mean a lot to us.`,
    ctaText: "RSVP Now",
    ctaLink: "https://www.levelupingermany.com",
  },
  Participant: {
    subject: "Welcome to Level Up in Germany — Next Steps",
    body: `Dear [Recipient Name],

Thank you for registering with Level Up in Germany. We are thrilled to have you in our community.

Below you will find the next steps and key information to make the most of your participation. If you have any question, simply reply to this email.`,
    ctaText: "Access My Dashboard",
    ctaLink: "https://www.levelupingermany.com",
  },
  Institution: {
    subject: "Collaboration with Level Up in Germany",
    body: `Dear [Recipient Name],

I am writing on behalf of Level Up in Germany to introduce our work and explore a possible collaboration with your institution.

We connect international talents, entrepreneurs and partners across Germany through programmes that have impact at scale. I believe an aligned initiative between our teams could unlock meaningful value for the populations you serve.

Would you be available for a short introductory call?`,
    ctaText: "Schedule a Meeting",
    ctaLink: "https://www.levelupingermany.com/contact",
  },
  Other: {
    subject: "A note from Level Up in Germany",
    body: `Dear [Recipient Name],

Thank you for connecting with Level Up in Germany.`,
    ctaText: "Visit Our Website",
    ctaLink: "https://www.levelupingermany.com",
  },
};
