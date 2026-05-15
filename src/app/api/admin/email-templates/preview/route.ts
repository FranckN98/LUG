import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { renderEmailHtml } from "@/lib/emailTemplateRenderer";
import { getEmailSocialLinks } from "@/lib/emailSocialLinks";

/** Server-side renders the email HTML for preview. Admin only. */
export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await req.json().catch(() => ({}));
  const t = body.template || {};
  const social = await getEmailSocialLinks();
  const html = renderEmailHtml({
    template: {
      subject: String(t.subject ?? ""),
      body: String(t.body ?? ""),
      ctaText: String(t.ctaText ?? ""),
      ctaLink: String(t.ctaLink ?? ""),
      headerImageUrl: String(t.headerImageUrl ?? ""),
      footerContact: String(t.footerContact ?? ""),
    },
    social,
  });
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
