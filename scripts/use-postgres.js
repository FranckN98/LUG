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

if (original.includes('provider = "postgresql"')) {
  console.log('[use-postgres] schema.prisma already targets postgresql — nothing to do.');
  process.exit(0);
}

const updated = original.replace(
  /provider\s*=\s*"sqlite"/,
  'provider = "postgresql"'
);

if (updated === original) {
  console.error('[use-postgres] Could not find `provider = "sqlite"` in schema.prisma — aborting.');
  process.exit(1);
}

fs.writeFileSync(schemaPath, updated, 'utf8');
console.log('[use-postgres] schema.prisma → provider = "postgresql"');
