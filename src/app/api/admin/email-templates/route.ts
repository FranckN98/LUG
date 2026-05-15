import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import type { EmailTemplate, ContactCategory, Language } from "@/types/emailTemplate";
import { CONTACT_CATEGORIES, LANGUAGES } from "@/types/emailTemplate";

function toApi(row: {
  id: string; name: string; category: string; language: string; subject: string; body: string;
  ctaText: string | null; ctaLink: string | null; headerImageUrl: string | null;
  footerContact: string | null; signature: string | null; tagline: string | null; createdAt: Date; updatedAt: Date;
}): EmailTemplate {
  return {
    id: row.id,
    name: row.name,
    category: (CONTACT_CATEGORIES as readonly string[]).includes(row.category)
      ? (row.category as ContactCategory)
      : "Other",
    language: (LANGUAGES as readonly string[]).includes(row.language)
      ? (row.language as Language)
      : "en",
    subject: row.subject ?? "",
    body: row.body ?? "",
    ctaText: row.ctaText ?? "",
    ctaLink: row.ctaLink ?? "",
    headerImageUrl: row.headerImageUrl ?? "",
    footerContact: row.footerContact ?? "",
    signature: row.signature ?? "",
    tagline: row.tagline ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function normalizeCategory(raw: unknown): ContactCategory {
  if (typeof raw === "string" && (CONTACT_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as ContactCategory;
  }
  return "Other";
}

function normalizeLanguage(raw: unknown): Language {
  if (typeof raw === "string" && (LANGUAGES as readonly string[]).includes(raw)) {
    return raw as Language;
  }
  return "en";
}

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const rows = await prisma.emailTemplateRecord.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(rows.map(toApi));
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Template name is required" }, { status: 400 });
  }
  const created = await prisma.emailTemplateRecord.create({
    data: {
      name,
      category: normalizeCategory(body.category),
      language: normalizeLanguage(body.language),
      subject: typeof body.subject === "string" ? body.subject : "",
      body: typeof body.body === "string" ? body.body : "",
      ctaText: typeof body.ctaText === "string" ? body.ctaText : null,
      ctaLink: typeof body.ctaLink === "string" ? body.ctaLink : null,
      headerImageUrl: typeof body.headerImageUrl === "string" ? body.headerImageUrl : null,
      footerContact: typeof body.footerContact === "string" ? body.footerContact : null,
      signature: typeof body.signature === "string" ? body.signature : null,
      tagline: typeof body.tagline === "string" ? body.tagline : null,
    },
  });
  return NextResponse.json(toApi(created));
}

