param([ValidateSet('images','videos','invoice-video')][string]$Mode='images')
$ErrorActionPreference='Stop'
$mediaJobRoot=Join-Path $PSScriptRoot '../media-jobs'
$kieHelper='C:/Users/Antoine/.agents/skills/kie-models/scripts/Invoke-Kie.ps1'
$mediaPlan=Get-Content -Raw (Join-Path $mediaJobRoot 'production-plan.json') | ConvertFrom-Json
if($Mode -eq 'invoice-video'){$mediaIds=@('invoices')}else{$mediaIds=$mediaPlan.ids}
foreach($mediaId in $mediaIds){
 $suffix=if($Mode -eq 'images'){''}else{'-motion'}
 if($Mode -eq 'images' -and $mediaId -eq 'invoices'){continue}
 $responseFile=Join-Path $mediaJobRoot ($mediaId+$suffix+'-created.json')
 if(Test-Path -LiteralPath $responseFile){$existingResponse=Get-Content -Raw $responseFile|ConvertFrom-Json;if($existingResponse.code -eq 200 -and $existingResponse.data.taskId){Write-Output "$mediaId$suffix already submitted";continue}}
 $requestFile=Join-Path $mediaJobRoot ($mediaId+$suffix+'-request.json')
 if(!(Test-Path -LiteralPath $requestFile)){Write-Output "$mediaId$suffix not ready";continue}
 & $kieHelper -Path '/api/v1/jobs/createTask' -Method POST -BodyFile ([IO.Path]::GetFullPath($requestFile)) -OutFile ([IO.Path]::GetFullPath($responseFile)) | Out-Null
 $submitted=Get-Content -Raw $responseFile|ConvertFrom-Json
 if($submitted.code -ne 200){throw "$mediaId$suffix rejected: $($submitted.code) $($submitted.msg)"}
 Write-Output "$mediaId$suffix submitted: $($submitted.data.taskId)"
}
