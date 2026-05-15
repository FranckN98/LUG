import { prisma } from "@/lib/prisma";
import type { SocialLinks } from "@/types/emailTemplate";
import socialLinksSeed from "@/data/socialLinks.json";

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  website: "https://www.levelupingermany.com",
  linkedin: "https://www.linkedin.com/company/level-up-in-germany/",
  instagram: "https://www.instagram.com/levelupingermany/",
  tiktok: "https://www.tiktok.com/@levelupingermany",
  youtube: "",
  whatsapp: "",
  email: "contact@levelupingermany.com",
  ...(socialLinksSeed as Partial<SocialLinks>),
};

/** Get social links from DB, seeding the singleton row if missing. */
export async function getEmailSocialLinks(): Promise<SocialLinks> {
  let row = await prisma.emailSocialLinks.findUnique({ where: { id: 1 } });
  if (!row) {
    row = await prisma.emailSocialLinks.create({
      data: { id: 1, ...DEFAULT_SOCIAL_LINKS },
    });
  }
  return {
    website: row.website || "",
    linkedin: row.linkedin || "",
    instagram: row.instagram || "",
    tiktok: row.tiktok || "",
    youtube: row.youtube || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
  };
}

export async function updateEmailSocialLinks(input: Partial<SocialLinks>): Promise<SocialLinks> {
  const current = await getEmailSocialLinks();
  const merged: SocialLinks = { ...current, ...input };
  await prisma.emailSocialLinks.update({
    where: { id: 1 },
    data: merged,
  });
  return merged;
}
