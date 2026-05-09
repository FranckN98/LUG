// End-to-end HTTP smoke test of admin save flow:
// 1. login → get session cookie
// 2. GET blog-post-002 (full state)
// 3. PATCH with the exact same translations (no-op)
// 4. GET again → assert byte-for-byte identity for every translation field
//
// Usage:
//   $env:ADMIN_EMAIL='...'; $env:ADMIN_PASSWORD='...'; node scripts/test-admin-save.js
const BASE = process.env.SITE_URL || 'https://www.levelupingermany.com';
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const POST_ID = process.env.POST_ID || 'blog-post-002';

if (!EMAIL || !PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars.');
  process.exit(1);
}

async function main() {
  console.log(`→ POST ${BASE}/api/admin/login`);
  const loginRes = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!loginRes.ok) {
    console.error('  ❌ login failed', loginRes.status, await loginRes.text());
    process.exit(2);
  }
  const setCookie = loginRes.headers.get('set-cookie') || '';
  const cookie = setCookie.split(';')[0];
  console.log('  ✅ logged in, cookie:', cookie.slice(0, 30) + '…');

  console.log(`\n→ GET /api/admin/blog/${POST_ID}`);
  const before = await (await fetch(`${BASE}/api/admin/blog/${POST_ID}`, { headers: { cookie } })).json();
  if (!before?.id) {
    console.error('  ❌ failed to load post', before);
    process.exit(3);
  }
  const beforeMap = {};
  for (const t of before.translations || []) beforeMap[t.locale] = t;
  console.log(`  ✅ loaded ${(before.translations || []).length} translations`);
  for (const l of ['fr', 'en', 'de']) {
    const t = beforeMap[l];
    if (t) console.log(`     ${l}: title="${t.title.slice(0, 40)}…" body=${t.body.length}c excerpt=${(t.excerpt || '').length}c`);
  }

  console.log(`\n→ PATCH /api/admin/blog/${POST_ID} (no-op, same content)`);
  const translationsPayload = {};
  for (const l of ['fr', 'en', 'de']) {
    const t = beforeMap[l];
    if (!t || !t.title || !t.body) continue;
    translationsPayload[l] = {
      title: t.title,
      body: t.body,
      excerpt: t.excerpt || undefined,
      metaTitle: t.metaTitle || undefined,
      metaDescription: t.metaDescription || undefined,
    };
  }
  const payload = {
    author: before.author,
    category: before.category,
    coverImage: before.coverImage,
    published: before.published,
    publishedAt: before.publishedAt,
    translations: translationsPayload,
  };
  const patchRes = await fetch(`${BASE}/api/admin/blog/${POST_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(payload),
  });
  if (!patchRes.ok) {
    console.error('  ❌ PATCH failed', patchRes.status, await patchRes.text());
    process.exit(4);
  }
  console.log('  ✅ PATCH 200');

  console.log(`\n→ GET /api/admin/blog/${POST_ID} (verify)`);
  const after = await (await fetch(`${BASE}/api/admin/blog/${POST_ID}`, { headers: { cookie } })).json();
  const afterMap = {};
  for (const t of after.translations || []) afterMap[t.locale] = t;

  let allEqual = true;
  for (const l of ['fr', 'en', 'de']) {
    const a = beforeMap[l];
    const b = afterMap[l];
    if (!a) continue;
    if (!b) { console.log(`  ❌ ${l}: lost!`); allEqual = false; continue; }
    const fields = ['title', 'body', 'excerpt', 'metaTitle', 'metaDescription'];
    for (const f of fields) {
      const va = a[f] ?? null;
      const vb = b[f] ?? null;
      if (va !== vb) {
        console.log(`  ❌ ${l}.${f} differs: before=${JSON.stringify((va || '').slice(0, 80))} after=${JSON.stringify((vb || '').slice(0, 80))}`);
        allEqual = false;
      }
    }
    if (a.title === b.title && a.body === b.body) {
      console.log(`  ✅ ${l}: byte-for-byte identical (title=${a.title.length}c body=${a.body.length}c)`);
    }
  }

  console.log(`\n${allEqual ? '✅✅✅ Admin save flow works perfectly (no-op preserved every byte).' : '❌ DIFFS DETECTED — admin save mutates content'}`);
  await fetch(`${BASE}/api/admin/logout`, { method: 'POST', headers: { cookie } }).catch(() => {});
  process.exit(allEqual ? 0 : 5);
}

main().catch((e) => { console.error(e); process.exit(99); });
