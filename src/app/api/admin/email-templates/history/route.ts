import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import type { EmailSendHistory } from "@/types/emailTemplate";

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const rows = await prisma.emailSendHistoryRecord.findMany({
    orderBy: { sentAt: "desc" },
    take: 200,
  });
  const out: EmailSendHistory[] = rows.map((r) => ({
    id: r.id,
    templateId: r.templateId,
    to: r.toAddress,
    cc: r.ccAddresses ? r.ccAddresses.split(",").map((s) => s.trim()).filter(Boolean) : [],
    bcc: r.bccAddresses ? r.bccAddresses.split(",").map((s) => s.trim()).filter(Boolean) : [],
    subject: r.subject,
    category: r.category,
    sentAt: r.sentAt.toISOString(),
    status: (r.status as "sent" | "failed" | "test"),
    errorMessage: r.errorMessage,
  }));
  return NextResponse.json(out);
}
