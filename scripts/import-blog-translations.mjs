// One-shot import: reads tmp/blog-translations/blog-post-00{1,2,3}.md and
// UPSERTs the EN + DE rows of blog_post_translations in production Neon.
// Usage: node scripts/import-blog-translations.mjs
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';

const CONNECTION_STRING = process.env.NEON_PROD_URL || process.env.DATABASE_URL;
if (!CONNECTION_STRING) {
  console.error('Missing NEON_PROD_URL (or DATABASE_URL) env var.');
  process.exit(1);
}

const POSTS = ['blog-post-001', 'blog-post-002', 'blog-post-003'];
const LOCALES = ['en', 'de'];

function fieldKeyFor(heading) {
  const h = heading.trim().toLowerCase();
  if (h === 'title') return 'title';
  if (h === 'excerpt') return 'excerpt';
  if (h === 'meta title') return 'metaTitle';
  if (h === 'meta description') return 'metaDescription';
  if (h === 'body') return 'body';
  return null;
}

function parseLocaleSection(text) {
  const out = {};
  let current = null;
  let buf = [];
  const flush = () => {
    if (current) {
      // Strip CR (CRLF line endings) so titles don't carry trailing \r.
      out[current] = buf.join('\n').replace(/\r/g, '').replace(/^\s*\n+/, '').replace(/\n+\s*$/, '');
    }
    buf = [];
  };
  for (const raw0 of text.split('\n')) {
    const raw = raw0.replace(/\r$/, '');
    const m = raw.match(/^### (.+?)\s*$/);
    // Only treat the line as a field separator if its heading matches one of
    // our 5 known field keys. Other `###` lines (e.g. `### Changing the
    // narrative`) belong to the Body content and must be preserved verbatim.
    if (m && fieldKeyFor(m[1])) {
      flush();
      current = fieldKeyFor(m[1]);
      continue;
    }
    if (current) buf.push(raw);
  }
  flush();
  return out;
}

function parseFile(content) {
  const enIdx = content.indexOf('## 🇬🇧 ENGLISH');
  const deIdx = content.indexOf('## 🇩🇪 DEUTSCH');
  if (enIdx < 0 || deIdx < 0) {
    throw new Error('Missing EN or DE locale header');
  }
  const stripHeader = (s) => s.replace(/^##\s.+\n/, '');
  return {
    en: parseLocaleSection(stripHeader(content.slice(enIdx, deIdx))),
    de: parseLocaleSection(stripHeader(content.slice(deIdx))),
  };
}

const isComplete = (f) => !!(f.title?.trim() && f.body?.trim());

async function upsertTranslation(c, postId, locale, fields) {
  const existing = await c.query(
    'SELECT id FROM blog_post_translations WHERE blog_post_id = $1 AND locale = $2',
    [postId, locale],
  );
  const params = [
    fields.title,
    fields.body,
    fields.excerpt ?? null,
    fields.metaTitle ?? null,
    fields.metaDescription ?? null,
  ];
  if (existing.rows.length > 0) {
    await c.query(
      `UPDATE blog_post_translations
       SET title = $1, body = $2, excerpt = $3, meta_title = $4,
           meta_description = $5, updated_at = NOW()
       WHERE id = $6`,
      [...params, existing.rows[0].id],
    );
    return 'updated';
  }
  await c.query(
    `INSERT INTO blog_post_translations
     (id, blog_post_id, locale, title, body, excerpt, meta_title, meta_description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
    [randomUUID(), postId, locale, ...params],
  );
  return 'inserted';
}

async function main() {
  const dir = path.join(process.cwd(), 'tmp', 'blog-translations');
  const c = new Client({ connectionString: CONNECTION_STRING });
  await c.connect();
  try {
    for (const postId of POSTS) {
      const filePath = path.join(dir, `${postId}.md`);
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = parseFile(content);
      console.log(`\n=== ${postId} ===`);
      for (const locale of LOCALES) {
        const fields = parsed[locale];
        if (!isComplete(fields)) {
          console.log(`  ${locale}: SKIPPED (parsed fields incomplete)`);
          continue;
        }
        const action = await upsertTranslation(c, postId, locale, fields);
        console.log(
          `  ${locale}: ${action} — title="${fields.title.slice(0, 70)}…" body=${fields.body.length} chars`,
        );
      }
    }
  } finally {
    await c.end();
  }
  console.log('\n✅ Import done.');
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
