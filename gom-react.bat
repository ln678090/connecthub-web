@echo off
setlocal
cd /d "%~dp0"

set "OUTPUT=react_all_code.txt"
if exist "%OUTPUT%" del "%OUTPUT%"

powershell -NoProfile -ExecutionPolicy Bypass ^
  "$Output = Join-Path (Get-Location) 'react_all_code.txt';" ^
  "$Root = Get-Location;" ^
  "$ExcludeDirs = @('node_modules','.git','dist','build','coverage','.next','.turbo','.cache','.idea','out');" ^
  "$IncludeExt = @('.js','.jsx','.ts','.tsx','.css','.scss','.sass','.less','.json','.html','.md','.env');" ^
  "'==================================================' | Out-File -FilePath $Output -Encoding UTF8;" ^
  "'REACT PROJECT CODE DUMP' | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  ("'ROOT: ' + $Root.Path) | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  ("'GENERATED: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "'==================================================' | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "'' | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "$files = Get-ChildItem -Path $Root -Recurse -File -Force | Where-Object {" ^
  "  $full = $_.FullName;" ^
  "  $dirHit = $false;" ^
  "  foreach ($d in $ExcludeDirs) {" ^
  "    if ($full -match [regex]::Escape('\'+$d+'\')) { $dirHit = $true; break }" ^
  "  }" ^
  "  if ($dirHit) { return $false }" ^
  "  if ($_.Name -like '.env*') { return $true }" ^
  "  return $IncludeExt -contains $_.Extension.ToLower()" ^
  "};" ^
  "foreach ($f in $files) {" ^
  "  '==================================================' | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "  ('FILE: ' + $f.FullName) | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "  '==================================================' | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "  Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "  '' | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "  '' | Out-File -FilePath $Output -Encoding UTF8 -Append;" ^
  "};" ^
  "Write-Host ('Done. Output file: ' + $Output);"

pause