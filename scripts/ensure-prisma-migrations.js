/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Client } = require('pg');

const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
const prismaBin = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';

async function databaseNeedsBaseline() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(`
      SELECT
        EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = '_prisma_migrations'
        ) AS has_migration_table,
        EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'
        ) AS has_existing_schema
    `);
    const row = result.rows[0];
    return !row.has_migration_table && row.has_existing_schema;
  } finally {
    await client.end();
  }
}

async function main() {
  if (await databaseNeedsBaseline()) {
    const migrations = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    console.log(`[prisma] Existing schema detected without migration history; baselining ${migrations.length} migration(s).`);
    for (const migration of migrations) {
      execFileSync(prismaBin, ['migrate', 'resolve', '--applied', migration], { stdio: 'inherit' });
    }
  }

  execFileSync(prismaBin, ['migrate', 'deploy'], { stdio: 'inherit' });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});