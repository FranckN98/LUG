const { Client } = require('pg');
const CONNECTION_STRING = process.env.NEON_PROD_URL || process.env.DATABASE_URL;
if (!CONNECTION_STRING) {
  console.error('Missing NEON_PROD_URL (or DATABASE_URL) env var.');
  process.exit(1);
}
const c = new Client({ connectionString: CONNECTION_STRING });
(async () => {
  await c.connect();
  const t = await c.query(
    `SELECT blog_post_id, locale, title, LENGTH(body) AS body_len, updated_at
     FROM blog_post_translations
     WHERE blog_post_id IN ('blog-post-001','blog-post-002','blog-post-003')
     ORDER BY blog_post_id, locale`,
  );
  console.log(JSON.stringify(t.rows, null, 2));
  await c.end();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
