# Patch all admin route handlers that don't yet check admin auth.
# Idempotent: skips files already importing requireAdmin or reading admin_session.

$ErrorActionPreference = 'Stop'
$files = Get-ChildItem -Path "src/app/api/admin" -Filter "route.ts" -Recurse
$patched = @()
$skipped = @()

foreach ($f in $files) {
    $orig = [System.IO.File]::ReadAllText($f.FullName)

    if ($orig -match 'requireAdmin|isAdmin\b|admin_session') {
        $skipped += $f.FullName.Substring((Get-Location).Path.Length + 1)
        continue
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    foreach ($l in ($orig -split "`r?`n")) { [void]$lines.Add($l) }

    # Walk through the top-of-file import block, treating multi-line imports
    # (those that open `import {` on one line and close `}` on a later line)
    # as a single unit. Stop at the first non-import non-blank non-comment line.
    $insertAt = 0
    $inMultiImport = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($inMultiImport) {
            if ($line -match '\}') { $inMultiImport = $false; $insertAt = $i + 1 }
            continue
        }
        if ($line -match '^\s*$' -or $line -match '^\s*//') { continue }
        if ($line -match '^\s*import\s') {
            if ($line -match '\{' -and -not ($line -match '\}')) {
                $inMultiImport = $true
            } else {
                $insertAt = $i + 1
            }
            continue
        }
        break
    }

    $lines.Insert($insertAt, "import { requireAdmin } from '@/lib/adminAuth';")
    $text = ($lines -join "`r`n")

    $methods = 'GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD'
    $handlerPattern = '(export\s+async\s+function\s+(?:' + $methods + ')\s*\([^\)]*\)(?:\s*:\s*[^\{]+)?\s*\{)'
    $text = [regex]::Replace($text, $handlerPattern, {
        param($m)
        return $m.Value + "`r`n  const unauthorized = requireAdmin();`r`n  if (unauthorized) return unauthorized;`r`n"
    })

    [System.IO.File]::WriteAllText($f.FullName, $text, [System.Text.UTF8Encoding]::new($false))
    $patched += $f.FullName.Substring((Get-Location).Path.Length + 1)
}

Write-Host "PATCHED ($($patched.Count)):" -ForegroundColor Green
$patched | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "SKIPPED ($($skipped.Count)):" -ForegroundColor Yellow
$skipped | ForEach-Object { Write-Host "  $_" }
