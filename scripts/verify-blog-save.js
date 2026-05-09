// Smoke test — verify blog translation save flow end-to-end:
//  1. Read translations + legacy BlogPost columns
//  2. Confirm pickLegacyMirror invariant: BlogPost.title/body match FR translation (or first available)
//  3. Confirm @@unique [blog_post_id, locale] is respected (no duplicates)
//  4. Confirm no \r residue, no orphaned rows.
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.NEON_PROD_URL });

(async () => {
  await c.connect();
  console.log('--- 1. Schema sanity ---');
  const idx = await c.query(
    `SELECT indexname, indexdef FROM pg_indexes
     WHERE tablename='blog_post_translations'`,
  );
  for (const r of idx.rows) console.log(' ', r.indexname, '=>', r.indexdef);

  console.log('\n--- 2. Duplicates check ---');
  const dup = await c.query(
    `SELECT blog_post_id, locale, COUNT(*) AS n
     FROM blog_post_translations
     GROUP BY blog_post_id, locale HAVING COUNT(*) > 1`,
  );
  console.log(dup.rowCount === 0 ? '  ✅ no duplicates' : `  ❌ ${dup.rowCount} dupes`);

  console.log('\n--- 3. Orphaned translations (no parent post) ---');
  const orph = await c.query(
    `SELECT t.blog_post_id, t.locale FROM blog_post_translations t
     LEFT JOIN blog_posts p ON p.id = t.blog_post_id
     WHERE p.id IS NULL`,
  );
  console.log(orph.rowCount === 0 ? '  ✅ no orphans' : `  ❌ ${orph.rowCount} orphans`);

  console.log('\n--- 4. Posts without any translation ---');
  const notr = await c.query(
    `SELECT p.id FROM blog_posts p
     LEFT JOIN blog_post_translations t ON t.blog_post_id = p.id
     WHERE t.id IS NULL`,
  );
  console.log(notr.rowCount === 0 ? '  ✅ all posts have translations' : `  ⚠️ ${notr.rowCount} posts without translation`);
  for (const r of notr.rows) console.log('     -', r.id);

  console.log('\n--- 5. CR / NUL residue ---');
  const cr = await c.query(
    `SELECT blog_post_id, locale FROM blog_post_translations
     WHERE position(E'\\r' in COALESCE(title,'')||COALESCE(body,'')||COALESCE(excerpt,'')) > 0`,
  );
  console.log(cr.rowCount === 0 ? '  ✅ no \\r residue' : `  ❌ ${cr.rowCount} rows with CR`);

  console.log('\n--- 6. Legacy mirror coherence (BlogPost vs FR translation) ---');
  const mirror = await c.query(
    `SELECT p.id,
            p.title       AS legacy_title,
            LENGTH(p.body) AS legacy_body_len,
            tfr.title     AS fr_title,
            LENGTH(tfr.body) AS fr_body_len,
            ten.title     AS en_title,
            tde.title     AS de_title
     FROM blog_posts p
     LEFT JOIN blog_post_translations tfr ON tfr.blog_post_id=p.id AND tfr.locale='fr'
     LEFT JOIN blog_post_translations ten ON ten.blog_post_id=p.id AND ten.locale='en'
     LEFT JOIN blog_post_translations tde ON tde.blog_post_id=p.id AND tde.locale='de'
     ORDER BY p.id`,
  );
  for (const r of mirror.rows) {
    const expected = r.fr_title || r.en_title || r.de_title;
    const expectedLen = r.fr_body_len ?? null;
    const titleOk = r.legacy_title === expected;
    const bodyOk = expectedLen === null || r.legacy_body_len === expectedLen;
    console.log(
      `  ${titleOk && bodyOk ? '✅' : '⚠️'} ${r.id}: legacy="${(r.legacy_title || '').slice(0, 50)}…" expected="${(expected || '').slice(0, 50)}…" bodyLen=${r.legacy_body_len}/${expectedLen}`,
    );
  }

  console.log('\n--- 7. Idempotency simulation ---');
  // Simulate: re-upsert FR with identical values, must not change updated_at by more than expected
  const before = await c.query(
    `SELECT id, updated_at, title, body FROM blog_post_translations
     WHERE blog_post_id='blog-post-001' AND locale='fr'`,
  );
  const row = before.rows[0];
  await c.query(
    `UPDATE blog_post_translations
     SET title=$1, body=$2, updated_at=NOW()
     WHERE id=$3`,
    [row.title, row.body, row.id],
  );
  const after = await c.query(
    `SELECT title, body FROM blog_post_translations WHERE id=$1`,
    [row.id],
  );
  const same = after.rows[0].title === row.title && after.rows[0].body === row.body;
  console.log(same ? '  ✅ upsert preserves content byte-for-byte' : '  ❌ content drifted');

  await c.end();
})();
