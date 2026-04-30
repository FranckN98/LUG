# Sync local SQLite (prisma/dev.db) → Neon Postgres (production).
# Usage:
#   $env:NEON_DATABASE_URL = "postgresql://neondb_owner:...@ep-summer-frog-...neon.tech/neondb?sslmode=require"
#   .\scripts\sync-local-to-prod.ps1

$ErrorActionPreference = "Stop"

if (-not $env:NEON_DATABASE_URL) {
    Write-Error "Set `$env:NEON_DATABASE_URL first (the Postgres URL of the Neon production branch)."
    exit 1
}

Write-Host ""
Write-Host "=== 1/5  Dump SQLite local -> prisma-dump.json ===" -ForegroundColor Cyan
node scripts/dump-sqlite.js
if ($LASTEXITCODE -ne 0) { throw "dump failed" }

Write-Host ""
Write-Host "=== 2/5  Switch schema.prisma to postgresql ===" -ForegroundColor Cyan
node scripts/use-postgres.js
if ($LASTEXITCODE -ne 0) { throw "schema switch failed" }

Write-Host ""
Write-Host "=== 3/5  Regenerate Prisma client for postgres ===" -ForegroundColor Cyan
$env:DATABASE_URL = $env:NEON_DATABASE_URL
npx prisma generate --schema prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }

Write-Host ""
Write-Host "=== 4/5  Push schema + import data to Neon ===" -ForegroundColor Cyan
npx prisma db push --accept-data-loss --skip-generate --schema prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw "db push failed" }
node scripts/import-to-postgres.js
if ($LASTEXITCODE -ne 0) { throw "import failed" }

Write-Host ""
Write-Host "=== 5/5  Restore schema.prisma to sqlite + regen client ===" -ForegroundColor Cyan
git checkout prisma/schema.prisma
$env:DATABASE_URL = "file:./dev.db"
npx prisma generate --schema prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw "prisma regenerate sqlite failed" }

Write-Host ""
Write-Host "Done. Local Neon now mirrors your local SQLite." -ForegroundColor Green
Write-Host "Tip: redeploy on Vercel to clear any cached responses." -ForegroundColor Yellow
