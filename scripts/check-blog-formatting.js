// Quick formatting audit: count **bold**, ![image], ### headings, paragraphs
const { Client } = require('pg');
const CONNECTION_STRING = process.env.NEON_PROD_URL || process.env.DATABASE_URL;
if (!CONNECTION_STRING) {
  console.error('Missing NEON_PROD_URL (or DATABASE_URL) env var.');
  process.exit(1);
}
const c = new Client({ connectionString: CONNECTION_STRING });

(async () => {
  await c.connect();
  const r = await c.query(
    `SELECT blog_post_id, locale, title, body
     FROM blog_post_translations
     WHERE blog_post_id IN ('blog-post-001','blog-post-002','blog-post-003')
     ORDER BY blog_post_id, locale`,
  );
  for (const row of r.rows) {
    const body = row.body || '';
    const bold = (body.match(/\*\*[^*]+\*\*/g) || []).length;
    const images = (body.match(/!\[image\]\(https:\/\/[^)]+\)/g) || []).length;
    const headings = (body.match(/^### .+/gm) || []).length;
    const trailingCR = /\r/.test(body);
    console.log(
      `${row.blog_post_id} ${row.locale}: bold=${bold} images=${images} h3=${headings} CR=${trailingCR} len=${body.length}`,
    );
  }
  await c.end();
})();
