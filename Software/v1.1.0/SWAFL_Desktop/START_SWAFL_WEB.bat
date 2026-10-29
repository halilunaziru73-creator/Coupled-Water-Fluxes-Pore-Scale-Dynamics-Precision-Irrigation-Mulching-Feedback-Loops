@echo off
title SWAFL web (keep this window open)
cd /d "%~dp0"
call "%~dp0tools\use_node.bat" || exit /b 1
node serve.js
pause
