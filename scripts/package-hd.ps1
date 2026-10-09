param([string]$Version='1.0.0')
$ErrorActionPreference='Stop'
if($Version -notmatch '^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$'){throw 'Use a semantic version.'}
$repo=Split-Path -Parent $PSScriptRoot
$runtime=Join-Path $repo 'wallpaper-hd'
$destination=Join-Path $repo 'dist'
New-Item -ItemType Directory -Path $destination -Force|Out-Null
$names=@('index.html','preview.html','strong-preview.html','preview-controls.js','preview-controls.css','settings.js','wind.js','world.js','shaders.js','renderer.js','app.js','assets.js','maps.js','preview.jpg','README.txt','LICENSE.txt','NOTICE.txt','SucroseInfo.json','LivelyInfo.json','project.json')
$stage=[IO.Path]::GetFullPath((Join-Path $destination 'package-hd'))
$distRoot=[IO.Path]::GetFullPath($destination)+[IO.Path]::DirectorySeparatorChar
if(-not $stage.StartsWith($distRoot)){throw 'Invalid package staging path'}
New-Item -ItemType Directory -Path $stage -Force|Out-Null
foreach($name in $names){
  $path=Join-Path $runtime $name
  if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Missing runtime file: $path"}
  Copy-Item -LiteralPath $path -Destination (Join-Path $stage $name)
}
Copy-Item -LiteralPath (Join-Path $repo 'docs/configuration.zh-CN.md') -Destination (Join-Path $stage 'CONFIGURATION.zh-CN.md')
$names+='CONFIGURATION.zh-CN.md'
# Stamp package identity without changing the source configuration.
$sucrosePath=Join-Path $stage 'SucroseInfo.json'
$sucrose=Get-Content -LiteralPath $sucrosePath -Raw|ConvertFrom-Json
$sucrose.Version=($Version -split '-',2)[0]+'.0'
[IO.File]::WriteAllText($sucrosePath,($sucrose|ConvertTo-Json -Depth 8)+"`n")
$readmePath=Join-Path $stage 'README.txt'
$readme=[regex]::Replace([IO.File]::ReadAllText($readmePath),'(?m)^Version:.*$',"Version: $Version")
[IO.File]::WriteAllText($readmePath,$readme)
$paths=@($names|ForEach-Object{Join-Path $stage $_})
$zipPath=Join-Path $destination "Water-HD-$Version.zip"
Compress-Archive -LiteralPath $paths -DestinationPath $zipPath -Force
$zip=[IO.Compression.ZipFile]::OpenRead($zipPath)
try{foreach($name in $names){if(-not $zip.GetEntry($name)){throw "Missing ZIP root entry: $name"}}}finally{$zip.Dispose()}
Write-Output "Created $zipPath"
$digest=(Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
[IO.File]::WriteAllText((Join-Path $destination 'Water-HD-SHA256SUMS.txt'),"$digest  $([IO.Path]::GetFileName($zipPath))`n")
