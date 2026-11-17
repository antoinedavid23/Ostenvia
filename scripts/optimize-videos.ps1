$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$workspaceRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$assets=Join-Path $projectRoot 'public/assets/media'
$archive=Join-Path $projectRoot 'media-jobs/video-originals'
if(!$assets.StartsWith($workspaceRoot+[IO.Path]::DirectorySeparatorChar) -or !$archive.StartsWith($workspaceRoot+[IO.Path]::DirectorySeparatorChar)){throw 'Asset paths outside workspace'}
New-Item -ItemType Directory -Force -Path $archive|Out-Null
$ffmpeg=Join-Path $workspaceRoot 'work/tools/ffmpeg.exe'
foreach($video in Get-ChildItem -LiteralPath $assets -Filter '*-motion.mp4'){
 if($video.BaseName -eq 'invoices-motion'){continue}
 $original=Join-Path $archive $video.Name
 if(Test-Path -LiteralPath $original){continue}
 $encoded=Join-Path $archive ($video.BaseName+'-encoded.mp4')
 & $ffmpeg -hide_banner -loglevel error -y -i $video.FullName -an -c:v libx264 -preset medium -crf 23 -threads 4 -pix_fmt yuv420p -movflags +faststart $encoded
 if($LASTEXITCODE -ne 0 -or (Get-Item -LiteralPath $encoded).Length -lt 10000){throw "Video encode failed: $($video.Name)"}
 Move-Item -LiteralPath $video.FullName -Destination $original
 Move-Item -LiteralPath $encoded -Destination $video.FullName
 Write-Output "$($video.Name): $([Math]::Round((Get-Item -LiteralPath $video.FullName).Length/1024)) KB"
}
$imageArchive=Join-Path $projectRoot 'media-jobs/originals'
foreach($png in Get-ChildItem -LiteralPath $assets -Filter '*.png'){
 if(Test-Path -LiteralPath (Join-Path $assets ($png.BaseName+'.webp'))){Move-Item -LiteralPath $png.FullName -Destination (Join-Path $imageArchive $png.Name) -Force}
}
& $ffmpeg -hide_banner -loglevel error -y -i (Join-Path $projectRoot 'public/assets/artisan-illustratif-v2.png') -vf 'scale=1254:-1' -c:v libwebp -quality 87 (Join-Path $projectRoot 'public/assets/artisan-illustratif-v2.webp')
