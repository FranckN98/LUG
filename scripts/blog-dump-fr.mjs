// One-off: dump all blog posts (with FR translation if present) from Neon → tmp/blogs-fr.json
// Usage: node scripts/blog-dump-fr.mjs
import { Client } from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error('NEON_DATABASE_URL is not set in .env');
  process.exit(1);
}

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

const { rows: posts } = await client.query(`
  SELECT id, title, body, "coverImage" AS cover_image, category, published, "publishedAt" AS published_at
  FROM blog_posts
  ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC
`).catch(async () => {
  // Fallback to snake_case schema (prod uses @map)
  return client.query(`
    SELECT id, title, body, cover_image, category, published, published_at
    FROM blog_posts
    ORDER BY published_at DESC NULLS LAST, created_at DESC
  `);
});

const out = [];
for (const p of posts) {
  const { rows: trs } = await client.query(
    `SELECT locale, title, excerpt, body, meta_title, meta_description
       FROM blog_post_translations
      WHERE blog_post_id = $1`,
    [p.id],
  );
  const map = Object.fromEntries(trs.map((t) => [t.locale, t]));
  out.push({
    id: p.id,
    legacyTitle: p.title,
    legacyBody: p.body,
    category: p.category,
    published: p.published,
    fr: map.fr ?? null,
    en: map.en ?? null,
    de: map.de ?? null,
  });
}

await client.end();

fs.mkdirSync('tmp', { recursive: true });
const outPath = path.join('tmp', 'blogs-fr.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log(`Dumped ${out.length} posts → ${outPath}`);
console.log('Locales present:');
for (const p of out) {
  const have = ['fr', 'en', 'de'].filter((l) => p[l]).join(',') || '(none → legacy)';
  console.log(`  ${p.id.slice(0, 8)}  ${have}  | ${(p.fr?.title ?? p.legacyTitle ?? '').slice(0, 70)}`);
}
