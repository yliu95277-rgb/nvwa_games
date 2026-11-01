$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$editorPath = if ($env:COCOS_CREATOR) { $env:COCOS_CREATOR } else { 'C:/ProgramData/cocos/editors/Creator/3.8.8/CocosCreator.exe' }
$process = Start-Process -FilePath $editorPath -ArgumentList @('--project', $projectPath, '--build', "configPath=$projectPath/build-config.json") -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput "$projectPath/design/build-stdout.log" -RedirectStandardError "$projectPath/design/build-stderr.log"
$buildLog = Get-Content "$projectPath/design/build-stdout.log" -Raw
if ($buildLog -notmatch 'build Task .* Finished' -or !(Test-Path "$projectPath/build/web-desktop/index.html")) { throw "Creator build failed. Inspect design/build-stdout.log and build-stderr.log. Exit: $($process.ExitCode)" }
& node "$PSScriptRoot/prepare-web.mjs"
if ($LASTEXITCODE -ne 0) { throw 'Web preparation failed' }
Write-Output 'Cocos build and full viewport preparation succeeded.'
