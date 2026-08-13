import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';
import pg from 'pg';

config({ path: path.resolve('.env') });

const outputPath = process.argv[2];
if (!outputPath) {
  console.error('Usage: node scripts/backup-postgres.mjs <output-file>');
  process.exit(1);
}

if (!process.env.DATABASE_URL?.startsWith('postgres')) {
  console.error('DATABASE_URL must be a PostgreSQL connection string.');
  process.exit(1);
}

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

try {
  await client.connect();

  const tablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const backup = {
    version: 1,
    createdAt: new Date().toISOString(),
    database: 'postgresql',
    tables: {},
  };

  for (const { table_name: tableName } of tablesResult.rows) {
    const columnsResult = await client.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName],
    );
    const rowsResult = await client.query(`SELECT * FROM ${quoteIdentifier(tableName)}`);
    backup.tables[tableName] = {
      columns: columnsResult.rows,
      rows: rowsResult.rows,
    };
    console.log(`${tableName}: ${rowsResult.rowCount} rows`);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(backup, null, 2), { mode: 0o600 });
  console.log(`Backup written to ${outputPath}`);
} finally {
  await client.end();
}