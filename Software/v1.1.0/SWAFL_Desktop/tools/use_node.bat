@echo off
rem Makes sure that node and npm can be found. Called by the other .bat files:  call "%~dp0tools\use_node.bat"
rem 1. already on the PATH  2. the usual install folders  3. the portable copy kept in tools\node  4. download a portable copy (no administrator rights needed)
where npm >nul 2>nul && goto :ok
for %%D in ("%ProgramFiles%\nodejs" "%ProgramFiles(x86)%\nodejs" "%LOCALAPPDATA%\Programs\nodejs" "%APPDATA%\nvm" "%~dp0node") do (
  if exist "%%~D\npm.cmd" (set "PATH=%%~D;%PATH%" & goto :ok)
)
echo.
echo Node.js was not found on this computer. SWAFL will download a portable copy (about 30 MB) into tools\node. It does not change anything else on your computer.
set "NODEV=v20.18.0"
set "NODEZIP=%TEMP%\swafl_node.zip"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri ('https://nodejs.org/dist/%NODEV%/node-%NODEV%-win-x64.zip') -OutFile '%NODEZIP%'; Expand-Archive -Force -Path '%NODEZIP%' -DestinationPath '%~dp0'; if (Test-Path '%~dp0node') { Remove-Item -Recurse -Force '%~dp0node' }; Rename-Item -Path ('%~dp0node-%NODEV%-win-x64') -NewName 'node'"
if exist "%~dp0node\npm.cmd" (set "PATH=%~dp0node;%PATH%" & goto :ok)
echo.
echo Could not download Node.js. Install it from https://nodejs.org (the LTS version, keep "Add to PATH" ticked), close this window and try again.
pause
exit /b 1
:ok
exit /b 0
