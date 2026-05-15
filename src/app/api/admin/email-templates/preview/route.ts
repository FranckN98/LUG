import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { renderEmailHtml } from "@/lib/emailTemplateRenderer";
import { getEmailSocialLinks } from "@/lib/emailSocialLinks";
import { LANGUAGES, type Language } from "@/types/emailTemplate";

/** Server-side renders the email HTML for preview. Admin only. */
export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await req.json().catch(() => ({}));
  const t = body.template || {};
  const language: Language =
    typeof t.language === "string" && (LANGUAGES as readonly string[]).includes(t.language)
      ? (t.language as Language)
      : typeof body.language === "string" && (LANGUAGES as readonly string[]).includes(body.language)
        ? (body.language as Language)
        : "en";

  const variables: Record<string, string> = {};
  if (body.variables && typeof body.variables === "object") {
    for (const [k, v] of Object.entries(body.variables as Record<string, unknown>)) {
      if (typeof v === "string" && v.length > 0) variables[k] = v;
    }
  }

  const social = await getEmailSocialLinks();
  const html = renderEmailHtml({
    template: {
      subject: String(t.subject ?? ""),
      body: String(t.body ?? ""),
      ctaText: String(t.ctaText ?? ""),
      ctaLink: String(t.ctaLink ?? ""),
      headerImageUrl: String(t.headerImageUrl ?? ""),
      footerContact: String(t.footerContact ?? ""),
      signature: String(t.signature ?? ""),
      tagline: String(t.tagline ?? ""),
      language,
    },
    social,
    language,
    variables,
  });
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
