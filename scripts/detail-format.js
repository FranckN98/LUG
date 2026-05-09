// Show first 1500 chars of EN body for blog-post-001 to verify formatting persistence
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.NEON_PROD_URL });
(async () => {
  await c.connect();
  for (const id of ['blog-post-001', 'blog-post-002', 'blog-post-003']) {
    for (const loc of ['en', 'de']) {
      const r = await c.query(
        `SELECT body FROM blog_post_translations WHERE blog_post_id=$1 AND locale=$2`,
        [id, loc],
      );
      const b = r.rows[0]?.body || '';
      const bolds = b.match(/\*\*[^*\n]{1,200}\*\*/g) || [];
      const imgs = b.match(/!\[image\]\([^)]+\)/g) || [];
      console.log(`\n=== ${id} ${loc} (len=${b.length}) ===`);
      console.log(`bolds (${bolds.length}):`, bolds.slice(0, 10));
      console.log(`images (${imgs.length}):`, imgs);
    }
  }
  await c.end();
})();
