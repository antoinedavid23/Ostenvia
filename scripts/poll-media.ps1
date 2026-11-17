param([switch]$ImagesOnly)
$ErrorActionPreference='Stop'
$jobRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../media-jobs'))
$assetRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public/assets/media'))
$helper='C:/Users/Antoine/.agents/skills/kie-models/scripts/Invoke-Kie.ps1'
$completed=0;$pending=0;$spent=0
foreach($created in Get-ChildItem -LiteralPath $jobRoot -Filter '*-created.json'){
 $jobName=$created.BaseName -replace '-created$',''
 if($ImagesOnly -and $jobName.EndsWith('-motion')){continue}
 $submission=Get-Content -Raw $created.FullName|ConvertFrom-Json
 if($submission.code -ne 200 -or !$submission.data.taskId){continue}
 $statusFile=Join-Path $jobRoot ($jobName+'-status.json')
 $status=$null
 if(Test-Path -LiteralPath $statusFile){$status=Get-Content -Raw $statusFile|ConvertFrom-Json}
 if(!$status -or $status.code -ne 200 -or @('success','fail') -notcontains $status.data.state){
  & $helper -Path ('/api/v1/jobs/recordInfo?taskId='+$submission.data.taskId) -OutFile $statusFile|Out-Null
  $status=Get-Content -Raw $statusFile|ConvertFrom-Json
 }
 if($status.code -ne 200){Write-Output "$jobName error $($status.code) $($status.msg)";continue}
 $spent+=$status.data.creditsConsumed
 if($status.data.state -eq 'success'){
  $completed++
  $ext=if($jobName.EndsWith('-motion')){'.mp4'}else{'.png'}
  $assetFile=Join-Path $assetRoot ($jobName+$ext)
  $result=$status.data.response
  if(!$result){$result=$status.data.resultJson|ConvertFrom-Json}
  $urls=$result.resultUrls
  if(!$urls){$urls=$result.data.result_urls}
  if(!$urls){$urls=$result.info.resultUrls}
  if(!$urls){Write-Output "$jobName success but result shape needs inspection";continue}
  $resultUri=[uri]$urls[0]
  if($resultUri.Scheme -ne 'https' -or $resultUri.UserInfo){throw 'Unexpected result URL'}
  $encodedImage=Join-Path $assetRoot ($jobName+'.webp')
  if(!(Test-Path -LiteralPath $assetFile) -and !(Test-Path -LiteralPath $encodedImage)){
   $partialFile=$assetFile+'.part'
   Invoke-WebRequest -Uri $resultUri.AbsoluteUri -OutFile $partialFile
   Move-Item -LiteralPath $partialFile -Destination $assetFile -Force
  }
  if(!$jobName.EndsWith('-motion')){
   $template=Get-Content -Raw (Join-Path $jobRoot ($jobName+'-motion-template.json'))|ConvertFrom-Json
   $template.input.image_urls=@($resultUri.AbsoluteUri)
   $template|ConvertTo-Json -Depth 20|Set-Content -Encoding utf8 (Join-Path $jobRoot ($jobName+'-motion-request.json'))
  }
  Write-Output "$jobName ready ($($status.data.creditsConsumed) credits)"
 }elseif($status.data.state -eq 'fail'){Write-Output "$jobName FAILED: $($status.data.failMsg)"}else{$pending++;Write-Output "$jobName $($status.data.state)"}
}
Write-Output "Complete: $completed. Pending: $pending. Recorded credits consumed: $spent."
