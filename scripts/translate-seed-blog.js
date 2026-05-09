/* eslint-disable no-console */
/*
 * ⚠️ DEPRECATED — DO NOT RUN.
 *
 * This script previously seeded EN/DE translations for blog-post-001/002/003
 * with PLACEHOLDER content (e.g. "Mega Conference 2025", "5 essential tips",
 * "2025 Impact Report") that overwrites the proper translations stored in
 * `tmp/blog-translations/blog-post-NNN.md`.
 *
 * The original implementation is preserved at
 * `scripts/translate-seed-blog.js.deprecated` for reference.
 *
 * To (re-)import the proper EN/DE translations, run:
 *   node scripts/import-blog-translations.mjs
 *
 * If you really need to re-run the legacy seed, restore the .deprecated file
 * manually — but first make sure you understand the consequences.
 */
console.error(
  '[translate-seed-blog] This script is deprecated. ' +
    'It would overwrite the production EN/DE translations with placeholder seed content. ' +
    'Use scripts/import-blog-translations.mjs instead.',
);
process.exit(1);
