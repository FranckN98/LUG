/* eslint-disable no-console */
/*
 * ⚠️ DEPRECATED — kept as a NO-OP for backwards-compatibility with the
 * Vercel "Build Command" override that still chains this script.
 *
 * The previous implementation seeded EN/DE translations from a hardcoded
 * placeholder set ("Mega Conference 2025", "5 essential tips", "2025 Impact
 * Report") and OVERWROTE the proper translations on every redeploy.
 *
 * Original implementation preserved at
 *   scripts/translate-seed-blog.js.deprecated
 *
 * To (re-)import the real EN/DE translations from
 * `tmp/blog-translations/*.md`, run locally:
 *   node scripts/import-blog-translations.mjs
 *
 * TODO: Once the Vercel project's Build Command override is updated to
 * remove the `&& node scripts/translate-seed-blog.js` step, this file can
 * be deleted.
 */
console.log(
  '[translate-seed-blog] no-op (deprecated). ' +
    'See scripts/import-blog-translations.mjs to import real translations.',
);
process.exit(0);
