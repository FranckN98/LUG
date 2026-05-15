import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { renderEmailHtml } from "@/lib/emailTemplateRenderer";
import { getEmailSocialLinks } from "@/lib/emailSocialLinks";
import { MANDATORY_BCC, LANGUAGES, type ContactCategory, type Language } from "@/types/emailTemplate";
import { applyVariables } from "@/lib/emailVariables";

const EMAIL_RE = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;

function parseList(input: unknown): string[] {
  if (!input) return [];
  const arr = Array.isArray(input)
    ? input
    : String(input).split(/[,;\n]+/);
  return arr
    .map((s) => String(s).trim())
    .filter((s) => s.length > 0);
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const mode: "send" | "test" = body.mode === "test" ? "test" : "send";
  const templateId: string | null = typeof body.templateId === "string" ? body.templateId : null;

  // Recipients
  const to = typeof body.to === "string" ? body.to.trim() : "";
  const cc = dedupe(parseList(body.cc));
  // Always enforce the mandatory BCC, even if admin tries to omit it.
  const bccProvided = dedupe(parseList(body.bcc));
  const bcc = dedupe([...bccProvided.filter((a) => a.toLowerCase() !== MANDATORY_BCC.toLowerCase()), MANDATORY_BCC]);

  if (!to || !EMAIL_RE.test(to)) {
    return NextResponse.json({ error: "Recipient (To) email is invalid" }, { status: 400 });
  }
  for (const addr of [...cc, ...bcc]) {
    if (!EMAIL_RE.test(addr)) {
      return NextResponse.json({ error: `Invalid email address: ${addr}` }, { status: 400 });
    }
  }

  // Template data (prefer DB record, fall back to inline payload)
  let templateData: {
    name: string;
    category: ContactCategory | string;
    language: Language;
    subject: string;
    body: string;
    ctaText: string;
    ctaLink: string;
    headerImageUrl: string;
    footerContact: string;
    signature: string;
    tagline: string;
  } | null = null;

  const variables: Record<string, string> = {};
  if (body.variables && typeof body.variables === "object") {
    for (const [k, v] of Object.entries(body.variables as Record<string, unknown>)) {
      if (typeof v === "string" && v.length > 0) variables[k] = v;
    }
  }

  const overrideLang =
    typeof body.language === "string" && (LANGUAGES as readonly string[]).includes(body.language)
      ? (body.language as Language)
      : null;

  if (templateId) {
    const row = await prisma.emailTemplateRecord.findUnique({ where: { id: templateId } });
    if (!row) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    templateData = {
      name: row.name,
      category: row.category,
      language: overrideLang ?? ((LANGUAGES as readonly string[]).includes(row.language) ? (row.language as Language) : "en"),
      subject: row.subject,
      body: row.body,
      ctaText: row.ctaText ?? "",
      ctaLink: row.ctaLink ?? "",
      headerImageUrl: row.headerImageUrl ?? "",
      footerContact: row.footerContact ?? "",
      signature: row.signature ?? "",
      tagline: row.tagline ?? "",
    };
  } else if (body.inline && typeof body.inline === "object") {
    const inlineLang =
      typeof body.inline.language === "string" && (LANGUAGES as readonly string[]).includes(body.inline.language)
        ? (body.inline.language as Language)
        : "en";
    templateData = {
      name: String(body.inline.name ?? "Untitled"),
      category: String(body.inline.category ?? "Other"),
      language: overrideLang ?? inlineLang,
      subject: String(body.inline.subject ?? ""),
      body: String(body.inline.body ?? ""),
      ctaText: String(body.inline.ctaText ?? ""),
      ctaLink: String(body.inline.ctaLink ?? ""),
      headerImageUrl: String(body.inline.headerImageUrl ?? ""),
      footerContact: String(body.inline.footerContact ?? ""),
      signature: String(body.inline.signature ?? ""),
      tagline: String(body.inline.tagline ?? ""),
    };
  }

  if (!templateData) {
    return NextResponse.json({ error: "Template payload missing" }, { status: 400 });
  }
  if (!templateData.subject.trim()) {
    return NextResponse.json({ error: "Email subject is required" }, { status: 400 });
  }

  const subjectResolved = applyVariables(templateData.subject, variables);
  const subject = mode === "test" ? `[TEST] ${subjectResolved}` : subjectResolved;

  const social = await getEmailSocialLinks();
  const html = renderEmailHtml({
    template: {
      subject: templateData.subject,
      body: templateData.body,
      ctaText: templateData.ctaText,
      ctaLink: templateData.ctaLink,
      headerImageUrl: templateData.headerImageUrl,
      footerContact: templateData.footerContact,
      signature: templateData.signature,
      tagline: templateData.tagline,
      language: templateData.language,
    },
    social,
    language: templateData.language,
    variables,
  });

  const apiKey = process.env.RESEND_API_KEY;
  // Always send from the verified Level Up in Germany address.
  // (Ignore FORMS_FROM_EMAIL on purpose so deployments can't fall back to onboarding@resend.dev.)
  const fromAddress = "Level Up in Germany <info@levelupingermany.com>";

  let status: "sent" | "failed" | "test" = mode === "test" ? "test" : "sent";
  let errorMessage: string | null = null;

  if (!apiKey) {
    status = "failed";
    errorMessage = "RESEND_API_KEY is not configured on the server";
  } else {
    try {
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: fromAddress,
        to,
        cc: cc.length ? cc : undefined,
        bcc, // always includes MANDATORY_BCC
        subject,
        html,
        replyTo: social.email || undefined,
      });
      const resendError = (result as { error?: { message?: string; name?: string; statusCode?: number } }).error;
      if (resendError) {
        status = "failed";
        errorMessage = resendError.message ?? "Unknown send error";
        console.error("[email-templates/send] Resend rejected the message", {
          from: fromAddress,
          to,
          cc,
          bcc,
          mode,
          resendError,
        });
      } else {
        console.log("[email-templates/send] Resend accepted", {
          from: fromAddress,
          to,
          mode,
          id: (result as { data?: { id?: string } }).data?.id,
        });
      }
    } catch (err) {
      status = "failed";
      errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[email-templates/send] Resend threw", {
        from: fromAddress,
        to,
        cc,
        bcc,
        mode,
        error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
      });
    }
  }

  // Log to history (always, including failures)
  const historyRow = await prisma.emailSendHistoryRecord.create({
    data: {
      templateId: templateId || null,
      toAddress: to,
      ccAddresses: cc.join(", ") || null,
      bccAddresses: bcc.join(", ") || null,
      subject,
      category: String(templateData.category),
      status,
      errorMessage,
    },
  });

  if (status === "failed") {
    return NextResponse.json(
      { ok: false, error: errorMessage, historyId: historyRow.id },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, historyId: historyRow.id, mode });
}
