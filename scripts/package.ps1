param([string]$Version = '1.0.1')
$ErrorActionPreference = 'Stop'
if ($Version -notmatch '^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$') { throw 'Use a semantic version such as 1.0.0.' }
$repo = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path $repo 'wallpaper'
$destination = Join-Path $repo 'dist'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$common = @('index.html','assets.js','simulation.js','renderer.js','preview.jpg','README.txt','LICENSE.txt','NOTICE.txt')
foreach ($engine in @('Sucrose','Lively')) {
    $manifestName = if ($engine -eq 'Sucrose') { 'SucroseInfo.json' } else { 'LivelyInfo.json' }
    $paths = @($common + $manifestName | ForEach-Object { Join-Path $runtime $_ })
    foreach ($path in $paths) { if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing package file: $path" } }
    $zipPath = Join-Path $destination "Water-Original-$engine-$Version.zip"
    Compress-Archive -LiteralPath $paths -DestinationPath $zipPath -Force
    $zip = [IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $entries = @($zip.Entries.FullName)
        foreach ($name in ($common + $manifestName)) {
            if ($entries -notcontains $name) { throw "Missing ZIP root entry: $name" }
        }
    } finally { $zip.Dispose() }
    Write-Output "Created $zipPath"
}
