/**
 * Markdown-aware translator for blog posts.
 *
 * Provider strategy (server-side, picked at request time):
 *   1. OPENAI_API_KEY  → OpenAI (best quality, preserves markdown natively)
 *   2. DEEPL_API_KEY   → DeepL Free/Pro (very high quality)
 *   3. fallback        → MyMemory free API (no key, capped, decent for short text)
 *
 * In every case we preserve markdown structure:
 *   - Image lines (`![alt](url)`) are translated only inside the alt text.
 *   - Inline `**bold**` and `*italic*` markers stay around their (translated)
 *     inner text.
 *   - Markdown links `[text](url)` keep the URL intact; only the link label
 *     is translated.
 *   - Lines starting with `- ` (list bullets) keep the bullet at column 0.
 *   - Empty lines and paragraph boundaries are preserved.
 */

export type TranslatableLocale = 'fr' | 'en' | 'de';

type ProviderName = 'openai' | 'deepl' | 'mymemory';

export type TranslateOptions = {
  source: TranslatableLocale;
  target: TranslatableLocale;
};

export type TranslateFields = {
  title?: string;
  excerpt?: string | null;
  body?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type TranslateResult = TranslateFields & {
  provider: ProviderName;
};

const LANG_NAME: Record<TranslatableLocale, string> = {
  fr: 'French',
  en: 'English',
  de: 'German',
};

// ─────────────────────────────────────────────────────────────────────────────
// Markdown protection
// ─────────────────────────────────────────────────────────────────────────────

const PH = (i: number) => `\u00A7${i}\u00A7`;
const PH_RE = /\u00A7(\d+)\u00A7/g;

/**
 * Replace `[label](url)` and `![alt](url)` URLs with placeholders.
 * The visible label/alt remains in the text so it gets translated.
 */
function protect(text: string): { protected: string; tokens: string[] } {
  const tokens: string[] = [];
  // Image: `![alt](url)` → keep `![alt]` visible, hide `(url)`
  let out = text.replace(/(!\[[^\]]*\])\(([^)]+)\)/g, (_m, label, url) => {
    tokens.push(`(${url})`);
    return `${label}${PH(tokens.length - 1)}`;
  });
  // Link: `[label](url)`
  out = out.replace(/(\[[^\]]+\])\(([^)]+)\)/g, (_m, label, url) => {
    tokens.push(`(${url})`);
    return `${label}${PH(tokens.length - 1)}`;
  });
  return { protected: out, tokens };
}

function restore(text: string, tokens: string[]): string {
  return text.replace(PH_RE, (_m, i) => tokens[Number(i)] ?? '');
}

// ─────────────────────────────────────────────────────────────────────────────
// MyMemory provider (free, no key, ~5000 chars/day per IP)
// ─────────────────────────────────────────────────────────────────────────────

const MYMEMORY_MAX = 480; // safe under their 500-char hard limit

const splitChunks = (text: string, max = MYMEMORY_MAX): string[] => {
  if (text.length <= max) return [text];
  const out: string[] = [];
  // Prefer to split on sentence boundaries.
  const sentences = text.split(/(?<=[.!?])\s+/g);
  let buf = '';
  for (const s of sentences) {
    if ((buf + ' ' + s).trim().length > max) {
      if (buf) out.push(buf);
      // If even one sentence is too long, hard-split it.
      if (s.length > max) {
        for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max));
        buf = '';
      } else {
        buf = s;
      }
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
  }
  if (buf) out.push(buf);
  return out;
};

