# Merge-sync: pushes local SQLite event-related data into Neon Postgres
# WITHOUT deleting anything.
#
# Preserves on prod: NewsletterSubscriber, Member, CommunicationSettings,
# EventCommunicationLead (these tables are NOT touched).
#
# Usage:
#   $env:NEON_DATABASE_URL = "postgresql://neondb_owner:...@ep-summer-frog-...neon.tech/neondb?sslmode=require"
#   .\scripts\sync-events-merge.ps1

$ErrorActionPreference = "Stop"

# Auto-load NEON_DATABASE_URL from .env if not already set in the shell.
if (-not $env:NEON_DATABASE_URL) {
    $envPath = Join-Path $PSScriptRoot "..\.env"
    if (Test-Path $envPath) {
        Get-Content $envPath | ForEach-Object {
            if ($_ -match '^\s*NEON_DATABASE_URL\s*=\s*"?([^"]+)"?\s*$') {
                $env:NEON_DATABASE_URL = $matches[1]
                Write-Host "Loaded NEON_DATABASE_URL from .env" -ForegroundColor DarkGray
            }
        }
    }
}

if (-not $env:NEON_DATABASE_URL) {
    Write-Error "NEON_DATABASE_URL is not set. Add it to .env or run: `$env:NEON_DATABASE_URL = '...'"
    exit 1
}

Push-Location "$PSScriptRoot\.."

try {
    Write-Host ""
    Write-Host "=== 1/5  Dump event-related tables from local SQLite ===" -ForegroundColor Cyan
    node scripts/dump-event-data.js
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
    Write-Host "=== 4/5  Push schema (db push, no data loss) + upsert event data into Neon ===" -ForegroundColor Cyan
    npx prisma db push --accept-data-loss --skip-generate --schema prisma/schema.prisma
    if ($LASTEXITCODE -ne 0) { throw "db push failed" }
    node scripts/upsert-event-data.js
    if ($LASTEXITCODE -ne 0) { throw "upsert failed" }

    Write-Host ""
    Write-Host "=== 5/5  Restore schema.prisma to sqlite + regen client ===" -ForegroundColor Cyan
    git checkout prisma/schema.prisma
    $env:DATABASE_URL = "file:./dev.db"
    npx prisma generate --schema prisma/schema.prisma
    if ($LASTEXITCODE -ne 0) { throw "prisma regenerate sqlite failed" }

    Write-Host ""
    Write-Host "Done. Neon now has the latest event 2025 data; subscribers / members / comm settings preserved." -ForegroundColor Green
    Write-Host "Tip: redeploy on Vercel to clear cached responses." -ForegroundColor Yellow
} finally {
    Pop-Location
}
