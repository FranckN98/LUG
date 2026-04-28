#!/usr/bin/env node
/**
 * Switches prisma/schema.prisma from `provider = "sqlite"` to `provider = "postgresql"`
 * before building on Vercel.
 *
 * The repo keeps SQLite as the default for local dev. When this script runs
 * (via the `vercel-build` npm script), the schema is rewritten in-place so
 * `prisma generate` and `prisma migrate deploy` target Neon Postgres.
 *
 * Idempotent: running multiple times is safe.
 */
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const original = fs.readFileSync(schemaPath, 'utf8');

// Match the active `provider = "..."` line inside the `datasource db { ... }` block
// (ignores comments above it, which may also contain the word "postgresql").
const datasourceRegex = /datasource\s+db\s*\{([^}]*)\}/m;
const datasourceMatch = original.match(datasourceRegex);

if (!datasourceMatch) {
  console.error('[use-postgres] Could not find `datasource db { ... }` block in schema.prisma — aborting.');
  process.exit(1);
}

const block = datasourceMatch[1];
const providerLineRegex = /provider\s*=\s*"([^"]+)"/;
const providerMatch = block.match(providerLineRegex);

if (!providerMatch) {
  console.error('[use-postgres] No `provider` line in datasource block — aborting.');
  process.exit(1);
}

const currentProvider = providerMatch[1];

if (currentProvider === 'postgresql') {
  console.log('[use-postgres] datasource already uses postgresql — nothing to do.');
  process.exit(0);
}

if (currentProvider !== 'sqlite') {
  console.error(`[use-postgres] Unexpected provider "${currentProvider}" — aborting.`);
  process.exit(1);
}

const newBlock = block.replace(providerLineRegex, 'provider = "postgresql"');
const updated = original.replace(datasourceRegex, `datasource db {${newBlock}}`);

fs.writeFileSync(schemaPath, updated, 'utf8');
console.log('[use-postgres] datasource db → provider = "postgresql"');
