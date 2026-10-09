param([string]$Version='0.1.0-preview.1')
$ErrorActionPreference='Stop'
if($Version -notmatch '^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$'){throw 'Use a semantic version.'}
$repo=Split-Path -Parent $PSScriptRoot
$runtime=Join-Path $repo 'wallpaper-hd'
$destination=Join-Path $repo 'dist'
New-Item -ItemType Directory -Path $destination -Force|Out-Null
$names=@('index.html','preview.html','settings.js','world.js','shaders.js','renderer.js','app.js','assets.js','maps.js','preview.jpg','README.txt','LICENSE.txt','NOTICE.txt','SucroseInfo.json','LivelyInfo.json','project.json')
$paths=@($names|ForEach-Object{Join-Path $runtime $_})
foreach($path in $paths){if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Missing runtime file: $path"}}
$zipPath=Join-Path $destination "Water-HD-$Version.zip"
Compress-Archive -LiteralPath $paths -DestinationPath $zipPath -Force
$zip=[IO.Compression.ZipFile]::OpenRead($zipPath)
try{foreach($name in $names){if(-not $zip.GetEntry($name)){throw "Missing ZIP root entry: $name"}}}finally{$zip.Dispose()}
Write-Output "Created $zipPath"
$digest=(Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
[IO.File]::WriteAllText((Join-Path $destination 'Water-HD-SHA256SUMS.txt'),"$digest  $([IO.Path]::GetFileName($zipPath))`n")
