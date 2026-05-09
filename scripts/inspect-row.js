const { Client } = require('pg');
const CONNECTION_STRING = process.env.NEON_PROD_URL || process.env.DATABASE_URL;
const c = new Client({ connectionString: CONNECTION_STRING });
(async () => {
  await c.connect();
  // Inspect all columns for blog-post-001 EN
  const cols = await c.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='blog_post_translations' ORDER BY ordinal_position`,
  );
  console.log('Columns:', cols.rows.map((r) => r.column_name).join(', '));
  const r = await c.query(
    `SELECT * FROM blog_post_translations WHERE blog_post_id='blog-post-001' AND locale='en'`,
  );
  const row = r.rows[0];
  for (const k of Object.keys(row)) {
    const v = row[k];
    if (typeof v === 'string') {
      console.log(`\n--- ${k} (len=${v.length}) ---`);
      console.log(v.length > 300 ? v.slice(0, 300) + '...[truncated]' : v);
    } else {
      console.log(`${k}:`, v);
    }
  }
  await c.end();
})();
