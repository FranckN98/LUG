import { NextRequest, NextResponse } from 'next/server';
import { translateBlogFields, type TranslatableLocale } from '@/lib/translateText';
import { requireAdmin } from '@/lib/adminAuth';

const ALLOWED: TranslatableLocale[] = ['fr', 'en', 'de'];

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

  const f = body.fields ?? {};

  try {
    const result = await translateBlogFields(
      {
        title: typeof f.title === 'string' ? f.title : '',
        excerpt: typeof f.excerpt === 'string' ? f.excerpt : '',
        body: typeof f.body === 'string' ? f.body : '',
        metaTitle: typeof f.metaTitle === 'string' ? f.metaTitle : '',
        metaDescription: typeof f.metaDescription === 'string' ? f.metaDescription : '',
      },
      { source, target },
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Translation failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
