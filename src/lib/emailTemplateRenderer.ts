import type { EmailTemplate, Language, SocialLinks } from "@/types/emailTemplate";
import { FOOTER_COPY } from "@/lib/emailCategoryTemplates";
import { applyVariables, buildSocialVariableBag } from "@/lib/emailVariables";

/** Brand palette mirrored from tailwind.config.ts so HTML email matches the site. */
const BRAND = {
  primary: "#8C1A1A",
  primaryDark: "#6b1414",
  accent: "#E98C0B",
  accentDark: "#c77409",
  dark: "#1A1A1A",
  grey: "#C2C2C2",
  bg: "#f6f3ee",
  card: "#ffffff",
  text: "#2a1f1f",
  muted: "#6b5e5e",
  border: "#ebe3d8",
};

function esc(value: string | undefined | null): string {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** If body already looks like HTML, keep as-is; otherwise wrap paragraphs. */
function renderBody(body: string): string {
  if (!body) return "";
  const trimmed = body.trim();
  if (/<\/?(p|div|h[1-6]|ul|ol|li|br|a|strong|em|table|img|span)\b/i.test(trimmed)) {
    return trimmed;
  }
  return trimmed
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 16px;line-height:1.7;color:${BRAND.text};font-size:16px;">${esc(para).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function socialLink(label: string, url: string): string {
  if (!url) return "";
  return `<a href="${esc(url)}" style="display:inline-block;margin:0 10px 6px 0;color:${BRAND.primary};font-size:13px;font-weight:600;text-decoration:none;letter-spacing:.02em;">${esc(label)}</a>`;
}

export interface RenderEmailOptions {
  template: Pick<EmailTemplate, "subject" | "body" | "ctaText" | "ctaLink" | "headerImageUrl" | "footerContact"> & {
    language?: Language;
  };
  social: SocialLinks;
  siteBaseUrl?: string;
  /** User-provided variable values (e.g. firstName, eventDate). Social URLs are auto-injected. */
  variables?: Record<string, string>;
  /** Optional explicit language override (otherwise read from template.language). */
  language?: Language;
}

export function renderEmailHtml({
  template,
  social,
  siteBaseUrl = "https://www.levelupingermany.com",
  variables = {},
  language,
}: RenderEmailOptions): string {
  const lang: Language = (language ?? template.language ?? "en") as Language;
  const vars: Record<string, string> = { ...buildSocialVariableBag(social), ...variables };
  const subject = applyVariables(template.subject || "", vars);
  const ctaTextRaw = applyVariables(template.ctaText || "", vars);
  const ctaLinkRaw = applyVariables(template.ctaLink || "", vars);
  const bodyRaw = applyVariables(template.body || "", vars);
  vars.ctaButtonText = ctaTextRaw;
  vars.ctaButtonLink = ctaLinkRaw;
  const headerImage = template.headerImageUrl?.trim() || `${siteBaseUrl}/logo.png`;
  const ctaText = ctaTextRaw.trim();
  const ctaLink = ctaLinkRaw.trim();
  const bodyHtml = renderBody(bodyRaw);
  const footer = FOOTER_COPY[lang] ?? FOOTER_COPY.en;

  const ctaBlock = ctaText && ctaLink
    ? `
      <tr>
        <td align="center" style="padding:8px 32px 32px;">
          <a href="${esc(ctaLink)}" style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:.02em;box-shadow:0 8px 24px rgba(233,140,11,.28);">${esc(ctaText)}</a>
        </td>
      </tr>`
    : "";

  const socialRow = [
    socialLink("Website", social.website),
    socialLink("LinkedIn", social.linkedin),
    socialLink("Instagram", social.instagram),
    socialLink("TikTok", social.tiktok),
    social.youtube ? socialLink("YouTube", social.youtube) : "",
    social.whatsapp ? socialLink("WhatsApp", social.whatsapp) : "",
    social.email ? socialLink("Email", `mailto:${social.email}`) : "",
  ].filter(Boolean).join("");

  const footerContact = template.footerContact?.trim() || "Level Up in Germany — Berlin, Germany";

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${esc(subject || "Level Up in Germany")}</title>
<style>
  @media (max-width:620px){
    .lug-container{width:100% !important;border-radius:0 !important;}
    .lug-pad{padding-left:20px !important;padding-right:20px !important;}
    .lug-hero{padding:28px 20px !important;}
    .lug-h1{font-size:22px !important;line-height:1.3 !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BRAND.text};">
  <span style="display:none !important;opacity:0;visibility:hidden;max-height:0;max-width:0;overflow:hidden;">${esc(subject || "")}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" class="lug-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${BRAND.card};border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(26,26,26,.08);">
        <tr>
          <td class="lug-hero" align="center" style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryDark} 100%);padding:36px 32px;">
            <img src="${esc(headerImage)}" alt="Level Up in Germany" width="160" style="display:block;max-width:160px;height:auto;margin:0 auto;" />
          </td>
        </tr>
        <tr>
          <td class="lug-pad" style="padding:36px 40px 8px;">
            <h1 class="lug-h1" style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;color:${BRAND.dark};font-size:26px;line-height:1.25;font-weight:700;">${esc(subject || "")}</h1>
            <div style="height:3px;width:48px;background:${BRAND.accent};border-radius:2px;margin:0 0 22px;"></div>
          </td>
        </tr>
        <tr>
          <td class="lug-pad" style="padding:0 40px 8px;">
            ${bodyHtml}
          </td>
        </tr>
        ${ctaBlock}
        <tr>
          <td class="lug-pad" style="padding:8px 40px 28px;">
            <p style="margin:0;color:${BRAND.muted};font-size:13px;line-height:1.6;">${esc(footer.closing)}<br/><strong style="color:${BRAND.dark};">${esc(footer.signature)}</strong></p>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid ${BRAND.border};background:#fbf8f3;padding:24px 40px;" align="center">
            <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-style:italic;color:${BRAND.primary};font-size:14px;font-weight:600;">${esc(footer.tagline)}</p>
            <div style="margin-bottom:12px;">${socialRow}</div>
            <p style="margin:0;color:${BRAND.muted};font-size:12px;line-height:1.6;">${esc(footerContact)}</p>
            ${social.email ? `<p style="margin:6px 0 0;color:${BRAND.muted};font-size:12px;"><a href="mailto:${esc(social.email)}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">${esc(social.email)}</a></p>` : ""}
            <p style="margin:14px 0 0;color:${BRAND.muted};font-size:11px;line-height:1.55;font-style:italic;">${esc(footer.disclaimer)}</p>
          </td>
        </tr>
        <tr>
          <td style="background:${BRAND.dark};padding:14px 40px;" align="center">
            <p style="margin:0;color:${BRAND.grey};font-size:11px;letter-spacing:.08em;text-transform:uppercase;">© ${new Date().getFullYear()} Level Up in Germany</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
