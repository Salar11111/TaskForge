/**
 * OneDrive "Files On-Demand" turns spec files into reparse points (not true
 * symlinks), which Playwright silently skips during discovery. Materialize any
 * such files back to regular files before e2e tests. No-op off Windows.
 */
const path = require('node:path');
const { execFileSync } = require('node:child_process');

if (process.platform !== 'win32') process.exit(0);

const dir = path.join(__dirname, '..', 'tests', 'e2e').replace(/'/g, "''");
const script = `
$dir = '${dir}'
Get-ChildItem -LiteralPath $dir -Force -Filter '*.spec.ts' |
  Where-Object { $_.Attributes -match 'ReparsePoint' } |
  ForEach-Object {
    $content = Get-Content -LiteralPath $_.FullName -Raw
    Remove-Item -LiteralPath $_.FullName -Force
    Set-Content -LiteralPath $_.FullName -Value $content -NoNewline -Encoding UTF8
    Write-Output "materialized $($_.Name)"
  }
`;

execFileSync('powershell', ['-NoProfile', '-Command', script], { stdio: 'inherit' });
