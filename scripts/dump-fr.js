// Dump FR body of each blog post to tmp/blog-translations/_fr-{id}.txt for inspection
const { Client } = require('pg');
const fs = require('node:fs');
const path = require('node:path');
const CONNECTION_STRING = process.env.NEON_PROD_URL || process.env.DATABASE_URL;
const c = new Client({ connectionString: CONNECTION_STRING });
(async () => {
  await c.connect();
  const r = await c.query(
    `SELECT blog_post_id, title, excerpt, body, meta_title, meta_description
     FROM blog_post_translations
     WHERE locale='fr' AND blog_post_id IN ('blog-post-001','blog-post-002','blog-post-003')`,
  );
  const dir = path.resolve('tmp/blog-translations');
  fs.mkdirSync(dir, { recursive: true });
  for (const row of r.rows) {
    const out = `# Title\n${row.title}\n\n## Excerpt\n${row.excerpt || ''}\n\n## Meta title\n${row.meta_title || ''}\n\n## Meta description\n${row.meta_description || ''}\n\n## Body\n${row.body || ''}\n`;
    const p = path.join(dir, `_fr-${row.blog_post_id}.txt`);
    fs.writeFileSync(p, out, 'utf8');
    console.log('wrote', p, 'bodyLen=', (row.body || '').length);
  }
  await c.end();
})();