const myMemoryTranslate = async (text: string, source: TranslatableLocale, target: TranslatableLocale): Promise<string> => {
  if (!text.trim()) return text;
  const chunks = splitChunks(text);
  const out: string[] = [];
  for (const chunk of chunks) {
    const params = new URLSearchParams({
      q: chunk,
      langpair: `${source}|${target}`,
      de: 'levelupingermany@example.com',
    });
    const res = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`);
    if (!res.ok) throw new Error(`MyMemory ${res.status}`);
    const json = await res.json() as { responseData?: { translatedText?: string }; responseStatus?: number };
    if (json.responseStatus && json.responseStatus !== 200) {
      throw new Error(`MyMemory status ${json.responseStatus}`);
    }
    out.push(json.responseData?.translatedText ?? chunk);
  }
  return out.join(' ');
};

// MyMemory loses some markdown markers when translating — a line-by-line pass
// keeps paragraphs, list bullets and bold lines intact.
const myMemoryTranslateMarkdown = async (text: string, source: TranslatableLocale, target: TranslatableLocale): Promise<string> => {
  if (!text.trim()) return text;
  const lines = text.split('\n');
  const translated: string[] = [];
  for (const raw of lines) {
    if (!raw.trim()) { translated.push(''); continue; }
    // Preserve list bullet
    const bulletMatch = raw.match(/^(\s*-\s+)(.*)$/);
    if (bulletMatch) {
      const protectedInner = protect(bulletMatch[2]);
      const translatedInner = await myMemoryTranslateBold(protectedInner.protected, source, target);
      translated.push(bulletMatch[1] + restore(translatedInner, protectedInner.tokens));
      continue;
    }
    const protectedLine = protect(raw);
    const translatedLine = await myMemoryTranslateBold(protectedLine.protected, source, target);
    translated.push(restore(translatedLine, protectedLine.tokens));
  }
  return translated.join('\n');
};

// Translate a line while preserving inline `**bold**` and `*italic*` markers.
const myMemoryTranslateBold = async (line: string, source: TranslatableLocale, target: TranslatableLocale): Promise<string> => {
  // Whole-line bold heading: `**Title**`
  const fullBold = line.match(/^\*\*([^*]+)\*\*$/);
  if (fullBold) {
    const inner = await myMemoryTranslate(fullBold[1], source, target);
    return `**${inner}**`;
  }
  // Inline bold: split by `**...**` segments, translate text and bold inner separately.
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  const out: string[] = [];
  for (const part of parts) {
    if (!part) { out.push(part); continue; }
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      const tInner = await myMemoryTranslate(inner, source, target);
      out.push(`**${tInner}**`);
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const inner = part.slice(1, -1);
      const tInner = await myMemoryTranslate(inner, source, target);
      out.push(`*${tInner}*`);
    } else {
      out.push(await myMemoryTranslate(part, source, target));
    }
  }
  return out.join('');
};

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI provider (preferred when OPENAI_API_KEY is configured)
// ─────────────────────────────────────────────────────────────────────────────

const openaiTranslateMarkdown = async (
  text: string,
  source: TranslatableLocale,
  target: TranslatableLocale,
  apiKey: string,
): Promise<string> => {
  if (!text.trim()) return text;
  const sys = `You are a professional translator. Translate the user message from ${LANG_NAME[source]} to ${LANG_NAME[target]}.
Strict rules:
- Preserve the EXACT markdown structure: paragraphs, blank lines, line breaks, list bullets ("- "), bold ("**...**"), italic ("*...*"), images ("![alt](url)") and links ("[label](url)").
- Never translate URLs inside parentheses ("(...)"), keep them byte-for-byte identical.
- Translate the text content INSIDE bold/italic/links/image-alt.
- Keep the same number of paragraphs and list items.
- Do not add commentary, do not wrap output in code fences, output only the translated markdown.`;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: text },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? text;
};

// ─────────────────────────────────────────────────────────────────────────────
// DeepL provider (when DEEPL_API_KEY is configured)
// ─────────────────────────────────────────────────────────────────────────────

const deeplTranslateMarkdown = async (
  text: string,
  source: TranslatableLocale,
  target: TranslatableLocale,
  apiKey: string,
): Promise<string> => {
  if (!text.trim()) return text;
  const protectedRes = protect(text);
  const isFree = apiKey.endsWith(':fx');
  const url = isFree
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';
  const params = new URLSearchParams();
  params.append('text', protectedRes.protected);
  params.append('source_lang', source.toUpperCase());
  params.append('target_lang', target === 'en' ? 'EN-GB' : target.toUpperCase());
  params.append('preserve_formatting', '1');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`DeepL ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json() as { translations?: Array<{ text?: string }> };
  const translated = json.translations?.[0]?.text ?? protectedRes.protected;
  return restore(translated, protectedRes.tokens);
};

// ─────────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────────

const pickProvider = (): { name: ProviderName; key?: string } => {
  if (process.env.OPENAI_API_KEY) return { name: 'openai', key: process.env.OPENAI_API_KEY };
  if (process.env.DEEPL_API_KEY) return { name: 'deepl', key: process.env.DEEPL_API_KEY };
  return { name: 'mymemory' };
};

const translateOne = async (
  text: string | null | undefined,
  source: TranslatableLocale,
  target: TranslatableLocale,
  provider: { name: ProviderName; key?: string },
): Promise<string> => {
  if (text == null) return '';
  if (!text.trim()) return '';
  if (source === target) return text;
  if (provider.name === 'openai' && provider.key) {
    return openaiTranslateMarkdown(text, source, target, provider.key);
  }
  if (provider.name === 'deepl' && provider.key) {
    return deeplTranslateMarkdown(text, source, target, provider.key);
  }
  return myMemoryTranslateMarkdown(text, source, target);
};

export async function translateBlogFields(
  fields: TranslateFields,
  options: TranslateOptions,
): Promise<TranslateResult> {
  const provider = pickProvider();
  const { source, target } = options;

  const [title, excerpt, body, metaTitle, metaDescription] = await Promise.all([
    translateOne(fields.title ?? '', source, target, provider),
    translateOne(fields.excerpt ?? '', source, target, provider),
    translateOne(fields.body ?? '', source, target, provider),
    translateOne(fields.metaTitle ?? '', source, target, provider),
    translateOne(fields.metaDescription ?? '', source, target, provider),
  ]);

  return {
    provider: provider.name,
    title: title || undefined,
    excerpt: excerpt || undefined,
    body: body || undefined,
    metaTitle: metaTitle || undefined,
    metaDescription: metaDescription || undefined,
  };
}
