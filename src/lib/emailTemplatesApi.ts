import type {
  EmailTemplate,
  EmailSendHistory,
  SocialLinks,
} from "@/types/emailTemplate";

const BASE = "/api/admin/email-templates";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  return jsonOrThrow(await fetch(BASE, { cache: "no-store" }));
}

export async function createEmailTemplate(
  template: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">,
): Promise<EmailTemplate> {
  return jsonOrThrow(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    }),
  );
}

export async function updateEmailTemplate(template: EmailTemplate): Promise<EmailTemplate> {
  return jsonOrThrow(
    await fetch(`${BASE}/${encodeURIComponent(template.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    }),
  );
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Delete failed (${res.status})`);
  }
}

export interface SendEmailInput {
  templateId?: string | null;
  inline?: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">;
  to: string;
  cc: string[];
  bcc: string[];
  mode?: "send" | "test";
  language?: string;
  variables?: Record<string, string>;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; historyId: string }> {
  return jsonOrThrow(
    await fetch(`${BASE}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function fetchEmailHistory(): Promise<EmailSendHistory[]> {
  return jsonOrThrow(await fetch(`${BASE}/history`, { cache: "no-store" }));
}

export async function fetchEmailSocialLinks(): Promise<SocialLinks> {
  return jsonOrThrow(await fetch(`${BASE}/social-links`, { cache: "no-store" }));
}

export async function updateEmailSocialLinks(patch: Partial<SocialLinks>): Promise<SocialLinks> {
  return jsonOrThrow(
    await fetch(`${BASE}/social-links`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }),
  );
}

export async function fetchEmailPreviewHtml(
  template: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">,
  variables: Record<string, string> = {},
): Promise<string> {
  const res = await fetch(`${BASE}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template, variables, language: template.language }),
  });
  if (!res.ok) throw new Error(`Preview failed (${res.status})`);
  return res.text();
}
