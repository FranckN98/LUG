import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { CONTACT_CATEGORIES, LANGUAGES, type ContactCategory, type EmailTemplate, type Language } from "@/types/emailTemplate";

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

function toApi(row: {
  id: string; name: string; category: string; language: string; subject: string; body: string;
  ctaText: string | null; ctaLink: string | null; headerImageUrl: string | null;
  footerContact: string | null; createdAt: Date; updatedAt: Date;
}): EmailTemplate {
  return {
    id: row.id,
    name: row.name,
    category: normalizeCategory(row.category),
    language: normalizeLanguage(row.language),
    subject: row.subject ?? "",
    body: row.body ?? "",
    ctaText: row.ctaText ?? "",
    ctaLink: row.ctaLink ?? "",
    headerImageUrl: row.headerImageUrl ?? "",
    footerContact: row.footerContact ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await req.json().catch(() => ({}));
  try {
    const updated = await prisma.emailTemplateRecord.update({
      where: { id: params.id },
      data: {
        name: typeof body.name === "string" ? body.name.trim() : undefined,
        category: body.category !== undefined ? normalizeCategory(body.category) : undefined,
        language: body.language !== undefined ? normalizeLanguage(body.language) : undefined,
        subject: typeof body.subject === "string" ? body.subject : undefined,
        body: typeof body.body === "string" ? body.body : undefined,
        ctaText: typeof body.ctaText === "string" ? body.ctaText : undefined,
        ctaLink: typeof body.ctaLink === "string" ? body.ctaLink : undefined,
        headerImageUrl: typeof body.headerImageUrl === "string" ? body.headerImageUrl : undefined,
        footerContact: typeof body.footerContact === "string" ? body.footerContact : undefined,
      },
    });
    return NextResponse.json(toApi(updated));
  } catch {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await prisma.emailTemplateRecord.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
}
