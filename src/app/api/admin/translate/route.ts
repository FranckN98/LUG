import { NextRequest, NextResponse } from 'next/server';
import { translateRecord, type TranslatableLocale } from '@/lib/translateText';
import { requireAdmin } from '@/lib/adminAuth';

const ALLOWED: TranslatableLocale[] = ['fr', 'en', 'de'];
/**
 * Generic admin translator endpoint. POST { source, target, fields }
 * where `fields` is any flat Record<string,string>. Returns the same keys
 * with translated values + the provider that handled the request.
 *
 * Provider auto-selection is identical to /api/admin/blog/translate:
 *   OPENAI_API_KEY → DEEPL_API_KEY → MyMemory (free fallback).
 */
export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null) as
    | { source?: string; target?: string; fields?: Record<string, string | null> }
    | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const source = body.source as TranslatableLocale;
  const target = body.target as TranslatableLocale;
  if (!ALLOWED.includes(source) || !ALLOWED.includes(target)) {
    return NextResponse.json({ error: 'Invalid source/target locale' }, { status: 400 });
  }
  if (source === target) {
    return NextResponse.json({ error: 'Source and target must differ' }, { status: 400 });
  }

  const fields = body.fields ?? {};
  if (typeof fields !== 'object' || Array.isArray(fields)) {
    return NextResponse.json({ error: 'Invalid fields object' }, { status: 400 });
  }

  try {
    const result = await translateRecord(fields, { source, target });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Translation failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
