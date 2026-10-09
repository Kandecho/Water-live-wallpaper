param([string]$Version = '1.0.1')
$ErrorActionPreference = 'Stop'
if ($Version -notmatch '^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$') { throw 'Use a semantic version such as 1.0.1.' }
$repo = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path $repo 'wallpaper'
$destination = Join-Path $repo 'dist'
$stage = Join-Path $destination 'package-classic'
New-Item -ItemType Directory -Path $stage -Force | Out-Null
$common = @('index.html','assets.js','simulation.js','renderer.js','preview.jpg','README.txt','LICENSE.txt','NOTICE.txt')
foreach ($name in ($common + @('SucroseInfo.json','LivelyInfo.json'))) {
    Copy-Item -LiteralPath (Join-Path $runtime $name) -Destination (Join-Path $stage $name)
}
$readmePath = Join-Path $stage 'README.txt'
$readme = [regex]::Replace([IO.File]::ReadAllText($readmePath),'(?m)^Version:.*$',"Version: $Version")
[IO.File]::WriteAllText($readmePath,$readme)
$sucrosePath = Join-Path $stage 'SucroseInfo.json'
$sucrose = Get-Content -LiteralPath $sucrosePath -Raw | ConvertFrom-Json
$sucrose.Version = ($Version -split '-',2)[0]+'.0'
[IO.File]::WriteAllText($sucrosePath,($sucrose | ConvertTo-Json -Depth 8)+"`n")
foreach ($engine in @('Sucrose','Lively')) {
    $manifestName = if ($engine -eq 'Sucrose') { 'SucroseInfo.json' } else { 'LivelyInfo.json' }
    $names = $common + $manifestName
    $paths = @($names | ForEach-Object { Join-Path $stage $_ })
    $zipPath = Join-Path $destination "Water-Original-$engine-$Version.zip"
    Compress-Archive -LiteralPath $paths -DestinationPath $zipPath -Force
    $zip = [IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        foreach ($name in $names) { if (-not $zip.GetEntry($name)) { throw "Missing ZIP root entry: $name" } }
    } finally { $zip.Dispose() }
    Write-Output "Created $zipPath"
}
