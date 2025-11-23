param(
    [string]$OutDir = "public/fonts"
)

Write-Host "Ensuring output directory exists: $OutDir"
if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$cssUrl = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
Write-Host "Fetching Google Fonts CSS from: $cssUrl"
$resp = Invoke-WebRequest -Uri $cssUrl -UseBasicParsing -ErrorAction Stop
$css = $resp.Content

# Extract @font-face blocks and download woff2 files
$blocks = ([regex]"@font-face\s*\{[^}]*\}") -split $css -ne ''

# fallback: parse urls and weights with regex
$faces = [regex]::Matches($css, "@font-face\s*\{([^}]*)\}", 'Singleline')
$downloaded = @()
foreach ($m in $faces) {
    $block = $m.Groups[1].Value
    $weightMatch = [regex]::Match($block, "font-weight:\s*(\d+)")
    $urlMatch = [regex]::Match($block, "url\(([^)]+)\)")
    if ($weightMatch.Success -and $urlMatch.Success) {
        $w = $weightMatch.Groups[1].Value
        $u = $urlMatch.Groups[1].Value.Trim("'\"")
    # Some URLs may be relative or protocol-less; ensure https
    if ($u.StartsWith('//')) { $u = 'https:' + $u }
    if ($u -notmatch '^https?://') { $u = 'https://' + $u }
    $fileName = "poppins-$w.woff2"
    $outPath = Join-Path $OutDir $fileName
    if (-not (Test-Path $outPath)) {
      Write-Host "Downloading weight $w -> $fileName"
      Invoke-WebRequest -Uri $u -OutFile $outPath -UseBasicParsing -ErrorAction Stop
    } else {
      Write-Host "Already present: $fileName"
    }
    $downloaded += $fileName
  }
}

if ($downloaded.Count -eq 0) {
  Write-Warning "No font files were detected/downloaded. CSS contents:"
  Write-Host $css
} else {
  Write-Host "Downloaded files: $($downloaded -join ', ')"
}

Write-Host "Done. Be sure to commit the files in $OutDir to your repo if you want them hosted with the site."
