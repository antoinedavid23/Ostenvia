$ErrorActionPreference='Stop'
$mediaAssets=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public/assets/media'))
$mediaArchive=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../media-jobs/originals'))
$workspaceRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
if(!$mediaAssets.StartsWith($workspaceRoot+[IO.Path]::DirectorySeparatorChar) -or !$mediaArchive.StartsWith($workspaceRoot+[IO.Path]::DirectorySeparatorChar)){throw 'Asset paths outside workspace'}
New-Item -ItemType Directory -Force -Path $mediaArchive|Out-Null
$ffmpeg=Join-Path $workspaceRoot 'work/tools/ffmpeg.exe'
foreach($asset in Get-ChildItem -LiteralPath $mediaAssets -Filter '*.png'){
 $webp=Join-Path $mediaAssets ($asset.BaseName+'.webp')
 & $ffmpeg -hide_banner -loglevel error -y -i $asset.FullName -vf 'scale=1600:-1' -c:v libwebp -quality 86 $webp
 if($LASTEXITCODE -ne 0 -or (Get-Item -LiteralPath $webp).Length -lt 1000){throw "Encoding failed: $($asset.Name)"}
 Move-Item -LiteralPath $asset.FullName -Destination (Join-Path $mediaArchive $asset.Name) -Force
 Write-Output "$($asset.BaseName): $([Math]::Round((Get-Item -LiteralPath $webp).Length/1024)) KB"
}
