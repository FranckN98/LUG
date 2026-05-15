import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getEmailSocialLinks, updateEmailSocialLinks } from "@/lib/emailSocialLinks";

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const links = await getEmailSocialLinks();
  return NextResponse.json(links);
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await req.json().catch(() => ({}));
  const allowed = ["website", "linkedin", "instagram", "tiktok", "youtube", "whatsapp", "email"] as const;
  const patch: Record<string, string> = {};
  for (const key of allowed) {
    if (typeof body[key] === "string") {
      patch[key] = (body[key] as string).trim();
    }
  }
  const updated = await updateEmailSocialLinks(patch);
  return NextResponse.json(updated);
}
