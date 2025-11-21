<#
Interactive helper for adding environment variables to Vercel using the Vercel CLI.

Usage:
  1. Install Vercel CLI and login: `npm i -g vercel` then `vercel login`
  2. Create a `.env.local` file at the project root with the variables (see README.env.md).
  3. Run this script from the project root in PowerShell:
       ./scripts/setup-vercel-env.ps1

This script will read `.env.local` and for each key will run `vercel env add <NAME> production`.
You will be prompted by the Vercel CLI to paste the variable value. If you prefer to run commands
manually, run the script with `-PrintOnly` to just print the `vercel env add` commands.

#>
param(
  [switch]$PrintOnly
)

function Read-EnvFile($path) {
  if (-Not (Test-Path $path)) { return @{} }
  $lines = Get-Content $path | Where-Object { $_ -and -not $_.TrimStart().StartsWith('#') }
  $map = @{}
  foreach ($l in $lines) {
    $idx = $l.IndexOf('=')
    if ($idx -lt 0) { continue }
    $name = $l.Substring(0,$idx).Trim()
    $value = $l.Substring($idx+1).Trim()
    $map[$name] = $value
  }
  return $map
}

$envPath = Join-Path (Get-Location) '.env.local'
$vars = Read-EnvFile $envPath

if ($vars.Count -eq 0) {
  Write-Host "No .env.local found or it's empty. The script will still show example commands." -ForegroundColor Yellow
}

$required = @(
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'PAYSTACK_SECRET_KEY'
)

Write-Host "The script will add the following variables to Vercel (environment: production):" -ForegroundColor Cyan
foreach ($k in $required) { Write-Host " - $k" }
Write-Host "";

if ($PrintOnly) {
  Write-Host "Print-only mode: run the following commands manually (you will be prompted to paste values):`n" -ForegroundColor Green
  foreach ($k in $required) { Write-Host "vercel env add $k production" }
  exit 0
}

Write-Host "Ensure you are logged in (vercel login). Press Enter to continue or Ctrl+C to abort." -NoNewline
[void][System.Console]::ReadLine()

foreach ($k in $required) {
  $preset = $null
  if ($vars.ContainsKey($k)) { $preset = $vars[$k] }
  Write-Host "\nAdding $k (production)" -ForegroundColor Cyan
  if ($preset) { Write-Host "Value found in .env.local (will be offered when prompted)." -ForegroundColor DarkYellow }
  Write-Host "Running: vercel env add $k production" -ForegroundColor Gray
  Write-Host "When prompted, paste the value and press Enter. If you prefer to paste later, press Enter to continue." -ForegroundColor Gray
  & vercel env add $k production
}

Write-Host "\nDone. Use 'vercel env ls' to verify and then redeploy your project (push to main or run 'vercel --prod')." -ForegroundColor Green
