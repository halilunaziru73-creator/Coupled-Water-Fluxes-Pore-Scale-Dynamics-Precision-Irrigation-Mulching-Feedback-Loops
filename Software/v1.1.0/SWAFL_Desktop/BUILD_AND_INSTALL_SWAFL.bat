@echo off
cd /d "%~dp0"
call "%~dp0tools\use_node.bat" || exit /b 1
if not exist node_modules (call npm install)
call npm run get-app
pause
