import type { SocialLinks } from "@/types/emailTemplate";

/**
 * Replace `{varName}` placeholders inside a string.
 * Unknown placeholders are left as-is so admins can see what's missing.
 */
export function applyVariables(input: string, vars: Record<string, string | undefined>): string {
  if (!input) return input;
  return input.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (match, key: string) => {
    const value = vars[key];
    if (typeof value === "string" && value.length > 0) return value;
    return match;
  });
}

/** Build the social-URL variable bag from the singleton social links. */
export function buildSocialVariableBag(social: SocialLinks | null | undefined): Record<string, string> {
  const s = social ?? ({} as Partial<SocialLinks>);
  return {
    websiteUrl: s.website ?? "",
    linkedInUrl: s.linkedin ?? "",
    instagramUrl: s.instagram ?? "",
    tikTokUrl: s.tiktok ?? "",
    youtubeUrl: s.youtube ?? "",
    whatsappChannelUrl: s.whatsapp ?? "",
  };
}

/** Extract every `{varName}` placeholder used in a piece of content (deduped, in order). */
export function detectVariables(...sources: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const re = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;
  for (const text of sources) {
    if (!text) continue;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const name = m[1];
      if (!seen.has(name)) {
        seen.add(name);
        result.push(name);
      }
    }
  }
  return result;
}
